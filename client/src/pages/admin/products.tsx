import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateQRCodeURL, formatPrice } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { categories } from "@/contexts/ShoppingContext";
import { Product } from "@/contexts/ShoppingContext";

export default function AdminProducts() {
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState("");
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });
  
  // Add new product
  const addProduct = useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => {
      return apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setOpenDialog(false);
      setCurrentProduct(null);
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    }
  });
  
  // Functions to handle form
  const handleOpenNewProduct = () => {
    setCurrentProduct({
      name: "",
      category: "",
      price: 0,
      description: "",
      imageUrl: "",
      qrCode: `QRPROD${Math.floor(Math.random() * 90000) + 10000}`, // Generate random QR code
    });
    setIsEditing(false);
    setOpenDialog(true);
    
    // Generate QR code preview
    if (currentProduct?.qrCode) {
      setGeneratedQRCode(generateQRCodeURL(currentProduct.qrCode, 200));
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setOpenDialog(true);
    
    // Generate QR code preview
    if (product.qrCode) {
      setGeneratedQRCode(generateQRCodeURL(product.qrCode, 200));
    }
  };
  
  const handleSubmit = () => {
    if (!currentProduct) return;
    
    if (!currentProduct.name || !currentProduct.category || currentProduct.price === undefined || !currentProduct.description) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }
    
    // For now, we'll just handle adding new products
    // In a real app, we would also handle editing
    if (!isEditing) {
      addProduct.mutate(currentProduct as Omit<Product, 'id'>);
    }
  };
  
  // Generate QR code when qrCode field changes
  useEffect(() => {
    if (currentProduct?.qrCode) {
      setGeneratedQRCode(generateQRCodeURL(currentProduct.qrCode, 200));
    }
  }, [currentProduct?.qrCode]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestión de Productos</h2>
        <Button onClick={handleOpenNewProduct}>
          Agregar Producto
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Cargando productos...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="bg-gray-50 py-4">
            <CardTitle className="text-lg">Inventario de Productos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Código QR</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={generateQRCodeURL(product.qrCode, 100)}
                          alt="QR Code"
                          className="w-8 h-8 object-contain"
                        />
                        <span className="text-xs text-gray-500">{product.qrCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No hay productos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Dialog for adding/editing products */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Producto" : "Agregar Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  placeholder="Nombre del producto"
                  value={currentProduct?.name || ""}
                  onChange={(e) => setCurrentProduct({
                    ...currentProduct,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={currentProduct?.category || ""}
                  onValueChange={(value) => setCurrentProduct({
                    ...currentProduct,
                    category: value
                  })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Precio (Monedas)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Precio en monedas"
                  value={currentProduct?.price || 0}
                  onChange={(e) => setCurrentProduct({
                    ...currentProduct,
                    price: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  placeholder="URL de la imagen del producto"
                  value={currentProduct?.imageUrl || ""}
                  onChange={(e) => setCurrentProduct({
                    ...currentProduct,
                    imageUrl: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción del producto"
                  rows={3}
                  value={currentProduct?.description || ""}
                  onChange={(e) => setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">Código QR</Label>
                <Input
                  id="qrCode"
                  placeholder="Código QR único"
                  value={currentProduct?.qrCode || ""}
                  onChange={(e) => setCurrentProduct({
                    ...currentProduct,
                    qrCode: e.target.value
                  })}
                />
              </div>
              
              {/* QR Code Preview */}
              <div className="border rounded-md p-4 flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-2">Vista previa del Código QR:</p>
                {generatedQRCode ? (
                  <img 
                    src={generatedQRCode}
                    alt="QR Code Preview"
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-xs text-gray-400">Sin código QR</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{currentProduct?.qrCode || ""}</p>
              </div>
              
              {/* Image Preview */}
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-500 mb-2">Vista previa de la imagen:</p>
                {currentProduct?.imageUrl ? (
                  <img 
                    src={currentProduct.imageUrl}
                    alt="Product Preview"
                    className="w-full h-40 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-xs text-gray-400">Sin imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={addProduct.isPending}>
              {addProduct.isPending ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}