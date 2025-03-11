import { useShopping } from "@/contexts/ShoppingContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import CoinBadge from "@/components/ui/coin-badge";
import LanguageToggle from "@/components/ui/language-toggle";

export default function Header() {
  const { user, showCart, setShowCart, cart } = useShopping();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  
  const navigateToRegister = () => {
    setLocation("/register");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => setLocation(user ? "/home" : "/")}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3082/3082259.png" 
            alt="Logo" 
            className="h-10 w-10 object-contain rounded-full shadow-sm mr-2"
          />
          <h1 className="text-xl font-semibold text-gray-800">QR Shop</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageToggle />
          
          {user ? (
            <div className="flex items-center">
              <div className="relative mr-3" style={{ display: cart.length > 0 ? 'block' : 'none' }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowCart(!showCart)}
                  className="p-2 text-gray-700 hover:text-primary transition"
                >
                  <i className="fa-solid fa-shopping-cart"></i>
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.length}
                  </span>
                </Button>
              </div>
              
              <CoinBadge coins={user.coins} />
              
              {/* My QRs button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/my-qrs")}
                className="ml-2 p-1.5 text-xs hidden sm:flex"
              >
                <i className="fa-solid fa-ticket mr-1"></i>
                Mis QRs
              </Button>
              
              {/* Admin button - for quick access to admin panel */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/admin")}
                className="ml-2 p-1.5 text-xs"
              >
                <i className="fa-solid fa-gear mr-1"></i>
                Admin
              </Button>
            </div>
          ) : (
            location !== "/register" && (
              <Button 
                onClick={navigateToRegister}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-1.5 transition"
              >
                <i className="fa-solid fa-user-plus"></i>
                {t("register.register")}
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
