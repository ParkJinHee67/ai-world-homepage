import AdSenseScript from '../../components/AdSenseScript';

export default function Layout({ children }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
