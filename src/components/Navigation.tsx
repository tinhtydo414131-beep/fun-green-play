import { Gamepad2 } from "lucide-react";
import { NavLink } from "./NavLink";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary-dark transition-colors">
            <Gamepad2 className="w-8 h-8" />
            <span>FUN GAME</span>
          </NavLink>
          
          <div className="flex items-center gap-8">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              activeClassName="text-primary"
            >
              Trang chủ
            </NavLink>
            <NavLink 
              to="/games" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              activeClassName="text-primary"
            >
              Tất cả game
            </NavLink>
            <NavLink 
              to="/categories" 
              className="text-foreground hover:text-primary transition-colors font-medium"
              activeClassName="text-primary"
            >
              Thể loại
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
