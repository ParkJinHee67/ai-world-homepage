export default function manifest() {
  return {
    name: '톱니바꿈 AI월드',
    short_name: 'AI월드',
    description: 'AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 기술적 인사이트를 만나보세요.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030207',
    theme_color: '#030207',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
