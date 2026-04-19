const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_BASE = "https://api.kie.ai/api/v1/jobs";

export async function createVideoTask(imageUrl, prompt) {
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
  return data.data.taskId;
}

export async function getTaskStatus(taskId) {
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
    const parsed = JSON.parse(resultJson);
    const videoUrl = parsed.resultUrls?.[0];
    return { state, videoUrl };
  }

  return { state };
}

export async function pollUntilDone(taskId, intervalMs = 10_000, maxAttempts = 72) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTaskStatus(taskId);
    console.log(`[kie] task ${taskId} state=${result.state} attempt=${i + 1}`);
    if (result.state === "success") {
      if (!result.videoUrl) throw new Error("kie.ai succeeded but no video URL");
      return result.videoUrl;
    }
    if (result.state === "fail") throw new Error("kie.ai task failed");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`kie.ai task timed out after ${maxAttempts} attempts`);
}
