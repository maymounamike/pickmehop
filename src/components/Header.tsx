import { Button } from "@/components/ui/button";
import HelpDialog from "./HelpDialog";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/298c0d83-9fd2-4556-aeff-ab20854f90c7.png" 
            alt="Pick Me Hop Logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          />
          <span className="text-white font-semibold text-base sm:text-lg">Pick Me Hop</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {/* Navigation items removed as requested */}
        </nav>

        <HelpDialog>
          <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10 text-sm sm:text-base min-h-[44px] px-3 sm:px-4">
            Help
          </Button>
        </HelpDialog>
      </div>
    </header>
  );
};

export default Header;