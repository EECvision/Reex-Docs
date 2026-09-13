import nextra from 'nextra'

const withNextra = nextra({
    // theme: 'nextra-theme-docs', // Not needed in v4 App Router? Let's check docs or stick to standard v4 init
    // themeConfig: './theme.config.jsx' // Removed in v4?
})

export default withNextra({
    // Next.js config
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/docs/:path*',
                destination: '/:path*',
                permanent: true,
            },
        ]
    },
    transpilePackages: ['nextra', 'nextra-theme-docs'],
})
