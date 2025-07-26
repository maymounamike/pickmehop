import { Facebook, Instagram, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

          {/* About Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">ABOUT</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Company</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Refer a friend</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Settings</a></li>
            </ul>
          </div>

          {/* Network Section */}
          <div>
            <h3 className="font-semibold text-lg mb-4">NETWORK</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Hotels</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vacation Rentals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Affiliates</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Individual Drivers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Driver Companies</a></li>
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
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © 2024 - 2025 All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;