import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@/contexts/ShoppingContext";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [resetCoinsDialog, setResetCoinsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinsAmount, setCoinsAmount] = useState(1000); // Default coins amount
  
  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    refetchOnWindowFocus: false,
  });
  
  // Reset user coins
  const resetCoins = useMutation({
    mutationFn: ({ userId, newCoinsAmount }: { userId: number, newCoinsAmount: number }) => {
      return apiRequest(`/api/users/${userId}/coins`, {
        method: 'PATCH',
        body: JSON.stringify({ coins: newCoinsAmount }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setResetCoinsDialog(false);
      setSelectedUser(null);
      toast({
        title: "Éxito",
        description: "Monedas actualizadas correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las monedas",
        variant: "destructive",
      });
    }
  });
  
  // Filter users based on search term
  const filteredUsers = users.filter((user: User) => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.phone.toLowerCase().includes(search)
    );
  });
  
  // Handle reset coins
  const handleResetCoins = (user: User) => {
    setSelectedUser(user);
    setCoinsAmount(1000); // Default value
    setResetCoinsDialog(true);
  };
  
  const confirmResetCoins = () => {
    if (!selectedUser) return;
    
    resetCoins.mutate({
      userId: selectedUser.id,
      newCoinsAmount: coinsAmount
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
        <div className="w-72">
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="bg-gray-50 py-4">
            <CardTitle className="text-lg">Listado de Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Monedas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-4 h-4 bg-amber-400 rounded-full"></span>
                        <span>{user.coins}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetCoins(user)}
                      >
                        Actualizar Monedas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchTerm ? "No se encontraron usuarios con ese criterio" : "No hay usuarios registrados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Reset Coins Dialog */}
      <Dialog open={resetCoinsDialog} onOpenChange={setResetCoinsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Monedas</DialogTitle>
            <DialogDescription>
              Actualiza la cantidad de monedas para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva cantidad de monedas</label>
              <Input
                type="number"
                min="0"
                value={coinsAmount}
                onChange={(e) => setCoinsAmount(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <Alert>
              <AlertDescription>
                Esta acción sobrescribirá la cantidad actual de monedas ({selectedUser?.coins}) con el nuevo valor.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetCoinsDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmResetCoins} 
              disabled={resetCoins.isPending}
            >
              {resetCoins.isPending ? "Actualizando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}