import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import AdminRoute from "@/components/layout/admin-route";
import { apiRequest } from "@/lib/queryClient";
import { QrScanLog, Product, User } from "@/contexts/ShoppingContext";
import { formatDate } from "@/lib/utils";

export default function ScanLogs() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Obtener todos los escaneos
  const { data: scanLogs = [], isLoading, error } = useQuery({
    queryKey: ['/api/qr-scans'],
    queryFn: async () => {
      const response = await apiRequest('/api/qr-scans');
      return response.json();
    }
  });
  
  // Obtener todos los productos para mapear IDs a nombres
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('/api/products');
      return response.json();
    }
  });
  
  // Obtener todos los usuarios para mapear IDs a nombres
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/users');
      return response.json();
    }
  });
  
  // Filtrar los logs según la pestaña activa y el filtro de búsqueda
  const filteredLogs = scanLogs.filter((log: QrScanLog) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "successful" && log.successful) ||
      (activeTab === "failed" && !log.successful) ||
      (activeTab === "selected" && log.qrCode === selectedQrCode);
    
    const matchesSearch = 
      !filter || 
      log.qrCode?.toLowerCase().includes(filter.toLowerCase()) ||
      getProductName(log.productId)?.toLowerCase().includes(filter.toLowerCase()) ||
      getUserName(log.userId)?.toLowerCase().includes(filter.toLowerCase());
    
    return matchesTab && matchesSearch;
  });
  
  // Estadísticas de escaneos
  const successfulScans = scanLogs.filter((log: QrScanLog) => log.successful).length;
  const failedScans = scanLogs.filter((log: QrScanLog) => !log.successful).length;
  const uniqueQrCodes = new Set(scanLogs.map((log: QrScanLog) => log.qrCode)).size;
  const uniqueUsers = new Set(scanLogs.filter((log: QrScanLog) => log.userId).map((log: QrScanLog) => log.userId)).size;
  
  // Helper para obtener el nombre de un producto
  const getProductName = (productId: number | null): string => {
    if (!productId) return "Desconocido";
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.name : `ID: ${productId}`;
  };
  
  // Helper para obtener el nombre de un usuario
  const getUserName = (userId: number | null): string => {
    if (!userId) return "Usuario anónimo";
    const user = users.find((u: User) => u.id === userId);
    return user ? user.name : `ID: ${userId}`;
  };
  
  // Helper para formatear datos de geolocalización
  const formatLocation = (log: QrScanLog): string => {
    if (log.latitude && log.longitude) {
      return `${log.latitude.toFixed(6)}, ${log.longitude.toFixed(6)}`;
    }
    return "No disponible";
  };
  
  // Helper para mostrar el mapa si hay coordenadas
  const getGoogleMapsUrl = (log: QrScanLog): string | null => {
    if (log.latitude && log.longitude) {
      return `https://www.google.com/maps?q=${log.latitude},${log.longitude}`;
    }
    return null;
  };
  
  // Helper para formatear información del dispositivo
  const formatDeviceInfo = (log: QrScanLog): string => {
    if (!log.deviceInfo) return "No disponible";
    
    try {
      const deviceInfo = JSON.parse(log.deviceInfo);
      return `${deviceInfo.type} (${deviceInfo.userAgent.substring(0, 50)}...)`;
    } catch (e) {
      return log.deviceInfo?.substring(0, 50) + "...";
    }
  };
  
  // Exportar los registros a CSV
  const exportToCSV = () => {
    const headers = 'ID,Código QR,Usuario,Producto,Fecha,Exitoso,Ubicación,Dispositivo,Contexto\n';
    
    const csvRows = scanLogs.map((log: QrScanLog) => {
      const location = log.latitude && log.longitude 
        ? `"${log.latitude},${log.longitude}"` 
        : '""';
      
      const deviceInfo = log.deviceInfo 
        ? `"${log.deviceInfo.replace(/"/g, '""')}"` 
        : '""';
      
      return `${log.id},"${log.qrCode}","${getUserName(log.userId)}","${getProductName(log.productId)}","${formatDate(new Date(log.scanDate))}",${log.successful},${location},${deviceInfo},"${log.scanContext || ''}"`; 
    });
    
    const csvContent = headers + csvRows.join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `qr_scan_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación completada",
      description: `Se han exportado ${scanLogs.length} registros de escaneos.`,
    });
  };
  
  return (
    <AdminRoute>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Registro de Escaneos QR</h1>
          <Button onClick={exportToCSV}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar CSV
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Escaneos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scanLogs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Escaneos Exitosos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successfulScans}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Códigos QR Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueQrCodes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Buscar por código QR, producto o usuario..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-md"
            />
            {filter && (
              <Button variant="ghost" onClick={() => setFilter("")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            )}
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="successful">Exitosos</TabsTrigger>
              <TabsTrigger value="failed">Fallidos</TabsTrigger>
              <TabsTrigger value="selected" disabled={!selectedQrCode}>Seleccionado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {renderLogsTable(filteredLogs)}
            </TabsContent>
            
            <TabsContent value="successful" className="mt-4">
              {renderLogsTable(filteredLogs)}
            </TabsContent>
            
            <TabsContent value="failed" className="mt-4">
              {renderLogsTable(filteredLogs)}
            </TabsContent>
            
            <TabsContent value="selected" className="mt-4">
              {selectedQrCode ? (
                <>
                  <Alert className="mb-4">
                    <AlertTitle>Código QR seleccionado: {selectedQrCode}</AlertTitle>
                    <AlertDescription>
                      Mostrando todos los escaneos para este código QR específico.
                      <Button variant="link" onClick={() => {setSelectedQrCode(null); setActiveTab("all");}}>
                        Limpiar selección
                      </Button>
                    </AlertDescription>
                  </Alert>
                  {renderLogsTable(filteredLogs)}
                </>
              ) : (
                <Alert>
                  <AlertTitle>Ningún código QR seleccionado</AlertTitle>
                  <AlertDescription>
                    Haz clic en un código QR de la tabla para ver todos sus escaneos.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
  
  // Renderiza la tabla de logs
  function renderLogsTable(logs: QrScanLog[]) {
    if (isLoading) {
      return <div className="text-center py-8">Cargando registros de escaneos...</div>;
    }
    
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error al cargar los registros</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los registros de escaneos. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (logs.length === 0) {
      return (
        <Alert>
          <AlertTitle>No hay registros</AlertTitle>
          <AlertDescription>
            No se encontraron registros de escaneos que coincidan con los filtros actuales.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left font-medium">ID</th>
                <th className="p-3 text-left font-medium">Código QR</th>
                <th className="p-3 text-left font-medium">Usuario</th>
                <th className="p-3 text-left font-medium">Producto</th>
                <th className="p-3 text-left font-medium">Fecha</th>
                <th className="p-3 text-left font-medium">Estado</th>
                <th className="p-3 text-left font-medium">Ubicación</th>
                <th className="p-3 text-left font-medium">Dispositivo</th>
                <th className="p-3 text-left font-medium">Contexto</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: QrScanLog) => (
                <tr key={log.id} className="border-t hover:bg-muted/50">
                  <td className="p-3 align-top">{log.id}</td>
                  <td className="p-3 align-top">
                    <button 
                      onClick={() => {
                        setSelectedQrCode(log.qrCode);
                        setActiveTab("selected");
                      }}
                      className="font-medium text-primary hover:underline"
                    >
                      {log.qrCode}
                    </button>
                  </td>
                  <td className="p-3 align-top">{getUserName(log.userId)}</td>
                  <td className="p-3 align-top">{getProductName(log.productId)}</td>
                  <td className="p-3 align-top whitespace-nowrap">{formatDate(new Date(log.scanDate))}</td>
                  <td className="p-3 align-top">
                    {log.successful ? (
                      <Badge variant="success" className="bg-green-100 text-green-800">Exitoso</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">Fallido</Badge>
                    )}
                  </td>
                  <td className="p-3 align-top">
                    {log.latitude && log.longitude ? (
                      <a 
                        href={getGoogleMapsUrl(log) || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver en mapa
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </td>
                  <td className="p-3 align-top">{formatDeviceInfo(log)}</td>
                  <td className="p-3 align-top">{log.scanContext || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}