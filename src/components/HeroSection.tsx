
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-10 flex flex-col justify-center">
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-3d animate-slide-up">
            <span className="text-gradient-teal block mb-2">Revolutionize</span>
            <span>Startup Grievances with</span>
            <span className="text-gradient-coral block mt-2">AI Precision</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/80 mb-8 animate-slide-up animate-delay-100">
            Submit a grievance, get an AI-crafted response—unleash the future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up animate-delay-200">
            <Link to="/signup">
              <Button 
                className="relative px-8 py-6 text-lg transition-all duration-300 bg-teal hover:bg-teal/90
                transform hover:-translate-y-1 hover:glow-teal w-full sm:w-auto"
              >
                Sign Up
              </Button>
            </Link>
            
            <Link to="/signin">
              <Button 
                variant="outline" 
                className="relative px-8 py-6 text-lg border-coral text-coral hover:text-foreground
                hover:bg-coral/20 transition-all duration-300 transform hover:-translate-y-1
                hover:glow-coral w-full sm:w-auto"
              >
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up animate-delay-300">
            <div className="glassmorphism p-6 rounded-xl hover-lift">
              <h3 className="text-xl font-bold mb-2 text-gradient-teal">Smart Analysis</h3>
              <p className="text-foreground/80">AI-powered analysis identifies patterns and suggests optimal resolutions.</p>
            </div>
            
            <div className="glassmorphism p-6 rounded-xl hover-lift animate-delay-100">
              <h3 className="text-xl font-bold mb-2 text-gradient-coral">Fast Resolution</h3>
              <p className="text-foreground/80">Get immediate responses and actionable insights for your concerns.</p>
            </div>
            
            <div className="glassmorphism p-6 rounded-xl hover-lift animate-delay-200">
              <h3 className="text-xl font-bold mb-2 text-gradient-teal">Startup Focused</h3>
              <p className="text-foreground/80">Specifically designed for the unique challenges startups face daily.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
