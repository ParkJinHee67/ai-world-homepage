export default function robots() {
  const baseUrl = 'https://ai.jinheestate.blog';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
