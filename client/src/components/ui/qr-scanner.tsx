import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

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
    // Limpiar cualquier instancia anterior que pueda existir en el DOM
    try {
      const existingElements = document.querySelectorAll(`#${scannerContainerId} video, #${scannerContainerId} canvas`);
      existingElements.forEach(element => {
        try {
          element.parentNode?.removeChild(element);
        } catch (e) {
          console.log("Elemento ya removido o no existe:", e);
        }
      });
    } catch (e) {
      console.log("Error limpiando elementos existentes:", e);
    }
    
    // Initialize the scanner when the component mounts
    const scannerElement = document.getElementById(scannerContainerId);
    if (scannerElement) {
      try {
        if (!scannerRef.current) {
          console.log("Inicializando escáner de QR...");
          scannerRef.current = new Html5Qrcode(scannerContainerId);
          console.log("QR scanner initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
        setError("Error al inicializar el escáner de QR. Inténtelo de nuevo.");
      }
    }
    
    // Clean up on unmount
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
            console.log("Limpiando escáner al desmontar...");
            scannerRef.current.stop()
              .catch(err => console.error("Error stopping scanner:", err))
              .finally(() => {
                scannerRef.current = null;
              });
          } else {
            scannerRef.current = null;
          }
        } catch (error) {
          console.error("Error during scanner cleanup:", error);
          scannerRef.current = null;
        }
      }
    };
  }, []);
  
  const startScanning = async () => {
    // Limpiamos el error previo al intentar iniciar
    setError(null);

    // Verificamos si el elemento existe en el DOM
    const scannerElement = document.getElementById(scannerContainerId);
    if (!scannerElement) {
      const errorMessage = "No se pudo encontrar el elemento del escáner";
      setError(errorMessage);
      onError(errorMessage);
      return;
    }
    
    // Si ya está escaneando, primero paramos el escaneo
    if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      try {
        await scannerRef.current.stop();
        console.log("Escáner detenido antes de reiniciar");
      } catch (error) {
        console.error("Error al detener el escáner:", error);
      }
    }

    // Reinicializamos el scanner
    try {
      if (!scannerRef.current) {
        console.log("Inicializando scanner");
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
    } catch (error) {
      console.error("Error al reinicializar el escáner:", error);
      const errorMessage = (error as Error).message || "Error al inicializar el escáner";
      setError(errorMessage);
      onError(errorMessage);
      return;
    }
    
    // Verificamos que el scanner esté listo
    if (!scannerRef.current) {
      setError("No se pudo inicializar el escáner");
      onError("No se pudo inicializar el escáner");
      return;
    }
    
    // Indicamos que estamos escaneando
    setIsScanning(true);
    
    try {
      // Configuramos opciones para dispositivos móviles
      const cameraConfig = {
        facingMode: "environment", // Usar cámara trasera primero
      };
      
      const scanConfig = {
        fps: 5, // Reducimos a 5 fps para mejorar el rendimiento en móviles
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: false, // Permite escanear QR en cualquier orientación
        formatsToSupport: [0] // Solo QR codes (0 = QR_CODE)
      };
      
      console.log("Iniciando escaneo con configuración:", scanConfig);
      
      await scannerRef.current.start(
        cameraConfig,
        scanConfig,
        (decodedText) => {
          // En caso de escaneo exitoso
          console.log("QR detectado:", decodedText);
          setScanSuccess(true);
          
          // Detenemos el escáner y notificamos
          setTimeout(() => {
            stopScanning();
            onScan(decodedText);
          }, 1000);
        },
        (errorMessage) => {
          // QR code no encontrado, continuamos escaneando
          // No mostramos estos errores al usuario
          console.debug("Buscando QR:", errorMessage);
        }
      );
      
      console.log("Escáner iniciado correctamente");
    } catch (error) {
      console.error("Error al iniciar el escáner:", error);
      stopScanning();
      const errorMessage = (error as Error).message || "Error al iniciar el escáner";
      setError(errorMessage);
      onError(errorMessage);
    }
  };
  
  const stopScanning = async () => {
    setIsScanning(false);
    
    if (!scannerRef.current) return;
    
    try {
      // Verificamos si está escaneando antes de detener
      if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        console.log("Deteniendo escáner...");
        await scannerRef.current.stop();
        console.log("Escáner detenido correctamente");
      } else {
        console.log("El escáner ya estaba detenido");
      }
    } catch (error) {
      console.error("Error al detener el escáner:", error);
      // No mostramos este error al usuario, solo lo registramos
    }
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
