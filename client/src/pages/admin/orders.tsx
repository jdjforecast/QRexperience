import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatPrice } from "@/lib/utils";
import { Order, OrderItem, Product, User } from "@/contexts/ShoppingContext";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderDetailsDialog, setOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch users for order data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    refetchOnWindowFocus: false,
  });
  
  // Fetch products for order items
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });
  
  // Filter orders based on search term
  const filteredOrders = orders.filter((order: Order) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const user = users.find((u: User) => u.id === order.userId);
    
    return (
      order.id.toString().includes(search) ||
      order.receiptCode.toLowerCase().includes(search) ||
      (user && user.name.toLowerCase().includes(search)) ||
      (user && user.email.toLowerCase().includes(search))
    );
  });
  
  // View order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsDialog(true);
  };
  
  // Find order items
  const getOrderItems = (orderId: number) => {
    // In a real application, we would fetch this data from the API
    // For now, let's return a simulated list of items
    const orderItems: OrderItem[] = [];
    
    // Simulated data - in a real app this would come from the API
    if (selectedOrder) {
      for (let i = 0; i < 3; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        if (randomProduct) {
          orderItems.push({
            id: i + 1,
            orderId: selectedOrder.id,
            productId: randomProduct.id,
            price: randomProduct.price,
            product: randomProduct
          });
        }
      }
    }
    
    return orderItems;
  };
  
  // Find user by ID
  const getUserById = (userId: number) => {
    return users.find((user: User) => user.id === userId);
  };
  
  // Loading state
  const isLoading = ordersLoading || usersLoading || productsLoading;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestión de Órdenes</h2>
        <div className="w-72">
          <Input
            placeholder="Buscar órdenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Cargando órdenes...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="bg-gray-50 py-4">
            <CardTitle className="text-lg">Historial de Órdenes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Código de Recibo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: Order) => {
                  const user = getUserById(order.userId);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {user ? (
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Usuario no encontrado</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(new Date(order.orderDate))}</TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {order.receiptCode}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchTerm ? "No se encontraron órdenes con ese criterio" : "No hay órdenes registradas"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialog} onOpenChange={setOrderDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {selectedOrder && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{getUserById(selectedOrder.userId)?.name || "Usuario no encontrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Fecha de Compra</p>
                    <p className="font-medium">{formatDate(new Date(selectedOrder.orderDate))}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Código de Recibo</p>
                    <p className="font-medium font-mono">{selectedOrder.receiptCode}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatPrice(selectedOrder.total)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Productos Comprados</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-right">Precio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getOrderItems(selectedOrder.id).map((item: OrderItem) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {item.product && (
                                  <>
                                    <img 
                                      src={item.product.imageUrl} 
                                      alt={item.product.name}
                                      className="w-8 h-8 rounded-md object-cover"
                                    />
                                    <span>{item.product.name}</span>
                                  </>
                                )}
                                
                                {!item.product && (
                                  <span className="text-gray-400">Producto no encontrado</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.product?.category || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              {formatPrice(item.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}