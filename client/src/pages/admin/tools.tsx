import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandSettings, User, Product, Order } from "@/contexts/ShoppingContext";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import QRScanner from "@/components/ui/qr-scanner";
import QRCode from "@/components/ui/qr-code";
import { generateQRCodeURL } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function AdminTools() {
  const { toast } = useToast();
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrResult, setQrResult] = useState<{ type: string; data: Product | Order | null }>({ 
    type: '', 
    data: null 
  });
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    coins: 100,
    isAdmin: false
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [brandSettings, setBrandSettings] = useState<{
    logoUrl: string;
    primaryColor: string;
    storeName: string;
    storeDescription: string;
    saleImageUrl: string; // Agregamos campo para la imagen SALE
  }>({
    logoUrl: "",
    primaryColor: "#7c3aed",
    storeName: "",
    storeDescription: "",
    saleImageUrl: "" // Valor inicial para la imagen SALE
  });

  // Consulta para obtener configuración de marca
  const { data, isLoading, error } = useQuery<BrandSettings>({
    queryKey: ['/api/brand-settings']
  });
  
  // Actualizar el estado cuando se reciben los datos
  React.useEffect(() => {
    if (data) {
      setBrandSettings({
        logoUrl: data.logoUrl || "",
        primaryColor: data.primaryColor || "#7c3aed",
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || "",
        saleImageUrl: data.saleImageUrl || ""
      });
    }
  }, [data]);

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

  // Mutación para crear usuario nuevo
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsUserDialogOpen(false);
      setNewUser({
        name: "",
        email: "",
        phone: "",
        coins: 100,
        isAdmin: false
      });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario.",
        variant: "destructive",
      });
    }
  });

  // Manejar cambios en el formulario de marca
  const handleBrandInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrandSettings({
      ...brandSettings,
      [name]: value,
    });
  };

  // Manejar cambios en el formulario de usuario
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setNewUser({
        ...newUser,
        [name]: checked,
      });
    } else if (name === 'coins') {
      const coins = parseInt(value) || 0;
      setNewUser({
        ...newUser,
        [name]: coins,
      });
    } else {
      setNewUser({
        ...newUser,
        [name]: value,
      });
    }
  };

  // Validar formulario de usuario
  const validateUserForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
    } = {};

    if (!newUser.name.trim()) {
      errors.name = "El nombre es requerido";
    }

    if (!newUser.email.trim()) {
      errors.email = "El correo electrónico es requerido";
    } else if (!isValidEmail(newUser.email)) {
      errors.email = "Correo electrónico inválido";
    }

    if (!newUser.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (!isValidPhone(newUser.phone)) {
      errors.phone = "Teléfono inválido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario de marca
  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandMutation.mutate(brandSettings);
  };

  // Manejar envío del formulario de usuario
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUserForm()) {
      createUserMutation.mutate(newUser);
    }
  };

  // Exportar datos a CSV
  const handleExportCSV = (type: 'users' | 'products' | 'orders') => {
    window.open(`/api/export/${type}`, '_blank');
  };
  
  // Manejar la lectura de códigos QR
  const handleQRScan = async (qrCode: string) => {
    setIsScannerOpen(false); // Cerrar el escáner una vez leído

    try {
      // Primero, intentamos ver si es un código QR de producto
      const productRes = await fetch(`/api/products/qr/${qrCode}`);
      
      if (productRes.ok) {
        const product = await productRes.json();
        setQrResult({ type: 'product', data: product });
        toast({
          title: "Producto encontrado",
          description: `Se ha encontrado el producto: ${product.name}`,
        });
        return;
      }
      
      // Si no es producto, verificamos si es un código de recibo
      // Verificamos todas las órdenes que tengan ese receiptCode
      const ordersRes = await fetch(`/api/admin/orders`);
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const foundOrder = orders.find((order: Order) => order.receiptCode === qrCode);
        
        if (foundOrder) {
          setQrResult({ type: 'order', data: foundOrder });
          toast({
            title: "Orden encontrada",
            description: `Se ha encontrado la orden con código: ${foundOrder.receiptCode}`,
          });
          return;
        }
      }
      
      // Si no se encuentra nada
      toast({
        title: "Código QR no reconocido",
        description: "No se pudo encontrar información asociada a este código QR.",
        variant: "destructive",
      });
      setQrResult({ type: '', data: null });
      
    } catch (error) {
      console.error("Error al escanear el código QR:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el código QR.",
        variant: "destructive",
      });
      setQrResult({ type: '', data: null });
    }
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

        {/* Gestión de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Cree nuevos usuarios y administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => setIsUserDialogOpen(true)}
            >
              Crear Nuevo Usuario
            </Button>
          </CardContent>
        </Card>

        {/* Lector de QR */}
        <Card>
          <CardHeader>
            <CardTitle>Lector de Códigos QR</CardTitle>
            <CardDescription>
              Escanee códigos QR de productos o recibos para ver su información
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => setIsScannerOpen(true)}
            >
              Escanear Código QR
            </Button>
            
            {qrResult.data && (
              <div className="mt-4 border rounded-md p-4 bg-gray-50">
                <h3 className="font-medium mb-2">
                  {qrResult.type === 'product' ? 'Información del Producto' : 'Información de la Orden'}
                </h3>
                
                {qrResult.type === 'product' && qrResult.data && (
                  <div className="space-y-2">
                    <div className="flex flex-col items-center mb-3">
                      <img 
                        src={qrResult.data.imageUrl} 
                        alt={qrResult.data.name} 
                        className="h-32 object-contain mb-2"
                      />
                      <QRCode text={qrResult.data.qrCode} size={100} />
                    </div>
                    <p><span className="font-medium">Nombre:</span> {qrResult.data.name}</p>
                    <p><span className="font-medium">Categoría:</span> {qrResult.data.category}</p>
                    <p><span className="font-medium">Precio:</span> {qrResult.data.price} coins</p>
                    <p><span className="font-medium">Stock:</span> {qrResult.data.stock} unidades</p>
                    <p><span className="font-medium">Código QR:</span> {qrResult.data.qrCode}</p>
                    <p><span className="font-medium">Descripción:</span> {qrResult.data.description}</p>
                  </div>
                )}
                
                {qrResult.type === 'order' && qrResult.data && (
                  <div className="space-y-2">
                    <div className="flex justify-center mb-3">
                      <QRCode text={qrResult.data.receiptCode} size={120} />
                    </div>
                    <p><span className="font-medium">Código de Recibo:</span> {qrResult.data.receiptCode}</p>
                    <p><span className="font-medium">ID de Usuario:</span> {qrResult.data.userId}</p>
                    <p><span className="font-medium">Fecha:</span> {new Date(qrResult.data.orderDate).toLocaleString()}</p>
                    <p><span className="font-medium">Total:</span> {qrResult.data.total} coins</p>
                    <Separator className="my-2" />
                    <p className="font-medium">Artículos:</p>
                    {qrResult.data.items && qrResult.data.items.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {qrResult.data.items.map((item: any) => (
                          <li key={item.id}>
                            {item.product ? item.product.name : `Producto ID: ${item.productId}`} - {item.price} coins
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No hay información detallada de productos</p>
                    )}
                  </div>
                )}
              </div>
            )}
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
                  onChange={handleBrandInputChange}
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
                  onChange={handleBrandInputChange}
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
                    onChange={handleBrandInputChange}
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
              
              {/* Campo para la imagen de SALE */}
              <div className="space-y-2">
                <Label htmlFor="saleImageUrl">URL de Imagen SALE (Banner Principal)</Label>
                <Input
                  id="saleImageUrl"
                  name="saleImageUrl"
                  placeholder="https://ejemplo.com/sale-banner.jpg"
                  value={brandSettings.saleImageUrl}
                  onChange={handleBrandInputChange}
                />
                {brandSettings.saleImageUrl && (
                  <div className="mt-2 border rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                    <img 
                      src={brandSettings.saleImageUrl} 
                      alt="Banner SALE" 
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Esta imagen se mostrará en la página de inicio como banner promocional.
                </p>
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
      
      {/* Modal para el lector de QR */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Escanear Código QR</DialogTitle>
            <DialogDescription>
              Apunte la cámara hacia un código QR de producto o de recibo de compra
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            {isScannerOpen && (
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => {
                  toast({
                    title: "Error",
                    description: error,
                    variant: "destructive",
                  });
                  setIsScannerOpen(false);
                }}
                onClose={() => setIsScannerOpen(false)}
              />
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsScannerOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}