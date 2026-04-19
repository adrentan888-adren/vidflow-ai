const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY;
const BASE = "https://api.upload-post.com/api";

export async function postVideo(user, platform, videoUrl, description) {
  const formData = new FormData();
  formData.append("user", user);
  formData.append("platform[]", platform);
  formData.append("video", videoUrl);
  formData.append("description", description);
  formData.append("async_upload", "true");

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Apikey ${UPLOAD_POST_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload-post /upload failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(`upload-post error: ${JSON.stringify(data)}`);

  return data.results?.[platform]?.url;
}
