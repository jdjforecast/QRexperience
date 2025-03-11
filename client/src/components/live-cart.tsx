import { useShopping, CartItem as CartItemType } from "@/contexts/ShoppingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import CartItem from "@/components/cart-item";
import CoinBadge from "@/components/ui/coin-badge";
import { motion, AnimatePresence } from "framer-motion";

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
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0] 
                }}
                transition={{ 
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 5
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </motion.div>
            </div>
            <CardTitle className="text-lg font-bold">Mi Carrito</CardTitle>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05 }}
            >
              <CoinBadge coins={user?.coins || 0} />
            </motion.div>
            
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="text-gray-500 text-xs flex items-center gap-1.5 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Vaciar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            <motion.div 
              key="empty-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mx-auto mb-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                
                {/* Elementos decorativos */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-primary/10 rounded-full"></div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-gray-700 font-medium">Tu carrito está vacío</p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Escanea códigos QR de productos para agregarlos a tu carrito de compras
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-5"
                >
                  <Button 
                    onClick={() => setLocation('/scanner')}
                    className="bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="8" y2="3"></line>
                      <line x1="16" y1="21" x2="16" y2="3"></line>
                      <line x1="3" y1="16" x2="21" y2="16"></line>
                      <line x1="3" y1="8" x2="21" y2="8"></line>
                    </svg>
                    Escanear Productos
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="filled-cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 mb-6"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {cart.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    transition={{ type: "spring" }}
                  >
                    <CartItem product={product} />
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-t pt-4 mt-4"
              >
                <div className="bg-amber-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <span className="font-medium text-amber-900">Total:</span>
                    </div>
                    <span className="flex items-center text-amber-600 font-bold text-lg">
                      <motion.div
                        animate={{ 
                          rotateZ: coinAnimation ? [0, 10, -10, 10, 0] : 0 
                        }}
                        transition={{ duration: 0.5 }}
                        className="mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="8" r="7"></circle>
                          <circle cx="16" cy="16" r="7"></circle>
                        </svg>
                      </motion.div>
                      <span>{getCartTotal()}</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700">Balance final:</span>
                    <motion.span 
                      animate={remainingCoins < 0 ? 
                        { x: [0, -3, 3, -3, 0] } : 
                        {}
                      }
                      transition={{ repeat: remainingCoins < 0 ? 2 : 0, duration: 0.2 }}
                      className={`flex items-center font-medium ${remainingCoins < 0 ? 'text-red-500' : 'text-green-600'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="8" r="6"></circle>
                      </svg>
                      <span>{remainingCoins}</span>
                    </motion.span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={() => setLocation('/scanner')}
                      variant="outline"
                      className="bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-medium w-full flex items-center justify-center gap-2 group transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="8" y2="3"></line>
                        <line x1="16" y1="21" x2="16" y2="3"></line>
                        <line x1="3" y1="16" x2="21" y2="16"></line>
                        <line x1="3" y1="8" x2="21" y2="8"></line>
                      </svg>
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        Escanear más
                      </span>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: remainingCoins >= 0 ? 1.02 : 1 }}
                    whileTap={{ scale: remainingCoins >= 0 ? 0.98 : 1 }}
                  >
                    <Button 
                      onClick={handleCheckout}
                      className={`bg-primary hover:bg-primary/90 text-white font-medium w-full flex items-center justify-center gap-2 ${remainingCoins < 0 ? 'opacity-50 cursor-not-allowed' : 'shadow-md'}`}
                      disabled={cart.length === 0 || remainingCoins < 0}
                    >
                      <motion.div
                        animate={remainingCoins >= 0 ? { 
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{ 
                          repeat: Infinity,
                          repeatDelay: 5,
                          duration: 0.5
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </motion.div>
                      <span>Comprar Ahora</span>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}