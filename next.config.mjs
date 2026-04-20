

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "**.kie.ai" },
    ],
  },
};

export default nextConfig;
