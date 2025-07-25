import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-sm">W</span>
          </div>
          <span className="text-white font-semibold text-lg">Welcome Pickups</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-white hover:text-accent transition-colors">Transfers</a>
          <a href="#" className="text-white hover:text-accent transition-colors">Sightseeing Rides</a>
          <a href="#" className="text-white hover:text-accent transition-colors">Guides</a>
          <a href="#" className="text-white hover:text-accent transition-colors">For Partners</a>
          <a href="#" className="text-white hover:text-accent transition-colors">For Drivers</a>
          <a href="#" className="text-white hover:text-accent transition-colors">Company</a>
        </nav>

        <Button variant="ghost" className="text-white hover:text-accent hover:bg-white/10">
          Help
        </Button>
      </div>
    </header>
  );
};

export default Header;