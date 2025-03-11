import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LiveCart from "@/components/live-cart";
import { useShopping } from "@/contexts/ShoppingContext";
import { useQuery } from "@tanstack/react-query";
import { BrandSettings } from "@/contexts/ShoppingContext";
import { motion } from "framer-motion";
import CoinAnimation from "@/components/ui/coin-animation";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, setSelectedProduct, coinAnimation } = useShopping();
  
  // Consulta para obtener la configuración de marca
  const { data: brandSettings } = useQuery<BrandSettings>({
    queryKey: ['/api/brand-settings']
  });
  
  // If not logged in, redirect to welcome page
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleOpenScanner = () => {
    setLocation("/scanner");
  };
  
  // Configuración de animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Welcome message */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Bienvenido, {user.name.split(' ')[0]}!
            </h2>
          </div>
          
          {/* SALE Banner - Solo se muestra si hay una imagen configurada */}
          {brandSettings?.saleImageUrl && (
            <div className="mb-6 overflow-hidden rounded-lg shadow-md">
              <img 
                src={brandSettings.saleImageUrl} 
                alt="Oferta Especial" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {/* Live Cart */}
          <LiveCart />
          
          {/* Scanner option */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
          >
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Contenido visual */}
                  <div className="relative h-48 md:h-auto overflow-hidden bg-gradient-to-r from-primary/80 to-primary">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-36 h-36 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <rect x="7" y="7" width="3" height="3"></rect>
                        <rect x="14" y="7" width="3" height="3"></rect>
                        <rect x="7" y="14" width="3" height="3"></rect>
                        <rect x="14" y="14" width="3" height="3"></rect>
                      </svg>
                    </div>
                    
                    {/* Decoración con puntos animados */}
                    <div className="absolute top-6 left-6">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2
                        }}
                        className="w-16 h-16 rounded-full bg-white/10"
                      />
                    </div>
                    <div className="absolute bottom-8 right-8">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 3,
                          delay: 0.5
                        }}
                        className="w-12 h-12 rounded-full bg-white/10"
                      />
                    </div>
                  </div>
                  
                  {/* Contenido textual */}
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9h6v6H3z"></path>
                          <path d="M9 3h6v6H9z"></path>
                          <path d="M15 9h6v6h-6z"></path>
                          <path d="M9 15h6v6H9z"></path>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Escanear Producto</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-5">
                      Utiliza la cámara de tu dispositivo para escanear el código QR del producto que deseas comprar.
                    </p>
                    
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={handleOpenScanner}
                        className="bg-primary hover:bg-primary/90 text-white font-medium w-full py-6 shadow-md flex items-center justify-center gap-2 group transition-all duration-300"
                      >
                        <motion.div
                          animate={{ rotate: [0, 15, 0, -15, 0] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                            repeatType: "loop",
                            ease: "easeInOut",
                            times: [0, 0.2, 0.5, 0.8, 1]
                          }}
                          className="mr-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                            <path d="M7.21 15.89A7 7 0 1 1 15.89 7.21"></path>
                            <path d="M22 22 L16 16"></path>
                          </svg>
                        </motion.div>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">Abrir Escáner</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Ayuda/Instrucciones */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-6"
          >
            <Card className="overflow-hidden border border-gray-100">
              <CardContent className="p-0">
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Cómo funciona</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Paso 1 */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 9h6v6H3z"></path>
                          <path d="M9 3h6v6H9z"></path>
                          <path d="M15 9h6v6h-6z"></path>
                          <path d="M9 15h6v6H9z"></path>
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">Escanea productos</h4>
                      <p className="text-gray-600 text-sm">Usa el escáner para agregar productos a tu carrito virtual</p>
                    </motion.div>
                    
                    {/* Paso 2 */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center relative"
                    >
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 2
                          }}
                        >2</motion.span>
                      </div>
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">Revisa tu carrito</h4>
                      <p className="text-gray-600 text-sm">Verifica los productos agregados y el total a pagar</p>
                    </motion.div>
                    
                    {/* Paso 3 */}
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                          <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        
                        {/* Animación de monedas */}
                        <motion.div
                          animate={{ 
                            y: [0, -15, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 2,
                            delay: 1
                          }}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center">
                            <span className="text-yellow-800 text-[6px] font-bold">$</span>
                          </div>
                        </motion.div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-2">Finaliza tu compra</h4>
                      <p className="text-gray-600 text-sm">Completa la transacción y recibe tu recibo digital</p>
                    </motion.div>
                  </div>
                  
                  {/* Línea de progreso */}
                  <div className="mt-8 px-3">
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ 
                          duration: 2.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                          repeatDelay: 1
                        }}
                        className="absolute h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Animación de monedas */}
            <CoinAnimation active={coinAnimation} />
          </motion.div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
