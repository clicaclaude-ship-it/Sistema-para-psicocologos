import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Set explicit output file tracing root to silence workspace detection warning
  outputFileTracingRoot: path.join(__dirname),
}

export default nextConfig
