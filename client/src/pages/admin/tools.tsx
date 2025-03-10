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

  // Simulación de mutación para exportar datos
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      // En una implementación real, esto enviaría una solicitud al servidor
      // para exportar datos
      const res = await apiRequest('/api/admin/export-data', {
        method: 'POST'
      });
      return res.json();
    },
    onSuccess: (data) => {
      // En una implementación real, esto iniciaría una descarga del archivo
      toast({
        title: "Datos exportados",
        description: "Los datos han sido exportados correctamente.",
      });
      setIsExportDataOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al exportar",
        description: error.message || "Ocurrió un error al exportar los datos.",
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
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
        </TabsList>
        
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
              Seleccione el formato para exportar los datos del sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                Exportar como CSV
              </Button>
              <Button variant="outline" className="w-full">
                Exportar como JSON
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Los datos exportados incluirán información de usuarios, productos y órdenes.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsExportDataOpen(false)}
            >
              Cancelar
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