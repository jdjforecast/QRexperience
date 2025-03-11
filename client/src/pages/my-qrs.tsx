import { useEffect, useState } from "react";
import { useShopping, Order } from "@/contexts/ShoppingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "@/components/ui/qr-code";
import { useLocation } from "wouter";
import CoinBadge from "@/components/ui/coin-badge";
import { formatDate } from "@/lib/utils";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export default function MyQRs() {
  const { user } = useShopping();
  const [, setLocation] = useLocation();
  
  // Fetch user orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: [`/api/users/${user?.id}/orders`],
    queryFn: getQueryFn<Order[]>({ on401: "returnNull" }),
    enabled: !!user,
  });
  
  if (!user) {
    useEffect(() => {
      setLocation("/");
    }, []);
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis QRs de Compra</h1>
            <p className="text-gray-600">Accede a los códigos QR de tus compras realizadas</p>
          </div>
          <CoinBadge coins={user.coins} />
        </div>
        
        <Separator className="mb-6" />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
            <AlertDescription className="flex items-start">
              <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
              <div>
                <p className="font-medium">Aún no tienes compras realizadas</p>
                <p className="text-sm mt-1">
                  Finaliza tu compra para obtener un código QR de reclamación de productos.
                </p>
                <Button 
                  className="mt-3 bg-primary text-white hover:bg-primary/90"
                  onClick={() => setLocation("/home")}
                >
                  Ir a Comprar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order: Order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Orden #{order.id}</h3>
                      <p className="text-sm text-gray-600">{formatDate(new Date(order.orderDate))}</p>
                    </div>
                    <span className="flex items-center text-amber-500 font-medium">
                      <i className="fa-solid fa-coins mr-1.5 text-xs"></i>
                      {order.total}
                    </span>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <QRCode 
                      text={order.receiptCode} 
                      size={160} 
                      alt={`Código QR para orden #${order.id}`}
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Código de reclamación:</p>
                    <p className="font-mono text-primary font-medium">{order.receiptCode}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation(`/receipt/${order.id}`)}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <MobileNav />
    </div>
  );
}