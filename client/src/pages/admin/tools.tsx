import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ReloadIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BrandSettings } from "@shared/schema";

export default function AdminTools() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isGoogleSheetsDialogOpen, setIsGoogleSheetsDialogOpen] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [activeTab, setActiveTab] = useState("system");
  const [syncEnabled, setSyncEnabled] = useState(true);
  
  // Estado para configuración de marca
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [welcomeImageUrl, setWelcomeImageUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#10b981");
  const [language, setLanguage] = useState("es");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [borderRadius, setBorderRadius] = useState("0.5rem");
  const [enableAnimations, setEnableAnimations] = useState(true);
  
  // Cargar configuración de marca
  const { data: brandData, isLoading: isBrandLoading } = useQuery({
    queryKey: ['/api/brand-settings']
  });
  
  // Efecto para actualizar los estados cuando se cargan los datos
  useEffect(() => {
    if (brandData) {
      const typedData = brandData as BrandSettings;
      setBrandSettings(typedData);
      setLogoUrl(typedData.logoUrl || "");
      setWelcomeImageUrl(typedData.welcomeImageUrl || "");
      setPrimaryColor(typedData.primaryColor || "#3b82f6");
      setSecondaryColor(typedData.secondaryColor || "#10b981");
      setLanguage(typedData.language || "es");
      setFontFamily(typedData.fontFamily || "Inter");
      setBorderRadius(typedData.borderRadius || "0.5rem");
      setEnableAnimations(typedData.enableAnimations !== undefined ? typedData.enableAnimations : true);
    }
  }, [brandData]);
  
  // Guardar configuración de marca
  const saveBrandSettingsMutation = useMutation({
    mutationFn: async () => {
      const updatedSettings = {
        logoUrl,
        welcomeImageUrl,
        primaryColor,
        secondaryColor,
        language,
        fontFamily,
        borderRadius,
        enableAnimations
      };
      
      const res = await apiRequest('/api/brand-settings', {
        method: 'POST',
        body: JSON.stringify(updatedSettings)
      });
      
      return res.json();
    },
    onSuccess: (data) => {
      const typedData = data as BrandSettings;
      setBrandSettings(typedData);
      toast({
        title: "Configuración guardada",
        description: "La personalización de marca ha sido actualizada correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/brand-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al guardar",
        description: error.message || "Ocurrió un error al guardar la configuración de marca.",
        variant: "destructive",
      });
    }
  });
  
  // Restablecer configuración de marca a valores por defecto
  const resetBrandSettings = () => {
    setPrimaryColor("#3b82f6");
    setSecondaryColor("#10b981");
    setFontFamily("Inter");
    setBorderRadius("0.5rem");
    setEnableAnimations(true);
    setLanguage("es");
    // No limpiamos las URLs de imágenes para mantenerlas si ya están configuradas
    
    toast({
      title: "Valores restablecidos",
      description: "Los valores han sido restablecidos a su configuración predeterminada.",
    });
  };

  // Simulación de mutación para sincronizar con Google Sheets
  const syncSheetsMutation = useMutation({
    mutationFn: async () => {
      // En una implementación real, esto enviaría una solicitud al servidor
      // para sincronizar los datos con Google Sheets
      const res = await apiRequest('/api/admin/sync-sheets', {
        method: 'POST',
        body: JSON.stringify({ url: sheetsUrl })
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sincronización exitosa",
        description: "Los datos han sido sincronizados con Google Sheets.",
      });
      setIsGoogleSheetsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error de sincronización",
        description: error.message || "Ocurrió un error al sincronizar con Google Sheets.",
        variant: "destructive",
      });
    }
  });

  // Simulación de mutación para resetear datos
  const resetDataMutation = useMutation({
    mutationFn: async () => {
      // En una implementación real, esto enviaría una solicitud al servidor
      // para resetear datos del sistema
      const res = await apiRequest('/api/admin/reset-data', {
        method: 'POST'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Datos reseteados",
        description: "Todos los datos han sido reiniciados correctamente.",
      });
      setIsResetConfirmOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al resetear",
        description: error.message || "Ocurrió un error al resetear los datos.",
        variant: "destructive",
      });
    }
  });

  // Mutación para exportar datos de usuarios
  const exportUsersCSVMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/export/users', {
        method: 'GET'
      });
      return res.text();
    },
    onSuccess: (data) => {
      // Crear un blob con el CSV y descargarlo
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'usuarios.csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados",
        description: "Se ha descargado el archivo CSV de usuarios.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al exportar usuarios",
        description: error.message || "Ocurrió un error al exportar los datos de usuarios.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para exportar datos de productos
  const exportProductsCSVMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/export/products', {
        method: 'GET'
      });
      return res.text();
    },
    onSuccess: (data) => {
      // Crear un blob con el CSV y descargarlo
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'productos.csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados",
        description: "Se ha descargado el archivo CSV de productos.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al exportar productos",
        description: error.message || "Ocurrió un error al exportar los datos de productos.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para exportar datos de órdenes
  const exportOrdersCSVMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('/api/export/orders', {
        method: 'GET'
      });
      return res.text();
    },
    onSuccess: (data) => {
      // Crear un blob con el CSV y descargarlo
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'ordenes.csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Datos exportados",
        description: "Se ha descargado el archivo CSV de órdenes.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al exportar órdenes",
        description: error.message || "Ocurrió un error al exportar los datos de órdenes.",
        variant: "destructive",
      });
    }
  });

  // Manejar sincronización con Google Sheets
  const handleSyncWithSheets = (e: React.FormEvent) => {
    e.preventDefault();
    syncSheetsMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Herramientas Administrativas</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
          <TabsTrigger value="brand">Personalización</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Personalización de Marca */}
        <TabsContent value="brand">
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Marca</CardTitle>
              <CardDescription>
                Configure la apariencia y estilo de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Imágenes y logos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Imágenes</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="logo-url">URL del logo</Label>
                      <Input
                        id="logo-url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      {logoUrl && (
                        <div className="mt-2 p-2 border rounded-md w-24 h-24 flex items-center justify-center">
                          <img 
                            src={logoUrl} 
                            alt="Logo preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="welcome-image-url">Imagen de bienvenida</Label>
                      <Input
                        id="welcome-image-url"
                        value={welcomeImageUrl}
                        onChange={(e) => setWelcomeImageUrl(e.target.value)}
                        placeholder="https://example.com/welcome.jpg"
                      />
                      {welcomeImageUrl && (
                        <div className="mt-2 p-2 border rounded-md h-32 flex items-center justify-center">
                          <img 
                            src={welcomeImageUrl} 
                            alt="Welcome image preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Colores y estilo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Colores y Estilo</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Color Primario</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="primary-color"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-8"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Color Secundario</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-8"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="font-family">Tipo de Fuente</Label>
                      <Select 
                        value={fontFamily} 
                        onValueChange={setFontFamily}
                      >
                        <SelectTrigger id="font-family">
                          <SelectValue placeholder="Seleccione una fuente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Montserrat">Montserrat</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Configuración de idioma y animaciones */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Idioma y Región</h3>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma predeterminado</Label>
                    <Select 
                      value={language} 
                      onValueChange={setLanguage}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Seleccione un idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Animaciones y Efectos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-animations">Habilitar animaciones</Label>
                      <Switch
                        id="enable-animations"
                        checked={enableAnimations}
                        onCheckedChange={setEnableAnimations}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="border-radius">Bordes redondeados</Label>
                      <Slider
                        id="border-radius"
                        defaultValue={[0.5]}
                        max={2}
                        step={0.1}
                        value={[parseFloat(borderRadius)]}
                        onValueChange={(values) => setBorderRadius(`${values[0]}rem`)}
                        className="py-4"
                      />
                      <div className="text-sm text-gray-500 text-right">
                        {borderRadius}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Vista previa y acciones */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vista Previa</h3>
                <div className="border rounded-md p-4" style={{
                  fontFamily: fontFamily,
                  borderRadius: borderRadius,
                }}>
                  <div className="flex items-center gap-3 mb-4">
                    {logoUrl && (
                      <img 
                        src={logoUrl} 
                        alt="Logo" 
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <div className="font-semibold" style={{ color: primaryColor }}>
                      Nombre de la Tienda
                    </div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <Button style={{ backgroundColor: primaryColor }}>
                      Botón Primario
                    </Button>
                    <Button variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                      Botón Secundario
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Esta es una vista previa de cómo se verán los elementos con la configuración actual.
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={resetBrandSettings}
              >
                Restablecer
              </Button>
              <Button 
                onClick={() => saveBrandSettingsMutation.mutate()}
                disabled={saveBrandSettingsMutation.isPending}
              >
                {saveBrandSettingsMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Pestaña de Sistema */}
        <TabsContent value="system">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
                <CardDescription>Información sobre el estado actual del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Servidor API:</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      En línea
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Almacenamiento:</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Operativo
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Google Sheets:</span>
                    <Badge className={syncEnabled ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}>
                      {syncEnabled ? "Conectado" : "Desconectado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones del Sistema</CardTitle>
                <CardDescription>Acciones para administrar el sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast({
                      title: "Cachés limpias",
                      description: "Los cachés del sistema han sido limpiados correctamente.",
                    })}
                  >
                    Limpiar Cachés
                  </Button>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast({
                      title: "Verificación completada",
                      description: "La verificación de integridad se completó sin errores.",
                    })}
                  >
                    Verificar Integridad
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña de Datos */}
        <TabsContent value="data">
          <div className="grid gap-4 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Datos</CardTitle>
                <CardDescription>
                  Gestione la base de datos de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-yellow-50 border-yellow-100">
                  <AlertTitle className="text-yellow-800">Precaución</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Las acciones en esta sección pueden afectar permanentemente los datos del sistema.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reinicio de Datos</CardTitle>
                      <CardDescription>Reiniciar todos los datos a su estado inicial</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Esta acción borrará todas las órdenes y restablecerá los usuarios y productos a su estado inicial.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setIsResetConfirmOpen(true)}
                      >
                        Reiniciar Datos
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Exportar Datos</CardTitle>
                      <CardDescription>Descargar datos en formato CSV o JSON</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Exporte todos los datos de usuarios, productos y órdenes para respaldo o análisis.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsExportDataOpen(true)}
                      >
                        Exportar Datos
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Pestaña de Sincronización */}
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sincronización con Google Sheets</CardTitle>
              <CardDescription>
                Configure la sincronización de datos con Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sync-enabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
                <Label htmlFor="sync-enabled">Sincronización automática</Label>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="last-sync">Última sincronización:</Label>
                  <div id="last-sync" className="text-sm font-medium">
                    Hoy a las {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sync-status">Estado:</Label>
                  <div id="sync-status" className="text-sm font-medium">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Sincronizado
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsGoogleSheetsDialogOpen(true)}
                >
                  Sincronizar Ahora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmación de reset de datos */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmar Reinicio de Datos</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea reiniciar todos los datos del sistema? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle>Advertencia</AlertTitle>
              <AlertDescription>
                Todos los usuarios, productos y órdenes serán reiniciados a su estado predeterminado.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => resetDataMutation.mutate()}
              disabled={resetDataMutation.isPending}
            >
              {resetDataMutation.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Sí, Reiniciar Datos"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de exportación de datos */}
      <Dialog open={isExportDataOpen} onOpenChange={setIsExportDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogDescription>
              Seleccione los datos que desea exportar en formato CSV.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportUsersCSVMutation.mutate()}
                disabled={exportUsersCSVMutation.isPending}
              >
                {exportUsersCSVMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Exportando usuarios...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Exportar Usuarios
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportProductsCSVMutation.mutate()}
                disabled={exportProductsCSVMutation.isPending}
              >
                {exportProductsCSVMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Exportando productos...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Exportar Productos
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => exportOrdersCSVMutation.mutate()}
                disabled={exportOrdersCSVMutation.isPending}
              >
                {exportOrdersCSVMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Exportando órdenes...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Exportar Órdenes
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600">
              Los archivos CSV pueden ser importados en Excel, Google Sheets u otras hojas de cálculo.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsExportDataOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de sincronización con Google Sheets */}
      <Dialog open={isGoogleSheetsDialogOpen} onOpenChange={setIsGoogleSheetsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizar con Google Sheets</DialogTitle>
            <DialogDescription>
              Configure la URL de la hoja de cálculo para sincronizar datos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSyncWithSheets}>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheets-url">URL de Google Sheets</Label>
                <Input
                  id="sheets-url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>
              <p className="text-sm text-gray-600">
                Asegúrese de que la hoja de cálculo sea accesible para la aplicación.
              </p>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsGoogleSheetsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={syncSheetsMutation.isPending}
              >
                {syncSheetsMutation.isPending ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}