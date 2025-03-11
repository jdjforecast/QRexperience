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
import { isValidEmail, isValidPhone } from "@/lib/utils";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  coins: number;
  isAdmin: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newCoinsAmount, setNewCoinsAmount] = useState<number>(0);
  const [newPassword, setNewPassword] = useState<string>("");
  const [isCoinsDialogOpen, setIsCoinsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newUser, setNewUser] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    coins: 100,
    isAdmin: false
  });

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
  
  // Mutación para crear usuarios
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsAddUserDialogOpen(false);
      resetUserForm();
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
  
  // Mutación para eliminar usuarios
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('DELETE', `/api/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para actualizar la contraseña
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number, password: string }) => {
      const res = await apiRequest('PATCH', `/api/users/${userId}/password`, { password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      toast({
        title: "Contraseña actualizada",
        description: "La contraseña ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña.",
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
  
  // Validar formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newUser.name.trim()) {
      errors.name = "El nombre es requerido";
    }
    
    if (!newUser.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!isValidEmail(newUser.email)) {
      errors.email = "El email no es válido";
    }
    
    if (!newUser.phone.trim()) {
      errors.phone = "El teléfono es requerido";
    } else if (!isValidPhone(newUser.phone)) {
      errors.phone = "El teléfono no es válido";
    }
    
    if (!newUser.company.trim()) {
      errors.company = "La empresa es requerida";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Resetear formulario de usuario
  const resetUserForm = () => {
    setNewUser({
      name: "",
      email: "",
      phone: "",
      company: "",
      coins: 100,
      isAdmin: false
    });
    setFormErrors({});
  };
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'coins' ? parseInt(value) || 0 : value
    }));
  };
  
  // Enviar formulario para crear usuario
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createUserMutation.mutate(newUser);
    }
  };
  
  // Eliminar usuario
  const handleDeleteUser = (user: User) => {
    // No permitir eliminar usuarios administradores para evitar bloquear acceso
    if (user.isAdmin) {
      toast({
        title: "Acción no permitida",
        description: "No es posible eliminar usuarios administradores.",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

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
  
  // Abrir modal para cambiar contraseña
  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsPasswordDialogOpen(true);
  };
  
  // Manejar envío del formulario de contraseña
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && newPassword.trim()) {
      updatePasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
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
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          Añadir Usuario
        </Button>
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
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAdjustCoins(user)}
                        >
                          Ajustar Monedas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleResetCoins(user)}
                        >
                          Resetear Monedas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleChangePassword(user)}
                        >
                          Cambiar Contraseña
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.isAdmin}
                        >
                          Eliminar
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
      
      {/* Modal para añadir usuario */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={(open) => {
        setIsAddUserDialogOpen(open);
        if (!open) resetUserForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete el formulario para crear un nuevo usuario.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUserSubmit}>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                  placeholder="123-456-7890"
                  required
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  name="company"
                  value={newUser.company}
                  onChange={handleInputChange}
                  placeholder="Nombre de la empresa"
                  required
                />
                {formErrors.company && (
                  <p className="text-sm text-red-500">{formErrors.company}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coins">Monedas Iniciales</Label>
                <Input
                  id="coins"
                  name="coins"
                  type="number"
                  min="0"
                  step="1"
                  value={newUser.coins}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isAdmin">Es Administrador</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetUserForm();
                  setIsAddUserDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}