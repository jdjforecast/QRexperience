import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandSettings } from "@/contexts/ShoppingContext";

export default function AdminTools() {
  const { toast } = useToast();
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useState<{
    logoUrl: string;
    primaryColor: string;
    storeName: string;
    storeDescription: string;
  }>({
    logoUrl: "",
    primaryColor: "#7c3aed",
    storeName: "",
    storeDescription: ""
  });

  // Consulta para obtener configuración de marca
  const { data, isLoading, error } = useQuery<BrandSettings>({
    queryKey: ['/api/brand-settings'],
    onSuccess: (data) => {
      setBrandSettings({
        logoUrl: data.logoUrl || "",
        primaryColor: data.primaryColor || "#7c3aed",
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || ""
      });
    }
  });

  // Mutación para actualizar configuración de marca
  const updateBrandMutation = useMutation({
    mutationFn: async (settings: typeof brandSettings) => {
      const res = await apiRequest('POST', '/api/brand-settings', settings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/brand-settings'] });
      setIsBrandDialogOpen(false);
      toast({
        title: "Configuración actualizada",
        description: "La configuración de la marca ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    }
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrandSettings({
      ...brandSettings,
      [name]: value,
    });
  };

  // Manejar envío del formulario
  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandMutation.mutate(brandSettings);
  };

  // Exportar datos a CSV
  const handleExportCSV = (type: 'users' | 'products' | 'orders') => {
    window.open(`/api/export/${type}`, '_blank');
  };

  if (isLoading) {
    return <div className="py-8 text-center">Cargando herramientas...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">Error al cargar las herramientas</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Herramientas de Administración</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gestión de marca */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Marca</CardTitle>
            <CardDescription>
              Personalice la apariencia y configuración de la tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-gray-50">
              {brandSettings.logoUrl && (
                <img 
                  src={brandSettings.logoUrl} 
                  alt="Logo" 
                  className="h-24 mx-auto mb-4 object-contain"
                />
              )}
              <div className="text-center">
                <h3 className="text-lg font-medium">{brandSettings.storeName || "Nombre de la Tienda"}</h3>
                <p className="text-sm text-gray-500 mt-1">{brandSettings.storeDescription || "Descripción de la tienda"}</p>
              </div>
              <div 
                className="mt-3 w-20 h-4 rounded" 
                style={{ backgroundColor: brandSettings.primaryColor }}
              ></div>
            </div>
            <Button 
              className="w-full" 
              onClick={() => setIsBrandDialogOpen(true)}
            >
              Editar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Exportación de datos */}
        <Card>
          <CardHeader>
            <CardTitle>Exportación de Datos</CardTitle>
            <CardDescription>
              Exporte datos del sistema para backup o análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV('users')}
              >
                Exportar Usuarios CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV('products')}
              >
                Exportar Productos CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportCSV('orders')}
              >
                Exportar Órdenes CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para editar configuración de marca */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configuración de la Marca</DialogTitle>
            <DialogDescription>
              Personalice la apariencia y configuración de la tienda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBrandSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nombre de la Tienda</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={brandSettings.storeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Descripción</Label>
                <Textarea
                  id="storeDescription"
                  name="storeDescription"
                  rows={3}
                  value={brandSettings.storeDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL del Logo</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    placeholder="https://ejemplo.com/logo.png"
                    value={brandSettings.logoUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      value={brandSettings.primaryColor}
                      onChange={handleInputChange}
                      className="w-14 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={brandSettings.primaryColor}
                      onChange={handleInputChange}
                      name="primaryColor"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsBrandDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateBrandMutation.isPending}>
                {updateBrandMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}