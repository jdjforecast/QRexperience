import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QRScannerProps {
  onScan: (
    qrCode: string, 
    locationData?: { latitude: number, longitude: number } | null, 
    deviceInfo?: Record<string, any> | null
  ) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function HTML5QrScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
  // Verificar capacidades del dispositivo
  const isCameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        stopScanning();
      }
    };
  }, [isScanning]);

  // Maneja un escaneo exitoso
  const handleSuccessfulScan = async (qrCode: string) => {
    // Evitar escaneos múltiples
    if (scanSuccess) return;
    
    console.log("QR detectado correctamente:", qrCode);
    setScanSuccess(true);
    
    // Vibrar el dispositivo como feedback táctil
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Obtener geolocalización si está disponible
    let locationData = null;
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log("Geolocalización capturada:", locationData);
      }
    } catch (err) {
      console.warn("No se pudo obtener la geolocalización:", err);
    }
    
    // Obtener información del dispositivo
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
    
    // Detener el escaneo y notificar después de un momento
    stopScanning();
    setTimeout(() => {
      // Pasar el código QR y los datos adicionales
      onScan(qrCode, locationData, deviceInfo);
    }, 1000);
  };
  
  // Inicia el escaneo con la biblioteca HTML5-QRCode
  const startScanning = async () => {
    setError(null);
    
    if (!isCameraSupported) {
      setError("Tu dispositivo no soporta el acceso a la cámara. Intenta con otro dispositivo que tenga cámara.");
      return;
    }
    
    if (scannerRef.current) {
      // Si ya existe una instancia, detenerla primero
      await stopScanning();
    }
    
    try {
      // Crear una nueva instancia del escáner
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      setIsScanning(true);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Configuración para mejorar la detección en dispositivos móviles
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };
      
      // Intentar obtener la lista de cámaras
      try {
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          // Preferir la cámara trasera si está disponible
          const backCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes("back") || 
            camera.label.toLowerCase().includes("tras") ||
            camera.label.toLowerCase().includes("rear")
          );
          
          const cameraId = backCamera ? backCamera.id : cameras[0].id;
          
          try {
            await scannerRef.current.start(
              cameraId,
              config,
              (decodedText) => {
                handleSuccessfulScan(decodedText);
              },
              (errorMessage) => {
                // Este callback es para errores durante el escaneo, no para errores de inicio
                console.error("Error durante el escaneo:", errorMessage);
              }
            );
            
            console.log("Escáner QR iniciado correctamente");
          } catch (startErr) {
            console.error("Error al iniciar el escáner con cámara específica, intentando con cualquier cámara:", startErr);
            
            // Plan B: Si hay un error al iniciar con cámara específica, 
            // intentar iniciar con cualquier cámara trasera
            try {
              await scannerRef.current.start(
                { facingMode: "environment" }, // Forzar cámara trasera
                config,
                (decodedText) => {
                  handleSuccessfulScan(decodedText);
                },
                (errorMessage) => {
                  console.error("Error durante el escaneo (modo alternativo):", errorMessage);
                }
              );
              console.log("Escáner QR iniciado en modo alternativo");
            } catch (altErr: any) {
              throw new Error(`No se pudo iniciar el escáner con ningún método: ${altErr?.message || 'Error desconocido'}`);
            }
          }
        } else {
          // Si no se pueden enumerar las cámaras, intentar con la cámara trasera directamente
          try {
            await scannerRef.current.start(
              { facingMode: "environment" }, // Forzar cámara trasera
              config,
              (decodedText) => {
                handleSuccessfulScan(decodedText);
              },
              (errorMessage) => {
                console.error("Error durante el escaneo (modo directo):", errorMessage);
              }
            );
            console.log("Escáner QR iniciado en modo directo");
          } catch (directErr: any) {
            throw new Error(`No se pudo acceder a la cámara: ${directErr?.message || 'Error desconocido'}`);
          }
        }
      } catch (cameraErr) {
        console.error("Error al enumerar cámaras, intentando acceso directo:", cameraErr);
        
        // Si hay un error al enumerar cámaras, intentar acceder directamente
        try {
          await scannerRef.current.start(
            { facingMode: "environment" }, // Forzar cámara trasera
            config,
            (decodedText) => {
              handleSuccessfulScan(decodedText);
            },
            (errorMessage) => {
              console.error("Error durante el escaneo (fallback):", errorMessage);
            }
          );
          console.log("Escáner QR iniciado en modo fallback");
        } catch (fallbackErr: any) {
          throw new Error(`No se pudo acceder a la cámara en ningún modo: ${fallbackErr?.message || 'Error desconocido'}`);
        }
      }
    } catch (err: any) {
      console.error("Error al iniciar el escáner:", err);
      
      // Restablecer el estado del escáner
      setIsScanning(false);
      
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (clearErr) {
          console.error("Error al limpiar escáner:", clearErr);
        }
        scannerRef.current = null;
      }
      
      // Mensaje de error personalizado
      let errorMsg = err.message || "No se pudo iniciar el escáner QR";
      
      if (errorMsg.includes("Permission denied") || errorMsg.includes("permiso")) {
        errorMsg = "No se concedieron permisos para la cámara. Por favor, inténtalo de nuevo y acepta el permiso. En algunos navegadores, necesitas usar HTTPS para acceder a la cámara.";
      } else if (errorMsg.includes("NotFound") || errorMsg.includes("no encontrada")) {
        errorMsg = "No se encontró ninguna cámara en tu dispositivo o está siendo usada por otra aplicación.";
      } else if (errorMsg.includes("NotAllowedError") || errorMsg.includes("no permitido")) {
        errorMsg = "Tu navegador ha bloqueado el acceso a la cámara. Asegúrate de estar usando HTTPS y de haber concedido los permisos necesarios.";
      }
      
      setError(errorMsg);
      onError(errorMsg);
    }
  };
  
  // Detiene el escaneo completamente
  const stopScanning = async (): Promise<void> => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        console.log("Escáner QR detenido correctamente");
      } catch (err) {
        console.error("Error al detener el escáner:", err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h6v6H3z"></path>
              <path d="M9 3h6v6H9z"></path>
              <path d="M15 9h6v6h-6z"></path>
              <path d="M9 15h6v6H9z"></path>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Escáner QR</h2>
        <p className="text-gray-600">Escanea el código QR del producto con la cámara</p>
      </div>
      
      <div className="relative mb-6 overflow-hidden rounded-lg shadow-md">
        {/* Contenedor para el escáner de QR */}
        <div className="w-full h-64 bg-gradient-to-b from-gray-800 to-gray-950 rounded-lg relative overflow-hidden">
          {/* Div contenedor para el escáner HTML5-QRCode */}
          <div 
            id={scannerContainerId} 
            className="w-full h-full absolute top-0 left-0 z-10"
          ></div>
          
          {/* Decoración de esquinas */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary z-20"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-primary z-20"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-primary z-20"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary z-20"></div>
          
          {/* Mensaje cuando no está escaneando */}
          {!isScanning && (
            <div className="h-full flex items-center justify-center flex-col text-center text-white relative z-10">
              <div className="relative mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-primary/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p className="mb-2 font-medium text-white/90">Escaneo de códigos QR</p>
              <p className="text-sm text-white/60 px-4 max-w-xs">Haz clic en "Iniciar Escáner" para usar la cámara</p>
            </div>
          )}
          
          {/* Elementos visuales cuando está escaneando */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Marco de enfoque animado */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Marco de enfoque */}
                  <div className="w-56 h-56 border-2 border-white/80 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Línea de escaneo animada */}
                    <div className="absolute top-0 w-full h-0.5 bg-primary/80 animate-[scanLine_2s_ease-in-out_infinite]"></div>
                    
                    {/* Esquinas decorativas del marco */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    
                    <div className="text-white/80 text-sm text-center max-w-[90%] bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                      <p>Alinea el código QR en este marco</p>
                    </div>
                  </div>
                  
                  {/* Efectos de pulso */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-primary/30 rounded-lg animate-[pulse_2s_ease-in-out_infinite]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/20 rounded-lg animate-[pulse_2s_ease-in-out_0.5s_infinite]"></div>
                </div>
              </div>
              
              {/* Barra de estado inferior */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary/90 to-primary/70 text-white py-2 px-4 text-center text-sm">
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Escaneando...
                </span>
              </div>
            </div>
          )}
          
          {/* Animación cuando se detecta un código QR */}
          {scanSuccess && (
            <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 shadow-lg transform scale-in-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-center text-gray-800 font-medium">¡Código QR detectado!</p>
                <p className="text-center text-gray-500 text-sm">Agregando producto al carrito...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {error && (
          <div className="bg-amber-50 text-amber-600 p-3 rounded-md text-sm text-center">
            <span>{error}</span>
          </div>
        )}
        
        {scanSuccess && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">
            <span>¡Código QR detectado!</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            onClick={isScanning ? stopScanning : startScanning}
            className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
          >
            {isScanning ? 'Detener Escáner' : 'Iniciar Escáner'}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="outline" 
            className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
          >
            Cancelar
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Instrucciones</h3>
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <p className="mb-2"><span className="font-bold">1.</span> Haz clic en "Iniciar Escáner" para activar la cámara.</p>
            <p className="mb-2"><span className="font-bold">2.</span> Apunta la cámara al código QR de un producto.</p>
            <p className="mb-2"><span className="font-bold">3.</span> Mantén el código QR dentro del marco hasta que sea detectado.</p>
          </div>
        </div>
        
        {/* Nota informativa para el despliegue externo */}
        <div className="mt-4 border border-orange-200 rounded-lg bg-orange-50 p-4 text-sm text-orange-700">
          <p className="font-medium mb-2">Nota importante:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>El acceso a la cámara solo funciona en conexiones seguras (HTTPS)</li>
            <li>Para una experiencia óptima, utiliza esta aplicación en un dispositivo móvil</li>
            <li>Si ves este mensaje, recuerda que esta funcionalidad está optimizada para el entorno de producción</li>
          </ul>
        </div>
      </div>
    </div>
  );
}