export default function sitemap() {
  const baseUrl = 'https://ai-world-homepage.vercel.app';
  
  const routes = [
    '',
    '/ai-news',
    '/ai-recommend',
    '/download',
    '/homepage',
    '/insights',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/ai-news' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
