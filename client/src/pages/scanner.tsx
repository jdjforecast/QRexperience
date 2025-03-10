import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import QRScanner from "@/components/ui/qr-scanner";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/hooks/use-toast";

export default function Scanner() {
  const [location, setLocation] = useLocation();
  const { scanQRCode, setSelectedProduct } = useShopping();
  const { toast } = useToast();
  
  const [scanning, setScanning] = useState(false);
  
  const handleScan = async (qrCode: string) => {
    try {
      const product = await scanQRCode(qrCode);
      if (product) {
        setSelectedProduct(product);
        setLocation(`/product/${product.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo encontrar un producto con este código QR.",
        variant: "destructive",
      });
    }
  };
  
  const handleScanError = (error: string) => {
    toast({
      title: "Error de escaneo",
      description: error,
      variant: "destructive",
    });
  };
  
  const handleClose = () => {
    setLocation("/home");
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 pt-6 pb-20">
        <div className="max-w-md mx-auto">
          <QRScanner 
            onScan={handleScan}
            onError={handleScanError}
            onClose={handleClose}
          />
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
