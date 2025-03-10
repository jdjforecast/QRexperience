import { useShopping, CartItem as CartItemType } from "@/contexts/ShoppingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import CartItem from "@/components/cart-item";
import CoinBadge from "@/components/ui/coin-badge";

export default function LiveCart() {
  const { 
    user,
    cart, 
    getCartTotal, 
    checkout,
    clearCart,
    coinAnimation
  } = useShopping();
  
  const [location, setLocation] = useLocation();
  
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    await checkout();
    setLocation(`/receipt/latest`);
  };
  
  const remainingCoins = user ? user.coins - getCartTotal() : 0;
  
  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Mi Carrito</CardTitle>
          
          <div className="flex items-center gap-3">
            <div className={`transition-all duration-300 ${coinAnimation ? 'scale-110' : 'scale-100'}`}>
              <CoinBadge coins={user?.coins || 0} />
            </div>
            
            {cart.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-gray-500 text-xs flex items-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i>
                Vaciar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-shopping-cart text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-600">Tu carrito está vacío</p>
            <p className="text-sm text-gray-500 mt-2">
              Escanea un producto para agregarlo
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {cart.map((product) => (
              <CartItem key={product.id} product={product} />
            ))}
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-800">Total:</span>
                <span className="flex items-center text-amber-500 font-semibold text-lg">
                  <i className="fa-solid fa-coins mr-2"></i>
                  <span>{getCartTotal()}</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-600">Te quedarán:</span>
                <span className={`flex items-center font-medium ${remainingCoins < 0 ? 'text-red-500' : 'text-green-600'}`}>
                  <i className="fa-solid fa-coins mr-2 text-sm"></i>
                  <span>{remainingCoins}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setLocation('/scanner')}
                  variant="outline"
                  className="bg-gray-50 text-gray-800 font-medium flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-qrcode"></i>
                  Escanear más
                </Button>
                
                <Button 
                  onClick={handleCheckout}
                  className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2"
                  disabled={cart.length === 0 || remainingCoins < 0}
                >
                  <i className="fa-solid fa-check-circle"></i>
                  Comprar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}