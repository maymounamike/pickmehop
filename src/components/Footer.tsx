import { Facebook, Instagram, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Logo and Help */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/fd647c9d-74ed-4206-99d0-9b04a8f86b41.png" 
                alt="Pick Me Hop Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-lg">Pick Me Hop</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">QUICK LINKS</h3>
            <ul className="space-y-3 text-gray-300">
              <li><button onClick={() => navigate("/services")} className="hover:text-white transition-colors text-left">Services</button></li>
              <li><button onClick={() => navigate("/about")} className="hover:text-white transition-colors text-left">About Us</button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-white transition-colors text-left">Contact</button></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-lg mb-4">PAYMENT METHODS</h3>
            <div className="space-y-3 text-gray-300">
              <p>All Credit Cards Accepted</p>
              <p>PayPal</p>
              <div className="flex items-center space-x-2 mt-4">
                <span className="text-sm">Secure payments by</span>
                <span className="font-medium">Stripe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media and Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/16fdFjqCsh/?mibextid=wwXIfr" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/pickmehop?igsh=M3NyN2xvamc5cml6&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright and Legal Links */}
            <div className="text-gray-400 text-sm flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <span>© 2024 - 2025 All rights reserved.</span>
              <div className="flex space-x-4">
                <button 
                  onClick={() => navigate("/terms")} 
                  className="hover:text-white transition-colors"
                >
                  Terms & Conditions
                </button>
                <button 
                  onClick={() => navigate("/privacy")} 
                  className="hover:text-white transition-colors"
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