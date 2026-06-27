import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AINews from './pages/AINews';
import AIRecommend from './pages/AIRecommend';
import Websites from './pages/Websites';
import Insights from './pages/Insights';
import Admin from './pages/Admin';
import ImageDownload from './pages/ImageDownload';

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.appWrapper}>
        <Navbar />
        
        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-news" element={<AINews />} />
            <Route path="/ai-recommend" element={<AIRecommend />} />
            <Route path="/homepage" element={<Websites />} />
            <Route path="/download" element={<ImageDownload />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
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
