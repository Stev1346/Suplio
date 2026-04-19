import type { NextConfig } from "next";
import path from "path";

function supabaseImageRemotePatterns(): {
  protocol: "https";
  hostname: string;
  pathname: string;
}[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { hostname } = new URL(url);
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images:{
    remotePatterns: supabaseImageRemotePatterns()
  },
  turbopack: {
    root: path.resolve(__dirname),
  }
};

export default nextConfig;
