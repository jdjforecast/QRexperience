import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GoogleSheetsAdmin() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const { toast } = useToast();

  // Función para iniciar sincronización manual con Google Sheets
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Endpoint específico para cada tipo de datos
      const endpoint = `/api/export/${activeTab}`;
      
      const response = await apiRequest("GET", endpoint);
      const data = await response.text();
      
      toast({
        title: "Sincronización exitosa",
        description: `Los datos de ${getTabTitle(activeTab)} han sido exportados a Google Sheets.`,
      });
      
      // Aquí podríamos mostrar los datos sincronizados si es necesario
      console.log(data);
      
    } catch (error) {
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar los datos con Google Sheets.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Función para obtener el título de la pestaña activa
  const getTabTitle = (tab: string): string => {
    switch (tab) {
      case "users":
        return "Usuarios";
      case "products":
        return "Productos";
      case "orders":
        return "Órdenes";
      default:
        return "Datos";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Sheets</h1>
          <p className="text-gray-500">
            Administra y sincroniza tus datos con Google Sheets
          </p>
        </div>
        <Button 
          onClick={handleSyncData}
          disabled={isSyncing}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isSyncing ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
              Sincronizando...
            </>
          ) : (
            <>
              <i className="fa-solid fa-sync mr-2"></i>
              Sincronizar Ahora
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
                <AlertDescription className="flex items-start">
                  <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
                  <div>
                    <p className="font-medium">Información sobre Datos de Usuarios</p>
                    <p className="text-sm mt-1">
                      Esta hoja contiene información sobre todos los usuarios registrados en el sistema,
                      incluyendo nombres, correos electrónicos, empresas y saldos de monedas.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nombre de la hoja</h3>
                    <p className="text-sm text-gray-500">users</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Última sincronización</h3>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Campos exportados</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Badge>ID</Badge>
                    <Badge>Nombre</Badge>
                    <Badge>Email</Badge>
                    <Badge>Teléfono</Badge>
                    <Badge>Empresa</Badge>
                    <Badge>Monedas</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
                <AlertDescription className="flex items-start">
                  <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
                  <div>
                    <p className="font-medium">Información sobre Datos de Productos</p>
                    <p className="text-sm mt-1">
                      Esta hoja contiene información sobre todos los productos disponibles,
                      incluyendo nombres, precios, categorías, descripciones y niveles de stock.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nombre de la hoja</h3>
                    <p className="text-sm text-gray-500">products</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Última sincronización</h3>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Campos exportados</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Badge>ID</Badge>
                    <Badge>Nombre</Badge>
                    <Badge>Categoría</Badge>
                    <Badge>Precio</Badge>
                    <Badge>Descripción</Badge>
                    <Badge>Código QR</Badge>
                    <Badge>Stock</Badge>
                    <Badge>Imagen URL</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Datos de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-6">
                <AlertDescription className="flex items-start">
                  <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
                  <div>
                    <p className="font-medium">Información sobre Datos de Órdenes</p>
                    <p className="text-sm mt-1">
                      Esta hoja contiene información sobre todas las compras realizadas,
                      incluyendo IDs de usuario, fechas, montos totales y productos adquiridos.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Nombre de la hoja</h3>
                    <p className="text-sm text-gray-500">orders</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Última sincronización</h3>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Campos exportados</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Badge>ID</Badge>
                    <Badge>ID de Usuario</Badge>
                    <Badge>Fecha</Badge>
                    <Badge>Total</Badge>
                    <Badge>Código de Recibo</Badge>
                    <Badge>Productos</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {children}
    </span>
  );
}