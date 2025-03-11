import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { useShopping } from "@/contexts/ShoppingContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FaUserPlus, FaQrcode, FaShoppingCart, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Welcome() {
  const [location, setLocation] = useLocation();
  const { user } = useShopping();
  const { t } = useLanguage();
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);
  
  const handleGetStarted = () => {
    setLocation("/register");
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-full max-w-5xl mb-10 rounded-xl overflow-hidden shadow-lg relative">
            <img 
              src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1200&h=500&fit=crop&crop=center" 
              alt="QR Shopping Experience" 
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 md:p-10 text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-3">{t("welcome.title")}</h1>
                <p className="text-lg md:text-xl max-w-2xl">
                  {t("welcome.subtitle")}
                </p>
              </div>
            </div>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Experiencia QR de Compra Virtual</h2>
              <p className="text-gray-600">
                Descubre una nueva forma de comprar con tecnología QR
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={item}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <FaUserPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{t("register.register")}</h3>
                    <p className="text-gray-600">
                      Crea tu cuenta y recibe 100 monedas virtuales para comenzar tu experiencia.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={item}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <FaQrcode className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{t("scanner.title")}</h3>
                    <p className="text-gray-600">
                      Utiliza la cámara de tu dispositivo para escanear los códigos QR de los productos.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={item}>
                <Card className="h-full transition-all hover:shadow-md">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <FaShoppingCart className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">Compra</h3>
                    <p className="text-gray-600">
                      Selecciona un producto por categoría y finaliza tu compra para recibir tu recibo.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              <span>{t("welcome.start")}</span>
              <FaArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
