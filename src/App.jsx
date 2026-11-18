import { useCallback, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Loader from './components/Loader/Loader.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import Marquee from './components/Marquee/Marquee.jsx';
import About from './components/About/About.jsx';
import Statistics from './components/Statistics/Statistics.jsx';
import ProductCatalog from './components/ProductCatalog/ProductCatalog.jsx';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs.jsx';
import MissionVision from './components/MissionVision/MissionVision.jsx';
import QualityStandards from './components/QualityStandards/QualityStandards.jsx';
import Gallery from './components/Gallery/Gallery.jsx';
import GlobalPresence from './components/GlobalPresence/GlobalPresence.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/Footer/Footer.jsx';
import ScrollProgress from './components/common/ScrollProgress.jsx';

export default function App() {
  // Lets a product modal pre-fill the contact form ("Request information").
  const [inquiry, setInquiry] = useState('');
  const requestProduct = useCallback((productName) => {
    setInquiry(
      `Hello, I am interested in your ${productName}. Please share more information about availability and export options.`
    );
    requestAnimationFrame(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">Skip to content</a>
      <Loader />
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Statistics />
        <ProductCatalog onRequest={requestProduct} />
        <WhyChooseUs />
        <MissionVision />
        <QualityStandards />
        <Gallery />
        <GlobalPresence />
        <Contact inquiry={inquiry} />
      </main>
      <Footer />
    </MotionConfig>
  );
}
