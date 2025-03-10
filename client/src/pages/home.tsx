import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProductCard from "@/components/product-card";
import ProductCategoryCard from "@/components/product-category-card";
import { useShopping } from "@/contexts/ShoppingContext";
import { categories } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, products, setSelectedProduct } = useShopping();
  
  // If not logged in, redirect to welcome page
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleOpenScanner = () => {
    setLocation("/scanner");
  };
  
  const handleViewProductDetails = (product: any) => {
    setSelectedProduct(product);
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
            <p className="text-gray-600">
              Tienes <span className="font-semibold text-primary">{user.coins}</span> monedas disponibles
            </p>
          </div>
          
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
                  Utiliza la cámara de tu dispositivo para escanear el código QR del producto que deseas ver.
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
          
          {/* Product Categories */}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Categorías de Productos</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {categories.map((category) => (
              <ProductCategoryCard key={category} category={category} />
            ))}
          </div>
          
          {/* Featured Products */}
          {products.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Productos Destacados</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.slice(0, 3).map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onViewDetails={handleViewProductDetails}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
