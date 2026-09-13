import nextra from 'nextra'

const withNextra = nextra({
    mdxOptions: {
        rehypePrettyCodeOptions: {
            theme: { light: 'github-light-high-contrast', dark: 'github-dark' },
        },
    },
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
