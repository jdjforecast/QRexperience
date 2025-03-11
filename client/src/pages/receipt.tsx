import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import QRCode from "@/components/ui/qr-code";
import { useShopping, Order, OrderItem, Product } from "@/contexts/ShoppingContext";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Receipt() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { user, lastOrder } = useShopping();
  const { toast } = useToast();
  
  // For the case of a "latest" receipt, use the lastOrder from context
  const isLatestReceipt = params.id === 'latest';
  const orderId = isLatestReceipt ? undefined : Number(params.id);
  
  // Fetch order if we have an ID and not using latest
  const { data: fetchedOrder } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !isLatestReceipt && !!orderId && !lastOrder
  });
  
  // Fetch all products to get detailed product information
  const productsQuery = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Use the appropriate order source
  const order = isLatestReceipt ? lastOrder : (fetchedOrder || lastOrder) as Order | null;
  
  // If not logged in, redirect to welcome page
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // If no order is available, redirect to home
  useEffect(() => {
    if (user && !order && !isLatestReceipt) {
      toast({
        title: "Recibo no encontrado",
        description: "No se pudo encontrar el recibo solicitado.",
        variant: "destructive",
      });
      setLocation("/home");
    }
  }, [user, order, isLatestReceipt, toast, setLocation]);
  
  const handleDownloadReceipt = () => {
    // This would normally generate a PDF or image for download
    toast({
      title: "Recibo descargado",
      description: "El recibo se ha descargado correctamente.",
    });
  };
  
  const handleGoToHome = () => {
    setLocation("/home");
  };
  
  if (!user || !order) return null;
  
  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-2xl mx-auto mb-4">
                  <i className="fa-solid fa-check-circle"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">¡Compra Exitosa!</h2>
                <p className="text-gray-600">Recibo #{order.receiptCode}</p>
              </div>
              
              <div className="border-t border-b py-4 mb-5">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium text-gray-800">{user.name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(new Date(order.orderDate))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="flex items-center text-amber-500 font-medium">
                    <i className="fa-solid fa-coins mr-1.5 text-xs"></i>
                    <span>{order.total}</span>
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Productos:</h3>
                
                <div className="space-y-2">
                  {order.items.map((item: OrderItem) => {
                    // Buscar el producto completo en los productos disponibles por ID
                    const productDetails = productsQuery.data?.find((p: Product) => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{`${productDetails?.name || 'Producto'} (${productDetails?.category || 'Categoría'})`}</span>
                        <span className="flex items-center text-amber-500 font-medium">
                          <i className="fa-solid fa-coins mr-1 text-xs"></i>
                          <span>{item.price}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="text-center mb-3">
                  <h4 className="font-medium text-gray-800 mb-1">Código QR de Recogida</h4>
                  <p className="text-gray-600 text-xs">Presenta este código en el punto de recogida</p>
                </div>
                
                <div className="flex justify-center">
                  <QRCode 
                    text={order.receiptCode} 
                    size={160}
                    className="h-40 w-40 object-contain"
                    alt="Código QR de recogida"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium flex items-center gap-2"
                >
                  <i className="fa-solid fa-download"></i>
                  Descargar
                </Button>
                
                <Button 
                  onClick={handleGoToHome}
                  className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm flex items-center gap-2"
                >
                  <i className="fa-solid fa-house"></i>
                  Ir al Inicio
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
