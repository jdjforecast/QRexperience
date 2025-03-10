import { useShopping } from "@/contexts/ShoppingContext";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const { user, setShowCart, cart } = useShopping();
  const [location, setLocation] = useLocation();
  
  if (!user) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 sm:hidden z-10">
      <div className="flex justify-around">
        <button 
          onClick={() => setLocation("/home")} 
          className={cn(
            "flex flex-col items-center text-sm",
            location === "/home" ? "text-primary" : "text-gray-500"
          )}
        >
          <i className="fa-solid fa-house text-xl mb-1"></i>
          <span>Inicio</span>
        </button>
        
        <button 
          onClick={() => setLocation("/scanner")} 
          className={cn(
            "flex flex-col items-center text-sm",
            location === "/scanner" ? "text-primary" : "text-gray-500"
          )}
        >
          <i className="fa-solid fa-qrcode text-xl mb-1"></i>
          <span>Escanear</span>
        </button>
        
        <button 
          onClick={() => setShowCart(true)} 
          className="flex flex-col items-center text-sm text-gray-500 relative"
        >
          <i className="fa-solid fa-shopping-cart text-xl mb-1"></i>
          <span>Carrito</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
