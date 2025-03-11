import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import QRScanner from "@/components/ui/qr-scanner";
import { useShopping } from "@/contexts/ShoppingContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function Scanner() {
  const [location, setLocation] = useLocation();
  const { scanQRCode, setSelectedProduct } = useShopping();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [scanning, setScanning] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Este efecto se ejecuta al montar el componente
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);
  
  const handleScan = async (qrCode: string) => {
    if (!mounted) return;
    
    try {
      const product = await scanQRCode(qrCode);
      if (product) {
        setSelectedProduct(product);
        
        // Mostrar notificación de éxito
        toast({
          title: t("scanner.success"),
          description: `${product.name} ${t("scanner.product.added")}`,
        });
        
        // Breve pausa para mostrar animación/notificación
        setTimeout(() => {
          // Redirigir al carrito para completar la compra
          setLocation("/home");
        }, 1500);
      }
    } catch (error) {
      toast({
        title: t("scanner.error"),
        description: t("scanner.product.not.found"),
        variant: "destructive",
      });
    }
  };
  
  const handleScanError = (error: string) => {
    if (!mounted) return;
    
    toast({
      title: t("scanner.error.title"),
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
