import cron from "node-cron";
import { PrismaClient } from "../node_modules/@prisma/client/default.js";
import { createVideoTask, pollUntilDone } from "./kie.js";
import { postVideo } from "./uploadpost.js";

const prisma = new PrismaClient();

// Run at 00:00, 04:00, 08:00, 12:00, 16:00, 20:00 KL time (UTC+8)
// Cron runs in UTC, so KL midnight = UTC 16:00, KL 04:00 = UTC 20:00, etc.
// We use "every 4 hours" schedule and let DB-level nextRunAt control per-campaign timing
const CRON_SCHEDULE = "0 */4 * * *"; // every 4 hours UTC

async function runDueCampaigns() {
  const now = new Date();
  console.log(`\n[worker] Tick at ${now.toISOString()}`);

  const dueCampaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
  });

  if (dueCampaigns.length === 0) {
    console.log("[worker] No campaigns due.");
    return;
  }

  console.log(`[worker] ${dueCampaigns.length} campaign(s) due.`);

  for (const campaign of dueCampaigns) {
    await processCampaign(campaign);
  }
}

async function processCampaign(campaign) {
  console.log(`\n[campaign] Starting: ${campaign.name} (${campaign.id})`);

  // Pick a random image from the campaign's pool
  const imageUrl = campaign.imageUrls[Math.floor(Math.random() * campaign.imageUrls.length)];

  // Schedule next run immediately so it won't re-trigger while this one runs
  const nextRunAt = new Date(Date.now() + campaign.intervalHours * 60 * 60 * 1000);
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { nextRunAt },
  });

  // Create post record
  const post = await prisma.post.create({
    data: {
      campaignId: campaign.id,
      status: "generating",
      imageUsed: imageUrl,
      scheduledAt: new Date(),
    },
  });

  try {
    // Step 1: Generate video via kie.ai
    console.log(`[kie] Submitting task for campaign ${campaign.id}`);
    const taskId = await createVideoTask(imageUrl, campaign.prompt);
    await prisma.post.update({ where: { id: post.id }, data: { kieTaskId: taskId } });

    console.log(`[kie] Task submitted: ${taskId} — polling...`);
    const videoUrl = await pollUntilDone(taskId);
    console.log(`[kie] Video ready: ${videoUrl}`);

    await prisma.post.update({
      where: { id: post.id },
      data: { status: "posting", videoUrl },
    });

    // Step 2: Post to social media via upload-post
    console.log(`[upload-post] Posting to ${campaign.platform} as ${campaign.channelUser}`);
    const postUrl = await postVideo(
      campaign.channelUser,
      campaign.platform,
      videoUrl,
      campaign.prompt
    );

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: "done",
        postUrl: postUrl ?? null,
        completedAt: new Date(),
      },
    });

    console.log(`[done] Campaign ${campaign.name} posted successfully. PostURL: ${postUrl ?? "async"}`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[error] Campaign ${campaign.name}: ${error}`);
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "failed", error, completedAt: new Date() },
    });
  }
}

// Run immediately on startup, then on schedule
console.log("[worker] VidFlow AI Worker starting...");
console.log(`[worker] Schedule: ${CRON_SCHEDULE} UTC (every 4h)`);
console.log(`[worker] Timezone: Asia/Kuala_Lumpur`);

runDueCampaigns().catch(console.error);

cron.schedule(CRON_SCHEDULE, () => {
  runDueCampaigns().catch(console.error);
});

// Keep process alive
process.on("SIGTERM", async () => {
  console.log("[worker] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
