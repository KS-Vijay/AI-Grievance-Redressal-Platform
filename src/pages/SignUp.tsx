
import { useTheme } from '@/context/ThemeContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';
import ThreeJSBackground from '@/components/ThreeJSBackground';

const SignUp = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col">
      <ThreeJSBackground className="opacity-50" />
      <NavBar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md animate-slide-up">
          <AuthForm formType="signup" />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
