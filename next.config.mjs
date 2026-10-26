/** @type {import('next').NextConfig} */
const nextConfig = {
  // Plain static files for Firebase Hosting (free Spark plan, no server).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
