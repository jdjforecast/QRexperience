import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Order, OrderItem, User, Product } from "@/contexts/ShoppingContext";

export default function AdminOrders() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Consulta para obtener órdenes
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders']
  });

  // Consulta para obtener usuarios
  const { data: users = [], isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  // Consulta para obtener productos
  const { data: products = [], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  // Función para obtener detalles de orden
  const getOrderItems = (orderId: number): OrderItem[] => {
    const order = orders.find(o => o.id === orderId);
    return order?.items || [];
  };

  // Obtener nombre de usuario
  const getUserName = (userId: number): string => {
    const user = users.find((user: User) => user.id === userId);
    return user ? user.name : `Usuario #${userId}`;
  };

  // Obtener producto por ID
  const getProductById = (productId: number): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter((order: Order) => {
    const user = users.find((u: User) => u.id === order.userId);
    const receiptMatches = order.receiptCode.toLowerCase().includes(searchTerm.toLowerCase());
    const userMatches = user && user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return receiptMatches || userMatches;
  });

  // Manejar apertura de detalles de orden
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const isLoading = isOrdersLoading || isUsersLoading || isProductsLoading;

  if (isLoading) {
    return <div className="py-8 text-center">Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por código de recibo o nombre de usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Historial de Órdenes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Código</th>
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Fecha</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order: Order) => {
                  const orderDate = new Date(order.orderDate);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <Badge variant="outline">{order.receiptCode}</Badge>
                      </td>
                      <td className="p-4">
                        {getUserName(order.userId)}
                      </td>
                      <td className="p-4">
                        {formatDate(orderDate)}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          {order.total} monedas
                        </Badge>
                      </td>
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
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No se encontraron órdenes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles de orden */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-sm font-medium">Código:</span>
                    <Badge variant="outline" className="ml-2">{selectedOrder.receiptCode}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Usuario:</span>
                    <span className="ml-2">{getUserName(selectedOrder.userId)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Fecha:</span>
                    <span className="ml-2">{formatDate(new Date(selectedOrder.orderDate))}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Total:</span>
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                      {selectedOrder.total} monedas
                    </Badge>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="py-4">
              <h3 className="font-medium mb-2">Productos Comprados:</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-4">
                {getOrderItems(selectedOrder.id).map((item: OrderItem) => {
                  const product = getProductById(item.productId);
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {product?.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product?.name || `Producto #${item.productId}`}</p>
                          {product && <Badge>{product.category}</Badge>}
                        </div>
                      </div>
                      <Badge variant="outline">{item.price} monedas</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}