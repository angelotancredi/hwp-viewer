/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // hwp.js and other libraries might try to use node-only modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                child_process: false,
                net: false,
                tls: false,
                crypto: false,
                os: false,
                stream: false,
                buffer: false,
            };
        }
        return config;
    },
};

module.exports = withPWA(nextConfig);
