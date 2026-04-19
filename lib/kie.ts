const KIE_API_KEY = process.env.KIE_API_KEY!;
const KIE_BASE = "https://api.kie.ai/api/v1/jobs";

export async function createVideoTask(imageUrl: string, prompt: string): Promise<string> {
  const res = await fetch(`${KIE_BASE}/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-imagine/image-to-video",
      input: {
        image_urls: [imageUrl],
        prompt,
        mode: "normal",
        duration: "10",
        resolution: "720p",
        aspect_ratio: "9:16",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`kie.ai createTask failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.code !== 200) throw new Error(`kie.ai error: ${data.msg}`);
  return data.data.taskId as string;
}

export type TaskStatus = "waiting" | "queuing" | "generating" | "success" | "fail";

export interface TaskResult {
  state: TaskStatus;
  videoUrl?: string;
}

export async function getTaskStatus(taskId: string): Promise<TaskResult> {
  const res = await fetch(`${KIE_BASE}/recordInfo?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${KIE_API_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`kie.ai recordInfo failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (data.code !== 200) throw new Error(`kie.ai error: ${data.msg}`);

  const { state, resultJson } = data.data;

  if (state === "success" && resultJson) {
    const parsed = JSON.parse(resultJson) as { resultUrls?: string[] };
    const videoUrl = parsed.resultUrls?.[0];
    return { state, videoUrl };
  }

  return { state };
}

export async function pollUntilDone(
  taskId: string,
  intervalMs = 10_000,
  maxAttempts = 60
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTaskStatus(taskId);
    if (result.state === "success") {
      if (!result.videoUrl) throw new Error("kie.ai succeeded but no video URL returned");
      return result.videoUrl;
    }
    if (result.state === "fail") throw new Error("kie.ai task failed");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`kie.ai task timed out after ${maxAttempts} attempts`);
}
