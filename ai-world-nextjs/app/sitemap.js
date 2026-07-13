export default function sitemap() {
  const baseUrl = 'https://ai.jinheestate.blog';
  
  const routes = [
    '',
    '/ai-news',
    '/ai-recommend',
    '/download',
    '/homepage',
    '/insights',
    '/about',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/ai-news' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
