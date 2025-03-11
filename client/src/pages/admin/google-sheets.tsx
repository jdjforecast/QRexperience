import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";

interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  spreadsheetUrl?: string;
}

interface GoogleDriveConfig {
  folderId: string;
  clientEmail: string;
  privateKey: string;
  folderUrl?: string;
}

interface GoogleConfig {
  sheets?: GoogleSheetsConfig;
  drive?: GoogleDriveConfig;
  connected: boolean;
  simpleMode: boolean;
}

export default function GoogleSheetsAdmin() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [configTab, setConfigTab] = useState("sheets");
  const [simpleMode, setSimpleMode] = useState(true);
  const [simpleSheetsUrl, setSimpleSheetsUrl] = useState('');
  const [simpleDriveUrl, setSimpleDriveUrl] = useState('');
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
  
  // Consulta para obtener la configuración actual
  const { data: googleConfig } = useQuery({
    queryKey: ['/api/admin/google-config'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/google-config');
      return res.json() as Promise<GoogleConfig>;
    }
  });
  
  // Efecto para cargar la configuración actual
  useEffect(() => {
    if (googleConfig) {
      setSimpleMode(googleConfig.simpleMode);
      
      if (googleConfig.sheets) {
        setSheetsConfig(googleConfig.sheets);
        if (googleConfig.sheets.spreadsheetUrl) {
          setSimpleSheetsUrl(googleConfig.sheets.spreadsheetUrl);
        }
      }
      
      if (googleConfig.drive) {
        setDriveConfig(googleConfig.drive);
        if (googleConfig.drive.folderUrl) {
          setSimpleDriveUrl(googleConfig.drive.folderUrl);
        }
      }
    }
  }, [googleConfig]);
  
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
      // Recargar la configuración
      queryClient.invalidateQueries({ queryKey: ['/api/admin/google-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para guardar configuración simple de Google Sheets
  const saveSimpleSheetsMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest('POST', '/api/admin/simple-google-sheets-config', { url });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración simple de Google Sheets ha sido guardada exitosamente.",
      });
      // Recargar la configuración
      queryClient.invalidateQueries({ queryKey: ['/api/admin/google-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración simple.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para guardar configuración simple de Google Drive
  const saveSimpleDriveMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest('POST', '/api/admin/simple-google-drive-config', { url });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuración guardada",
        description: "La configuración simple de Google Drive ha sido guardada exitosamente.",
      });
      // Recargar la configuración
      queryClient.invalidateQueries({ queryKey: ['/api/admin/google-config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración simple.",
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
  
  // Handler para cambiar el modo simple/avanzado
  const handleToggleSimpleMode = () => {
    setSimpleMode(!simpleMode);
  };
  
  // Handler para cambios en URL simple de Google Sheets
  const handleSimpleSheetsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimpleSheetsUrl(e.target.value);
  };
  
  // Handler para cambios en URL simple de Google Drive
  const handleSimpleDriveUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimpleDriveUrl(e.target.value);
  };
  
  // Handler para guardar URL simple de Google Sheets
  const handleSaveSimpleSheetsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveSimpleSheetsMutation.mutate(simpleSheetsUrl);
  };
  
  // Handler para guardar URL simple de Google Drive
  const handleSaveSimpleDriveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveSimpleDriveMutation.mutate(simpleDriveUrl);
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configuración de Google</CardTitle>
              <CardDescription>
                Configure sus credenciales de Google Sheets o Drive para sincronizar datos
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="simpleMode" className="text-sm text-gray-600">Modo Simple</Label>
              <Switch
                id="simpleMode"
                checked={simpleMode}
                onCheckedChange={handleToggleSimpleMode}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sheets" value={configTab} onValueChange={setConfigTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
              <TabsTrigger value="drive">Google Drive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sheets">
              {simpleMode ? (
                <form onSubmit={handleSaveSimpleSheetsUrl}>
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
                      <AlertDescription className="flex items-start">
                        <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
                        <div>
                          <p className="font-medium">Modo Simple Activado</p>
                          <p className="text-sm mt-1">
                            No necesita crear un proyecto en Google Cloud Console. 
                            Simplemente proporcione la URL completa de su hoja de cálculo y 
                            asegúrese de que esté compartida con acceso público o con cualquier persona que tenga el enlace.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="simpleSheetsUrl">URL de Google Sheets</Label>
                      <Input 
                        id="simpleSheetsUrl"
                        value={simpleSheetsUrl}
                        onChange={handleSimpleSheetsUrlChange}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      />
                      <p className="text-sm text-gray-500">
                        URL completa de su hoja de cálculo de Google Sheets
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-2"
                      disabled={saveSimpleSheetsMutation.isPending}
                    >
                      {saveSimpleSheetsMutation.isPending ? 'Guardando...' : 'Guardar URL de Hoja'}
                    </Button>
                  </div>
                </form>
              ) : (
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
              )}
            </TabsContent>
            
            <TabsContent value="drive">
              {simpleMode ? (
                <form onSubmit={handleSaveSimpleDriveUrl}>
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
                      <AlertDescription className="flex items-start">
                        <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
                        <div>
                          <p className="font-medium">Modo Simple Activado</p>
                          <p className="text-sm mt-1">
                            No necesita crear un proyecto en Google Cloud Console. 
                            Simplemente proporcione la URL completa de su carpeta de Google Drive y 
                            asegúrese de que esté compartida con acceso público o con cualquier persona que tenga el enlace.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <Label htmlFor="simpleDriveUrl">URL de Google Drive</Label>
                      <Input 
                        id="simpleDriveUrl"
                        value={simpleDriveUrl}
                        onChange={handleSimpleDriveUrlChange}
                        placeholder="https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J"
                      />
                      <p className="text-sm text-gray-500">
                        URL completa de su carpeta de Google Drive
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-2"
                      disabled={saveSimpleDriveMutation.isPending}
                    >
                      {saveSimpleDriveMutation.isPending ? 'Guardando...' : 'Guardar URL de Carpeta'}
                    </Button>
                  </div>
                </form>
              ) : (
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Alert className="w-full bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription className="flex items-start">
              <i className="fa-solid fa-info-circle mt-0.5 mr-3"></i>
              <div>
                {simpleMode ? (
                  <>
                    <p className="font-medium">Modo Simple - Configuración rápida</p>
                    <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                      <li>Cree una hoja de cálculo en <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Sheets</a></li>
                      <li>Haga clic en "Compartir" en la esquina superior derecha</li>
                      <li>Seleccione "Cualquier persona con el enlace puede ver"</li>
                      <li>Copie la URL completa y péguela en el campo de arriba</li>
                    </ol>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Modo Avanzado - Cómo obtener credenciales</p>
                    <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                      <li>Cree un proyecto en <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>Habilite las APIs de Google Sheets y Google Drive</li>
                      <li>Cree una cuenta de servicio y descargue la clave JSON</li>
                      <li>Comparta su hoja/carpeta con el email de la cuenta de servicio</li>
                    </ol>
                  </>
                )}
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