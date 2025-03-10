import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { User } from "@/contexts/ShoppingContext";

export default function AdminUsers() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetCoinsDialogOpen, setIsResetCoinsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCoinsAmount, setNewCoinsAmount] = useState<number>(0);

  // Consulta para obtener usuarios
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/users']
  });

  // Mutación para actualizar monedas de un usuario
  const updateCoinsMutation = useMutation({
    mutationFn: async ({ userId, coins }: { userId: number, coins: number }) => {
      const res = await apiRequest('PATCH', `/api/users/${userId}/coins`, { coins });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsResetCoinsDialogOpen(false);
      toast({
        title: "Monedas actualizadas",
        description: `Las monedas del usuario han sido actualizadas exitosamente.`,
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
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Manejar reset de monedas
  const handleResetCoins = (user: User) => {
    setSelectedUser(user);
    setNewCoinsAmount(user.coins);
    setIsResetCoinsDialogOpen(true);
  };

  // Manejar envío del formulario de reset de monedas
  const handleSubmitCoinsReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateCoinsMutation.mutate({
        userId: selectedUser.id,
        coins: newCoinsAmount
      });
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>Búsqueda</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nombre, email o teléfono"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
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
                  <th className="p-4 font-medium">Usuario</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Teléfono</th>
                  <th className="p-4 font-medium">Monedas</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user: User) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{user.name}</div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        {user.coins} monedas
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleResetCoins(user)}
                      >
                        Ajustar Monedas
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para resetear monedas */}
      <Dialog open={isResetCoinsDialogOpen} onOpenChange={setIsResetCoinsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajustar Monedas</DialogTitle>
            <DialogDescription>
              {selectedUser ? (
                <>
                  Usuario: <span className="font-medium">{selectedUser.name}</span>
                </>
              ) : 'Selecciona un usuario para ajustar sus monedas.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCoinsReset}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="coins" className="text-sm font-medium">
                  Cantidad de Monedas
                </label>
                <Input
                  id="coins"
                  type="number"
                  min="0"
                  value={newCoinsAmount}
                  onChange={(e) => setNewCoinsAmount(parseInt(e.target.value))}
                  placeholder="100"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetCoinsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateCoinsMutation.isPending}
              >
                {updateCoinsMutation.isPending ? "Actualizando..." : "Actualizar Monedas"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}