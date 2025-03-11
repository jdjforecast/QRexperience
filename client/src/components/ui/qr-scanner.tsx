import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [qrScanner, setQrScanner] = useState<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
  // Verificar capacidades del dispositivo
  const isCameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Limpiar mensajes de error cuando cambie el estado de escaneo
  useEffect(() => {
    if (!isScanning) {
      // Limpiar mensajes de error después de un tiempo
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);
  
  // Efecto de limpieza cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (qrScanner && qrScanner.isScanning) {
        console.log("Limpiando escáner al desmontar...");
        qrScanner.stop().catch(console.error);
      }
    };
  }, [qrScanner]);
  
  // Simulador de escaneo para demostración
  const simulateScan = (qrCode: string) => {
    setScanSuccess(true);
    setError(null);
    
    setTimeout(() => {
      setScanSuccess(false);
      onScan(qrCode);
    }, 1000);
  };
  
  // Inicia el escaneo con manejo mejorado de permisos y errores
  const startScanning = async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      console.log("Solicitando permisos de cámara...");
      
      // Verificar si el navegador tiene soporte para la API de MediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta el acceso a la cámara. Usa los códigos de ejemplo.");
      }
      
      // Intentar obtener permisos de cámara explícitamente primero
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Detener el stream inmediatamente, solo necesitamos verificar el permiso
        stream.getTracks().forEach(track => track.stop());
        console.log("Permisos de cámara concedidos");
      } catch (permissionErr) {
        console.error("No se pudo obtener permiso de cámara:", permissionErr);
        throw new Error("No se concedió permiso para acceder a la cámara. Por favor intenta de nuevo.");
      }
      
      // Inicializa el escáner
      const scanner = new Html5Qrcode(scannerContainerId);
      setQrScanner(scanner);
      console.log("Escáner inicializado");
      
      // Configuración optimizada
      const config = { 
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1,
        disableFlip: false,
        formatsToSupport: [0, 1, 2, 3], // QR, AZTEC, CODE_39, CODE_128
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      console.log("Iniciando escáner con configuración:", config);
      await scanner.start(
        { facingMode: "environment" }, // Usar cámara trasera
        config,
        (decodedText) => {
          // Éxito al escanear
          console.log("QR detectado:", decodedText);
          setScanSuccess(true);
          
          // Vibrar el dispositivo si está disponible (feedback táctil)
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          // Detiene el escáner y notifica
          setTimeout(() => {
            stopScanning(scanner);
            onScan(decodedText);
          }, 1000);
        },
        (errorMessage) => {
          // No muestra errores continuos durante el escaneo
          console.debug("Buscando QR:", errorMessage);
        }
      );
      
      console.log("Escáner iniciado exitosamente");
    } catch (err: any) {
      console.error("Error al iniciar el escáner:", err);
      stopScanning();
      // Mensaje de error más amigable
      const errorMsg = err.message || "No se pudo iniciar la cámara. Verifica los permisos.";
      setError(errorMsg);
      
      // Si es un error de permisos, mostrar mensaje más específico
      if (errorMsg.includes("Permission denied") || errorMsg.includes("permiso")) {
        setError("No se pudo acceder a la cámara. Por favor concede los permisos cuando te lo solicite el navegador.");
      } else if (errorMsg.includes("NotFound") || errorMsg.includes("no encontrada")) {
        setError("No se encontró ninguna cámara en tu dispositivo, o está siendo usada por otra aplicación.");
      }
    }
  };
  
  // Detiene el escaneo (versión para el botón)
  const handleStopScanning = () => {
    if (qrScanner && qrScanner.isScanning) {
      console.log("Deteniendo escáner...");
      qrScanner.stop().catch(console.error);
    }
    setIsScanning(false);
  };
  
  // Función para uso interno con parámetro scanner opcional
  const stopScanning = (scanner = qrScanner) => {
    if (scanner && scanner.isScanning) {
      console.log("Deteniendo escáner interno...");
      scanner.stop().catch(console.error);
    }
    setIsScanning(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Escáner QR</h2>
        <p className="text-gray-600">Escanea el código QR del producto o usa los ejemplos de abajo</p>
      </div>
      
      <div className="relative mb-6 overflow-hidden rounded-lg">
        {/* Contenedor para el escáner de QR */}
        <div className="w-full h-64 bg-gray-900 rounded-lg relative overflow-hidden">
          {/* Div contenedor para la librería HTML5 QR Code Scanner */}
          <div 
            id={scannerContainerId} 
            className="w-full h-full absolute top-0 left-0"
          ></div>
          
          {/* Los estilos personalizados se aplicarán mediante clases CSS */}
          
          {/* Mensaje cuando no está escaneando */}
          {!isScanning && (
            <div className="h-full flex items-center justify-center flex-col text-center text-white relative z-10">
              <i className="fa-solid fa-qrcode text-5xl mb-3"></i>
              <p className="mb-2">Escaneo de códigos QR</p>
              <p className="text-sm text-gray-400 px-4">Haz clic en "Iniciar Escáner" para usar la cámara</p>
            </div>
          )}
        </div>
        
        {/* Marco de escaneo cuando está activo */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 border-2 border-primary rounded-lg"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-dashed border-white/60 rounded-lg flex items-center justify-center">
                <div className="text-white/80 text-sm text-center">
                  <p>Centrando QR...</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white p-2 text-center text-sm">
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Escaneando...
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {error && (
          <div className="bg-amber-50 text-amber-600 p-3 rounded-md text-sm text-center">
            <i className="fa-solid fa-info-circle mr-1"></i>
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
          {isCameraSupported ? (
            <Button 
              onClick={isScanning ? handleStopScanning : startScanning}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm flex items-center justify-center gap-2"
            >
              <i className={`fa-solid ${isScanning ? 'fa-stop' : 'fa-qrcode'}`}></i>
              {isScanning ? 'Detener Escáner' : 'Iniciar Escáner'}
            </Button>
          ) : (
            <Button 
              onClick={() => setError("Tu dispositivo no soporta acceso a la cámara. Usa los códigos de ejemplo de abajo.")}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm flex items-center justify-center gap-2"
              disabled
            >
              <i className="fa-solid fa-exclamation-triangle"></i>
              Cámara no compatible
            </Button>
          )}
          
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
          <Button 
            variant="outline"
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center h-auto flex flex-col items-center gap-2" 
            onClick={() => simulateScan("QRPROD001")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD001&size=100x100" 
              alt="QR Code 1" 
              className="w-16 h-16 object-contain"
            />
            <span className="text-sm text-gray-600">Queso Fresco</span>
          </Button>
          
          <Button 
            variant="outline"
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center h-auto flex flex-col items-center gap-2" 
            onClick={() => simulateScan("QRPROD002")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD002&size=100x100" 
              alt="QR Code 2" 
              className="w-16 h-16 object-contain"
            />
            <span className="text-sm text-gray-600">Pan Baguette</span>
          </Button>
          
          <Button 
            variant="outline"
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 text-center h-auto flex flex-col items-center gap-2" 
            onClick={() => simulateScan("QRPROD003")}
          >
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?data=QRPROD003&size=100x100" 
              alt="QR Code 3" 
              className="w-16 h-16 object-contain"
            />
            <span className="text-sm text-gray-600">Yogurt Natural</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
