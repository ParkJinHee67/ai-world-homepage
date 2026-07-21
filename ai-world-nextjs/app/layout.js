import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LanguageProvider } from "./LanguageContext";

export const metadata = {
  metadataBase: new URL("https://ai.jinheestate.blog"),
  title: "톱니바꿈 AI월드",
  description: "AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 기술적 인사이트를 만나보세요.",
  icons: {
    icon: "/favicon.svg",
  }
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "톱니바꿈 AI월드",
    "url": "https://ai.jinheestate.blog/",
    "description": "AI 기술을 활용하여 제작한 혁신적인 어플리케이션과 가치 있는 기술적 인사이트를 만나보세요.",
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
