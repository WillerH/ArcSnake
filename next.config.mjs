/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "",
  assetPrefix: undefined,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  webpack: (config, { webpack }) => {
    // Ignore test files and benchmarks from thread-stream
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/(test|bench)/,
        contextRegExp: /thread-stream/,
      })
    );

    return config;
  },
};

export default nextConfig;
