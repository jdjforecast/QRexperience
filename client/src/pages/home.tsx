import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LiveCart from "@/components/live-cart";
import { useShopping } from "@/contexts/ShoppingContext";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, setSelectedProduct } = useShopping();
  
  // If not logged in, redirect to welcome page
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleOpenScanner = () => {
    setLocation("/scanner");
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
          
          {/* Live Cart */}
          <LiveCart />
          
          {/* Scanner option */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1621613717744-38a99159867e?w=600&h=300&fit=crop&crop=center" 
                  alt="QR Scanner" 
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Escanear Producto</h3>
                <p className="text-gray-600 mb-4">
                  Utiliza la cámara de tu dispositivo para escanear el código QR del producto que deseas comprar.
                </p>
                <Button 
                  onClick={handleOpenScanner}
                  className="bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-2 mx-auto transition"
                >
                  <i className="fa-solid fa-qrcode"></i>
                  Abrir Escáner
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Ayuda/Instrucciones */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cómo funciona</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <span>1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Escanea productos</h4>
                    <p className="text-gray-600 text-sm">Usa el escáner para agregar productos a tu carrito virtual</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <span>2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Revisa tu carrito</h4>
                    <p className="text-gray-600 text-sm">Verifica los productos agregados y el total a pagar</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                    <span>3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Finaliza tu compra</h4>
                    <p className="text-gray-600 text-sm">Completa la transacción y recibe tu recibo digital</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
