import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";
  
  useEffect(() => {
    // Initialize the scanner
    scannerRef.current = new Html5Qrcode(scannerContainerId);
    
    // Clean up on unmount
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);
  
  const startScanning = async () => {
    if (!scannerRef.current) return;
    
    setError(null);
    setIsScanning(true);
    
    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // On successful scan
          setScanSuccess(true);
          setTimeout(() => {
            stopScanning();
            onScan(decodedText);
          }, 1000);
        },
        (errorMessage) => {
          // QR code not found, continue scanning
          console.log(errorMessage);
        }
      );
    } catch (err) {
      stopScanning();
      const errorMessage = (err as Error).message || "Error al iniciar el escáner";
      setError(errorMessage);
      onError(errorMessage);
    }
  };
  
  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };
  
  const simulateScan = (qrCode: string) => {
    setScanSuccess(true);
    setTimeout(() => {
      setScanSuccess(false);
      onScan(qrCode);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Escáner QR</h2>
        <p className="text-gray-600">Posiciona el código QR dentro del recuadro</p>
      </div>
      
      <div className="relative mb-6 overflow-hidden rounded-lg">
        {/* Scanner container */}
        <div 
          id={scannerContainerId} 
          className="bg-gray-900 w-full h-64 flex items-center justify-center rounded-lg relative"
        >
          {!isScanning && (
            <div className="text-white text-center">
              <i className="fa-solid fa-qrcode text-4xl mb-2"></i>
              <p>Presiona "Escanear" para activar la cámara</p>
            </div>
          )}
          
          {/* Scan overlay animation */}
          {isScanning && (
            <>
              <div className="absolute inset-0 border-2 border-primary rounded-lg"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-white/60 rounded-lg flex items-center justify-center">
                  <div className="text-white/80 text-sm text-center">
                    <i className="fa-solid fa-camera text-2xl mb-2"></i>
                    <p>Centrando QR...</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Scanning status */}
          {isScanning && (
            <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white p-2 text-center text-sm">
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Escaneando...
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
            <i className="fa-solid fa-triangle-exclamation mr-1"></i>
            <span>{error}</span>
          </div>
        )}
        
        {scanSuccess && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">
            <i className="fa-solid fa-check-circle mr-1"></i>
            <span>¡Código QR detectado!</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            onClick={isScanning ? stopScanning : startScanning}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <i className={`fa-solid ${isScanning ? 'fa-stop' : 'fa-qrcode'}`}></i>
            {isScanning ? 'Detener' : 'Escanear'}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver
          </Button>
        </div>
      </div>
      
      {/* QR Examples for demo */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Códigos QR de ejemplo:</h3>
        <div className="grid grid-cols-3 gap-3">
          <div 
            className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-center cursor-pointer" 
            onClick={() => simulateScan("QRPROD001")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD001&size=100x100" 
              alt="QR Code 1" 
              className="w-full h-20 object-contain mb-1"
            />
            <span className="text-xs text-gray-600">Producto 1</span>
          </div>
          <div 
            className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-center cursor-pointer"
            onClick={() => simulateScan("QRPROD002")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD002&size=100x100" 
              alt="QR Code 2" 
              className="w-full h-20 object-contain mb-1"
            />
            <span className="text-xs text-gray-600">Producto 2</span>
          </div>
          <div 
            className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-center cursor-pointer"
            onClick={() => simulateScan("QRPROD003")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD003&size=100x100" 
              alt="QR Code 3" 
              className="w-full h-20 object-contain mb-1"
            />
            <span className="text-xs text-gray-600">Producto 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
