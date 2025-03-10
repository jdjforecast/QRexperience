import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import QRCode from "@/components/ui/qr-code";
import { generateQRCodeURL } from "@/lib/utils";
import { categories } from "@/contexts/ShoppingContext";
import { Product } from "@/contexts/ShoppingContext";

// Tipo para el formulario de producto
interface ProductFormData {
  id?: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  qrCode?: string;
}

export default function AdminProducts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductFormData | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: categories[0],
    price: 0,
    description: "",
    imageUrl: "",
  });
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedProductQR, setSelectedProductQR] = useState<Product | null>(null);

  // Consulta para obtener productos
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  // Mutación para crear producto
  const createProductMutation = useMutation({
    mutationFn: async (newProduct: ProductFormData) => {
      const res = await apiRequest('POST', '/api/products', newProduct);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Producto creado",
        description: "El producto ha sido creado exitosamente.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el producto.",
        variant: "destructive",
      });
    }
  });

  // Mutación para actualizar producto
  const updateProductMutation = useMutation({
    mutationFn: async (product: ProductFormData) => {
      const res = await apiRequest('PATCH', `/api/products/${product.id}`, product);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Producto actualizado",
        description: "El producto ha sido actualizado exitosamente.",
      });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    }
  });

  // Mutación para eliminar producto
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest('DELETE', `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  });

  // Filtrar productos
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  // Manejar selección de categoría
  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  // Manejar envío del formulario de creación
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generar QR code único basado en la fecha y nombre
    const qrCode = `PRODUCT_${Date.now()}_${formData.name.substring(0, 5).replace(/\s/g, '')}`;
    createProductMutation.mutate({
      ...formData,
      qrCode
    });
  };

  // Manejar envío del formulario de edición
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productToEdit?.id) {
      updateProductMutation.mutate({
        ...formData,
        id: productToEdit.id,
      });
    }
  };

  // Abrir modal de edición
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      qrCode: product.qrCode,
    });
    setIsEditDialogOpen(true);
  };

  // Abrir modal de QR
  const handleShowQR = (product: Product) => {
    setSelectedProductQR(product);
    setIsQRDialogOpen(true);
  };

  // Manejar eliminación de producto
  const handleDeleteProduct = (productId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      category: categories[0],
      price: 0,
      description: "",
      imageUrl: "",
    });
    setProductToEdit(null);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Cargando productos...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">Error al cargar productos</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Agregar Producto</Button>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar:</Label>
              <Input 
                id="search"
                placeholder="Buscar por nombre o descripción" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="category-filter">Categoría:</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Lista de Productos ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Categoría</th>
                  <th className="p-4 font-medium">Precio</th>
                  <th className="p-4 font-medium">Código QR</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge>{product.category}</Badge>
                    </td>
                    <td className="p-4">{product.price} monedas</td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleShowQR(product)}
                      >
                        Ver QR
                      </Button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProduct(product)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para agregar producto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete los detalles del nuevo producto a agregar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select name="category" value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (monedas)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de Imagen</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createProductMutation.isPending}>
                {createProductMutation.isPending ? "Guardando..." : "Guardar Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar producto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifique los detalles del producto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Producto</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Select name="category" value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Precio (monedas)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">URL de Imagen</Label>
                  <Input
                    id="edit-imageUrl"
                    name="imageUrl"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {formData.qrCode && (
                <div className="space-y-2">
                  <Label htmlFor="edit-qrCode">Código QR (solo lectura)</Label>
                  <Input
                    id="edit-qrCode"
                    name="qrCode"
                    value={formData.qrCode}
                    readOnly
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? "Actualizando..." : "Actualizar Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para mostrar código QR */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Código QR del Producto</DialogTitle>
            <DialogDescription>
              {selectedProductQR?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {selectedProductQR && (
              <>
                <QRCode 
                  text={selectedProductQR.qrCode} 
                  size={250}
                  className="mb-4"
                />
                <p className="text-center text-sm text-gray-600">
                  Código: {selectedProductQR.qrCode}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsQRDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}