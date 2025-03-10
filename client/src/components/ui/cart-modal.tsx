import { useShopping } from "@/contexts/ShoppingContext";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/cart-item";
import { useLocation } from "wouter";

export default function CartModal() {
  const { 
    showCart, 
    setShowCart, 
    cart, 
    getCartTotal, 
    checkout
  } = useShopping();
  
  const [location, setLocation] = useLocation();
  
  const handleCheckout = async () => {
    await checkout();
    setShowCart(false);
    setLocation(`/receipt/latest`);
  };
  
  if (!showCart) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gray-900/50 flex items-end sm:items-center justify-center z-50 px-4 py-6"
      onClick={() => setShowCart(false)}
    >
      <div 
        className="bg-white rounded-t-lg sm:rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Mi Carrito</h2>
            <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-shopping-cart text-gray-400 text-xl"></i>
              </div>
              <p className="text-gray-600">Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {cart.map((product) => (
                <CartItem key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {cart.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-800">Total:</span>
                <span className="flex items-center text-amber-500 font-semibold text-lg">
                  <i className="fa-solid fa-coins mr-2"></i>
                  <span>{getCartTotal()}</span>
                </span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-sm flex items-center justify-center gap-2"
                disabled={cart.length === 0}
              >
                <i className="fa-solid fa-check-circle"></i>
                Finalizar Compra
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
