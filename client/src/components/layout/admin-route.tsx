import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useShopping();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Debes iniciar sesión para acceder a esta sección.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Check if user is admin
    if (!user.isAdmin) {
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para acceder al panel de administración.",
        variant: "destructive",
      });
      navigate("/home");
      return;
    }
  }, [user, navigate, toast]);

  // If user is not logged in or is not admin, don't render children
  if (!user || !user.isAdmin) {
    return null;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
}