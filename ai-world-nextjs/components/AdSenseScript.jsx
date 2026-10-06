import Script from 'next/script';

// Google AdSense (Auto ads) loader.
// Loaded ONLY from the ai-news / insights / free-tools segment layouts.
// Do NOT add this to app/layout.js (homepage, products, outsourcing, download,
// admin and purchase pages must stay ad-free).
const ADSENSE_CLIENT = 'ca-pub-7844774853398041';

export default function AdSenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
