export default function robots() {
  const baseUrl = 'https://ai-world-homepage.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
