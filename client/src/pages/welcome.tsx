import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import { useShopping } from "@/contexts/ShoppingContext";
import { useEffect } from "react";

export default function Welcome() {
  const [location, setLocation] = useLocation();
  const { user } = useShopping();
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation("/home");
    }
  }, [user, setLocation]);
  
  const handleGetStarted = () => {
    setLocation("/register");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="flex flex-col items-center">
          <img 
            src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=600&h=400&fit=crop&crop=center" 
            alt="QR Shopping Experience" 
            className="w-full max-w-2xl rounded-lg shadow-md mb-6 object-cover"
          />
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Experiencia de Compra Virtual</h2>
            <p className="text-gray-600 mb-6">
              Escanea códigos QR, selecciona productos y utiliza tus monedas virtuales para una experiencia de compra innovadora.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <i className="fa-solid fa-user-plus text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Regístrate</h3>
                <p className="text-gray-600 text-sm">
                  Crea tu cuenta y recibe 100 monedas virtuales para comenzar tu experiencia.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <i className="fa-solid fa-qrcode text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Escanea</h3>
                <p className="text-gray-600 text-sm">
                  Utiliza la cámara de tu dispositivo para escanear los códigos QR de los productos.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto">
                  <i className="fa-solid fa-shopping-cart text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Compra</h3>
                <p className="text-gray-600 text-sm">
                  Selecciona un producto por categoría y finaliza tu compra para recibir tu recibo.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md shadow-sm font-medium text-lg flex items-center gap-2 mx-auto transition"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              Comenzar Experiencia
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
