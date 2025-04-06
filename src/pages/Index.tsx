
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import ThreeJSBackground from '@/components/ThreeJSBackground';

const Index = () => {
  const { isDarkMode } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Add a slight delay to ensure smooth animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`min-h-screen flex flex-col ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <ThreeJSBackground />
      <NavBar isDarkMode={isDarkMode} />
      
      <main className="flex-grow">
        <HeroSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
