import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useShopping();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // La primera vez que se ejecuta, comprobamos de forma asíncrona para permitir
    // que localStorage se cargue correctamente
    const checkAdminStatus = () => {
      // Check if user is logged in
      if (!user) {
        console.log("Usuario no autenticado, redirigiendo a login");
        toast({
          title: t("admin.access.denied"),
          description: t("admin.access.denied.desc"),
          variant: "destructive",
        });
        navigate("/admin-login");
        return false;
      }

      // Check if user is admin
      if (!user.isAdmin) {
        console.log("Usuario no es administrador, redirigiendo a home");
        toast({
          title: t("admin.access.restricted"),
          description: t("admin.access.restricted.desc"),
          variant: "destructive",
        });
        navigate("/home");
        return false;
      }

      return true;
    };

    // Ejecutamos la comprobación después de un pequeño retraso
    // para asegurar que localStorage se ha cargado correctamente
    const timer = setTimeout(() => {
      const isAdmin = checkAdminStatus();
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate, toast, t]);

  // Durante la comprobación, mostramos un indicador de carga
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  // Si el usuario no está logueado o no es admin, no renderizamos nada
  // (la redirección se maneja en el useEffect)
  if (!user || !user.isAdmin) {
    return null;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
}