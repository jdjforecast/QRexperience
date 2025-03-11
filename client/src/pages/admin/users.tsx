import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User } from "@/contexts/ShoppingContext";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCoinsAmount, setNewCoinsAmount] = useState<number>(0);
  const [isCoinsDialogOpen, setIsCoinsDialogOpen] = useState(false);

  // Consulta para obtener usuarios
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  // Mutación para actualizar monedas
  const updateCoinsMutation = useMutation({
    mutationFn: async ({ userId, newAmount }: { userId: number, newAmount: number }) => {
      const res = await apiRequest('PATCH', `/api/users/${userId}/coins`, { coins: newAmount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsCoinsDialogOpen(false);
      toast({
        title: "Monedas actualizadas",
        description: "Se han actualizado las monedas del usuario.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar las monedas.",
        variant: "destructive",
      });
    }
  });

  // Filtrar usuarios
  const filteredUsers = users.filter((user: User) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.company.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Abrir modal para ajustar monedas
  const handleAdjustCoins = (user: User) => {
    setSelectedUser(user);
    setNewCoinsAmount(user.coins);
    setIsCoinsDialogOpen(true);
  };

  // Manejar envío del formulario de monedas
  const handleCoinsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateCoinsMutation.mutate({ userId: selectedUser.id, newAmount: newCoinsAmount });
    }
  };

  // Restablecer monedas a 0
  const handleResetCoins = (user: User) => {
    if (window.confirm(`¿Estás seguro de querer restablecer las monedas de ${user.name} a 0?`)) {
      updateCoinsMutation.mutate({ userId: user.id, newAmount: 0 });
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-600">Error al cargar usuarios</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="search-user">Buscar:</Label>
            <Input 
              id="search-user"
              placeholder="Buscar por nombre, email, teléfono o empresa" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Teléfono</th>
                  <th className="p-4 font-medium">Empresa</th>
                  <th className="p-4 font-medium">Monedas</th>
                  <th className="p-4 font-medium">Admin</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">{user.company}</td>
                    <td className="p-4">
                      <Badge className="bg-primary">{user.coins} monedas</Badge>
                    </td>
                    <td className="p-4">
                      {user.isAdmin ? 
                        <Badge className="bg-green-600">Sí</Badge> : 
                        <Badge variant="outline">No</Badge>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAdjustCoins(user)}
                        >
                          Ajustar Monedas
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleResetCoins(user)}
                        >
                          Resetear
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para ajustar monedas */}
      <Dialog open={isCoinsDialogOpen} onOpenChange={setIsCoinsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajustar Monedas</DialogTitle>
            <DialogDescription>
              Modifique la cantidad de monedas para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCoinsSubmit}>
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="coins">Cantidad de Monedas</Label>
                <Input
                  id="coins"
                  type="number"
                  min="0"
                  step="1"
                  value={newCoinsAmount}
                  onChange={(e) => setNewCoinsAmount(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCoinsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateCoinsMutation.isPending}>
                {updateCoinsMutation.isPending ? "Actualizando..." : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}