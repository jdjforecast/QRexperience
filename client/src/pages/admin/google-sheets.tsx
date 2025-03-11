import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

interface GoogleDriveConfig {
  folderId: string;
  clientEmail: string;
  privateKey: string;
}

export default function GoogleSheetsAdmin() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [configTab, setConfigTab] = useState("sheets");
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    clientEmail: '',
    privateKey: ''
  });
  const [driveConfig, setDriveConfig] = useState<GoogleDriveConfig>({
    folderId: '',
    clientEmail: '',
    privateKey: ''
  });
  const { toast } = useToast();
  
  // Mutación para guardar configuración de Google Sheets
  const saveSheetsMutation = useMutation({
    mutationFn: async (config: GoogleSheetsConfig) => {
      const res = await apiRequest('POST', '/api/admin/google-sheets-config', config);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración de Google Sheets ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para guardar configuración de Google Drive
  const saveDriveMutation = useMutation({
    mutationFn: async (config: GoogleDriveConfig) => {
      const res = await apiRequest('POST', '/api/admin/google-drive-config', config);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración de Google Drive ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  });
  
  // Handler para cambios en formulario de Google Sheets
  const handleSheetsConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSheetsConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler para cambios en formulario de Google Drive
  const handleDriveConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriveConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler para guardar configuración de Google Sheets
  const handleSaveSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSheetsMutation.mutate(sheetsConfig);
  };
  
  // Handler para guardar configuración de Google Drive
  const handleSaveDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveDriveMutation.mutate(driveConfig);
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Google Sheets y Drive</h1>
          <p className="text-gray-500">
            Administra y sincroniza tus datos con Google
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
      
      {/* Sección de configuración */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Configuración de Google</CardTitle>
          <CardDescription>
            Configure sus credenciales de Google Sheets o Drive para sincronizar datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sheets" value={configTab} onValueChange={setConfigTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
              <TabsTrigger value="drive">Google Drive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sheets">
              <form onSubmit={handleSaveSheetsConfig}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="spreadsheetId">ID de la Hoja de Cálculo</Label>
                    <Input 
                      id="spreadsheetId"
                      name="spreadsheetId"
                      value={sheetsConfig.spreadsheetId}
                      onChange={handleSheetsConfigChange}
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    />
                    <p className="text-sm text-gray-500">
                      Se encuentra en la URL de la hoja: https://docs.google.com/spreadsheets/d/<span className="font-medium">ID</span>/edit
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email de Cuenta de Servicio</Label>
                    <Input 
                      id="clientEmail"
                      name="clientEmail"
                      value={sheetsConfig.clientEmail}
                      onChange={handleSheetsConfigChange}
                      placeholder="proyecto-123456@proyecto.iam.gserviceaccount.com"
                    />
                    <p className="text-sm text-gray-500">
                      Email de la cuenta de servicio de Google Cloud
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="privateKey">Clave Privada</Label>
                    <Input 
                      id="privateKey"
                      name="privateKey"
                      value={sheetsConfig.privateKey}
                      onChange={handleSheetsConfigChange}
                      placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                    />
                    <p className="text-sm text-gray-500">
                      Clave privada de la cuenta de servicio (desde archivo JSON)
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={saveSheetsMutation.isPending}
                  >
                    {saveSheetsMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="drive">
              <form onSubmit={handleSaveDriveConfig}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="folderId">ID de la Carpeta</Label>
                    <Input 
                      id="folderId"
                      name="folderId"
                      value={driveConfig.folderId}
                      onChange={handleDriveConfigChange}
                      placeholder="1A2B3C4D5E6F7G8H9I0J"
                    />
                    <p className="text-sm text-gray-500">
                      Se encuentra en la URL de la carpeta: https://drive.google.com/drive/folders/<span className="font-medium">ID</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driveClientEmail">Email de Cuenta de Servicio</Label>
                    <Input 
                      id="driveClientEmail"
                      name="clientEmail"
                      value={driveConfig.clientEmail}
                      onChange={handleDriveConfigChange}
                      placeholder="proyecto-123456@proyecto.iam.gserviceaccount.com"
                    />
                    <p className="text-sm text-gray-500">
                      Email de la cuenta de servicio de Google Cloud
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="drivePrivateKey">Clave Privada</Label>
                    <Input 
                      id="drivePrivateKey"
                      name="privateKey"
                      value={driveConfig.privateKey}
                      onChange={handleDriveConfigChange}
                      placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                    />
                    <p className="text-sm text-gray-500">
                      Clave privada de la cuenta de servicio (desde archivo JSON)
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={saveDriveMutation.isPending}
                  >
                    {saveDriveMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Alert className="w-full bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription className="flex items-start">
              <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
              <div>
                <p className="font-medium">Cómo obtener credenciales</p>
                <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                  <li>Cree un proyecto en <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                  <li>Habilite las APIs de Google Sheets y Google Drive</li>
                  <li>Cree una cuenta de servicio y descargue la clave JSON</li>
                  <li>Comparta su hoja/carpeta con el email de la cuenta de servicio</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>

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