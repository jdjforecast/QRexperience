import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShoppingProvider, useShopping } from "@/contexts/ShoppingContext";

export default function AdminTools() {
  const { toast } = useToast();
  
  // Bulk QR generation
  const [bulkPrefix, setBulkPrefix] = useState("QRPROD");
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  
  // App settings
  const [offlineMode, setOfflineMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  
  // System diagnostics
  const [diagnosticResult, setDiagnosticResult] = useState("");
  
  // Generate bulk QR codes
  const handleGenerateBulkQRCodes = () => {
    const codes: string[] = [];
    for (let i = 0; i < bulkQuantity; i++) {
      const randomSuffix = Math.floor(Math.random() * 90000) + 10000;
      codes.push(`${bulkPrefix}${randomSuffix}`);
    }
    
    setGeneratedCodes(codes);
    toast({
      title: "Éxito",
      description: `Se generaron ${bulkQuantity} códigos QR`,
    });
  };
  
  // Copy to clipboard 
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast({
      title: "Copiado",
      description: "Códigos QR copiados al portapapeles",
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    toast({
      title: "Éxito",
      description: "Configuración guardada correctamente",
    });
  };
  
  // Run system diagnostics
  const handleRunDiagnostics = () => {
    setDiagnosticResult("Ejecutando diagnóstico...");
    
    // Simulate diagnostic process
    setTimeout(() => {
      setDiagnosticResult(
        "✅ Conexión a bases de datos: OK\n" +
        "✅ API endpoints: OK\n" +
        "✅ Sistema de almacenamiento: OK\n" +
        "✅ Integridad de datos: OK\n" +
        "✅ Rendimiento del sistema: OK\n\n" +
        "Diagnóstico completado con éxito. No se encontraron problemas."
      );
      
      toast({
        title: "Diagnóstico Completado",
        description: "El sistema se encuentra en buen estado",
      });
    }, 2000);
  };
  
  // Reset database - Clear all test data
  const handleResetDatabase = () => {
    if (window.confirm("¿Estás seguro de que deseas reiniciar la base de datos? Esta acción eliminará todos los datos de prueba.")) {
      toast({
        title: "Base de Datos Reiniciada",
        description: "Todos los datos de prueba han sido eliminados",
      });
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Generador de Códigos QR</CardTitle>
          <CardDescription>
            Genera códigos QR en lote para nuevos productos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulkPrefix">Prefijo</Label>
              <Input
                id="bulkPrefix"
                value={bulkPrefix}
                onChange={(e) => setBulkPrefix(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulkQuantity">Cantidad</Label>
              <Input
                id="bulkQuantity"
                type="number"
                min="1"
                max="100"
                value={bulkQuantity}
                onChange={(e) => setBulkQuantity(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleGenerateBulkQRCodes}>
              Generar Códigos QR
            </Button>
          </div>
          
          {generatedCodes.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Códigos QR Generados</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  Copiar
                </Button>
              </div>
              <Textarea
                readOnly
                className="font-mono text-xs h-32"
                value={generatedCodes.join("\n")}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Aplicación</CardTitle>
          <CardDescription>
            Administra las configuraciones globales de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo sin conexión</Label>
                <p className="text-sm text-gray-500">
                  Habilitar la funcionalidad sin conexión
                </p>
              </div>
              <Switch
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Análisis de datos</Label>
                <p className="text-sm text-gray-500">
                  Recopilar datos anónimos de uso
                </p>
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Intervalo de sincronización (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={syncInterval}
                onChange={(e) => setSyncInterval(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Herramientas del Sistema</CardTitle>
          <CardDescription>
            Herramientas de diagnóstico y mantenimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Button onClick={handleRunDiagnostics}>
                Ejecutar Diagnóstico del Sistema
              </Button>
            </div>
            
            {diagnosticResult && (
              <div className="space-y-2">
                <Label>Resultado del diagnóstico</Label>
                <Textarea
                  readOnly
                  className="font-mono text-xs h-40"
                  value={diagnosticResult}
                />
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-red-500 mb-2 block">Zona de Peligro</Label>
            <Button variant="destructive" onClick={handleResetDatabase}>
              Reiniciar Base de Datos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción eliminará todos los datos de la aplicación. Use con precaución.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}