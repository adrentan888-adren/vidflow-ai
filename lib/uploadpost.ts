const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY!;
const BASE = "https://api.upload-post.com/api";

export interface SocialAccount {
  platform: string;
  displayName: string;
  avatar?: string;
}

export interface UserProfile {
  username: string;
  socialAccounts: SocialAccount[];
}

export async function getConnectedProfiles(): Promise<UserProfile[]> {
  const res = await fetch(`${BASE}/uploadposts/users`, {
    headers: { Authorization: `Apikey ${UPLOAD_POST_KEY}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`upload-post /users failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error("upload-post returned success=false");

  return (data.profiles as Array<{
    username: string;
    social_accounts: Record<string, { display_name?: string; social_images?: string } | string>;
  }>).map((p) => ({
    username: p.username,
    socialAccounts: Object.entries(p.social_accounts)
      .filter(([, v]) => v && typeof v === "object")
      .map(([platform, info]) => ({
        platform,
        displayName: (info as { display_name?: string }).display_name ?? platform,
        avatar: (info as { social_images?: string }).social_images,
      })),
  }));
}

export async function postVideo(
  user: string,
  platform: string,
  videoUrl: string,
  description: string
): Promise<string | undefined> {
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

  // Return post URL if available
  return data.results?.[platform]?.url as string | undefined;
}
