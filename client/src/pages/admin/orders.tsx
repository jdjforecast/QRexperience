import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Order, User, OrderItem, Product } from "@/contexts/ShoppingContext";

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderProducts, setOrderProducts] = useState<Record<number, Product>>({});

  // Consulta para obtener órdenes
  const { data: orders = [], isLoading: isLoadingOrders, error: ordersError } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders']
  });

  // Consulta para obtener usuarios (para mostrar nombres)
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });
  
  // Consulta para obtener todos los productos
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  // Función para obtener los items de una orden específica
  const getOrderItems = (orderId: number): OrderItem[] => {
    const order = orders.find(o => o.id === orderId);
    return order?.items || [];
  };

  // Función para obtener el nombre de usuario
  const getUserName = (userId: number): string => {
    const user = users.find((user: User) => user.id === userId);
    return user ? user.name : `Usuario ${userId}`;
  };
  
  // Función para obtener el nombre del producto
  const getProductName = (productId: number): string => {
    const product = products.find((product) => product.id === productId);
    return product ? product.name : `Producto #${productId}`;
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter((order: Order) => {
    const user = users.find((u: User) => u.id === order.userId);
    return !searchTerm || 
           (user && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           order.receiptCode.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Mostrar detalles de la orden
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    
    // Cargar productos de esta orden
    const productMap: Record<number, Product> = {};
    const orderItems = getOrderItems(order.id);
    
    // Buscar cada producto en la lista de productos
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        productMap[item.productId] = product;
      }
    });
    
    setOrderProducts(productMap);
    setIsDetailsDialogOpen(true);
  };

  if (isLoadingOrders || isLoadingUsers || isLoadingProducts) {
    return <div className="py-8 text-center">Cargando datos...</div>;
  }

  if (ordersError || usersError || productsError) {
    return <div className="py-8 text-center text-red-600">Error al cargar datos</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="search-order">Buscar:</Label>
            <Input 
              id="search-order"
              placeholder="Buscar por cliente o código de recibo" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Lista de Órdenes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Productos</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order: Order) => {
                  const userName = getUserName(order.userId);
                  const itemCount = getOrderItems(order.id).length;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <Badge variant="outline">{order.receiptCode}</Badge>
                      </td>
                      <td className="p-4">{userName}</td>
                      <td className="p-4">{formatDate(new Date(order.orderDate))}</td>
                      <td className="p-4">
                        <Badge className="bg-primary">{order.total} monedas</Badge>
                      </td>
                      <td className="p-4">{itemCount} producto{itemCount !== 1 ? 's' : ''}</td>
                      <td className="p-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para detalles de la orden */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              Código: {selectedOrder?.receiptCode}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedOrder && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente:</p>
                    <p className="font-medium">{getUserName(selectedOrder.userId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha:</p>
                    <p className="font-medium">{formatDate(new Date(selectedOrder.orderDate))}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total:</p>
                  <p className="font-medium">{selectedOrder.total} monedas</p>
                </div>

                <div className="mt-4">
                  <p className="font-medium mb-2">Productos:</p>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getOrderItems(selectedOrder.id).map((item: OrderItem) => {
                        return (
                          <tr key={item.id} className="border-t">
                            <td className="p-2">{getProductName(item.productId)}</td>
                            <td className="p-2 text-right">{item.price} monedas</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="p-2 font-bold">Total</td>
                        <td className="p-2 text-right font-bold">{selectedOrder.total} monedas</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente Label para mantener la consistencia
function Label({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
      {children}
    </label>
  );
}