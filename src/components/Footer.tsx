
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-gradient-teal">AI</span> Grievance
            </h3>
            <p className="text-foreground/70">
              Revolutionizing how startups handle grievances with AI-powered solutions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-foreground/70 hover:text-teal transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-foreground/70 hover:text-teal transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-foreground/70 hover:text-teal transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-foreground/70 hover:text-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-foreground/70">
              <li>hello@aigrievance.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 AI Street, Tech Valley</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-foreground/60">
          <p>&copy; {new Date().getFullYear()} AI Grievance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
