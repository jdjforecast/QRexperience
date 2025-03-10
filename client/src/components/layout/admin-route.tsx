import { ReactNode, useEffect } from "react";
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

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: t("admin.access.denied"),
        description: t("admin.access.denied.desc"),
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Check if user is admin
    if (!user.isAdmin) {
      toast({
        title: t("admin.access.restricted"),
        description: t("admin.access.restricted.desc"),
        variant: "destructive",
      });
      navigate("/home");
      return;
    }
  }, [user, navigate, toast, t]);

  // If user is not logged in or is not admin, don't render children
  if (!user || !user.isAdmin) {
    return null;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
}