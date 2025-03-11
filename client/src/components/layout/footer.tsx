import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useShopping } from "@/contexts/ShoppingContext";
import { Separator } from "@/components/ui/separator";
import { GiGreekTemple } from "react-icons/gi";

export default function Footer() {
  const { toast } = useToast();
  const { adminLogin } = useShopping();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      setOpen(false);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión como administrador",
      });
      // Redirect to admin page
      window.location.href = "/admin";
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Credenciales incorrectas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="mt-auto py-4 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Desarrollado por Jaime Forero
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-70" title="Admin Login">
                  <GiGreekTemple className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Iniciar sesión como administrador</DialogTitle>
                  <DialogDescription>
                    Ingresa tus credenciales para acceder al panel de administración
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}