import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useShopping, Product as ProductType } from "@/contexts/ShoppingContext";
import { useQuery } from "@tanstack/react-query";

export default function ProductPage() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { 
    user, 
    selectedProduct, 
    addToCart, 
    getExistingProductByCategory, 
    canAddToCart, 
    setSelectedProduct 
  } = useShopping();
  
  // Fetch product if not in context
  const { data: product } = useQuery<ProductType>({
    queryKey: [`/api/products/${params.id}`],
    enabled: !selectedProduct && !!params.id
  });
  
  const displayProduct = selectedProduct || product as ProductType | undefined;
  
  // If not logged in, redirect to welcome page
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // If product fetched from API, update selected product
  useEffect(() => {
    if (product && !selectedProduct) {
      setSelectedProduct(product);
    }
  }, [product, selectedProduct, setSelectedProduct]);
  
  const handleAddToCart = () => {
    if (displayProduct) {
      addToCart(displayProduct);
      setLocation("/home");
    }
  };
  
  const handleGoBack = () => {
    setLocation("/home");
  };
  
  if (!user || !displayProduct) return null;
  
  const existingProduct = getExistingProductByCategory(displayProduct.category);
  
  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            <img 
              src={displayProduct.imageUrl} 
              alt={displayProduct.name} 
              className="w-full h-64 object-cover"
            />
            
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{displayProduct.name}</h2>
                <span className="flex items-center text-amber-500 font-semibold text-lg">
                  <i className="fa-solid fa-coins mr-2"></i>
                  <span>{displayProduct.price}</span>
                </span>
              </div>
              
              <div className="mb-4">
                <span className="text-sm px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                  {displayProduct.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">{displayProduct.description}</p>
              
              {existingProduct && (
                <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
                  <AlertDescription className="flex items-start">
                    <i className="fa-solid fa-triangle-exclamation mt-0.5 mr-3"></i>
                    <div>
                      <p className="font-medium">Ya tienes un producto de esta categoría</p>
                      <p className="text-sm mt-1">
                        Solo puedes seleccionar un producto por categoría. Debes eliminar {" "}
                        <span className="font-medium">{existingProduct.name}</span> del carrito para agregar este producto.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm flex items-center justify-center gap-2"
                  disabled={!canAddToCart(displayProduct)}
                >
                  <i className="fa-solid fa-cart-plus"></i>
                  Agregar al Carrito
                </Button>
                
                <Button 
                  onClick={handleGoBack}
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium flex items-center justify-center"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
