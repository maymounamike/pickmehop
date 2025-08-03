import { Facebook, Instagram, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-dark-base text-white py-16 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-base via-dark-base to-primary/20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Logo and Help */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
                alt="Pick Me Hop Logo" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <span className="font-display font-semibold text-xl">Pick Me Hop</span>
            </div>
            <p className="text-white/80 leading-relaxed text-sm">
              Your trusted partner for comfortable and reliable airport transfers in Paris.
            </p>
            
            <div className="flex items-center space-x-2 text-white/80 hover:text-secondary cursor-pointer transition-colors duration-300 group">
              <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium text-sm">Need Help?</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-xl mb-6 text-secondary">Quick Links</h3>
            <ul className="space-y-4">
              <li><button onClick={() => navigate("/services")} className="text-white/80 hover:text-secondary hover:translate-x-2 transition-all duration-300 text-left font-medium">Services</button></li>
              <li><button onClick={() => navigate("/about")} className="text-white/80 hover:text-secondary hover:translate-x-2 transition-all duration-300 text-left font-medium">About Us</button></li>
              <li><button onClick={() => navigate("/contact")} className="text-white/80 hover:text-secondary hover:translate-x-2 transition-all duration-300 text-left font-medium">Contact</button></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-display font-bold text-xl mb-6 text-highlight">Secure Payments</h3>
            <div className="space-y-4">
              <p className="text-white/80 font-medium">✓ All Major Credit Cards</p>
              <p className="text-white/80 font-medium">✓ PayPal</p>
              <p className="text-white/80 font-medium">✓ Cash Payments</p>
              <div className="flex items-center space-x-2 mt-6 p-3 bg-gradient-primary rounded-lg backdrop-blur-sm shadow-glow">
                <span className="text-sm text-white/90">Powered by</span>
                <span className="font-bold text-white">Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media and Copyright */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/16fdFjqCsh/?mibextid=wwXIfr" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary hover:scale-110 hover:shadow-glow transition-all duration-300 backdrop-blur-sm group"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
              </a>
              <a 
                href="https://www.instagram.com/pickmehop?igsh=M3NyN2xvamc5cml6&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent hover:scale-110 hover:shadow-glow transition-all duration-300 backdrop-blur-sm group"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
              </a>
            </div>

            {/* Copyright and Legal Links */}
            <div className="text-white/60 text-sm flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <span className="font-medium">© 2024 - 2025 Pick Me Hop. All rights reserved.</span>
              <div className="flex space-x-6">
                <button 
                  onClick={() => navigate("/terms")} 
                  className="hover:text-secondary hover:scale-105 transition-all duration-300 font-medium"
                >
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="hover:text-secondary hover:scale-105 transition-all duration-300 font-medium"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;