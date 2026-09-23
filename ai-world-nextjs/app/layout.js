import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LanguageProvider } from "./LanguageContext";

export const metadata = {
  metadataBase: new URL("https://ai.jinheestate.blog"),
  title: "톱니바꿈 AI월드",
  description: "쓰는 AI, 파는 AI. 실무 AI 도구·자동화·외주 솔루션을 한곳에서.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "AI월드",
  },
};

export const viewport = {
  themeColor: "#030207",
};


export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "톱니바꿈 AI월드",
    "url": "https://ai.jinheestate.blog/",
    "description": "쓰는 AI, 파는 AI. 실무 AI 도구·자동화·외주 솔루션을 한곳에서.",
    "publisher": {
      "@type": "Organization",
      "name": "톱니바꿈 AI월드",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ai.jinheestate.blog/favicon.svg"
      }
    }
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <div style={styles.appWrapper}>
            <Navbar />
            
            <main style={styles.mainContent}>
              {children}
            </main>

            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  }
};
