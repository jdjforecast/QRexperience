import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

// Categorías disponibles en la aplicación
export const categories = [
  "Lácteos",
  "Electrónicos",
  "Bebidas",
  "Frutas",
  "Panadería",
  "Limpieza"
];

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  coins: number;
  isAdmin: boolean;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  qrCode: string;
};

export type CartItem = Product;

export type Order = {
  id: number;
  userId: number;
  orderDate: Date;
  total: number;
  receiptCode: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  price: number;
  product?: Product;
};

export type BrandSettings = {
  id: number;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  storeName: string;
  storeDescription: string;
  welcomeImageUrl: string;
  language: string;
  fontFamily: string;
  borderRadius: string;
  enableAnimations: boolean;
};

type ShoppingContextType = {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  lastOrder: Order | null;
  registerUser: (userData: { name: string; email: string; phone: string }) => Promise<void>;
  adminLogin: () => Promise<void>;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  checkout: () => Promise<void>;
  scanQRCode: (qrCode: string) => Promise<Product | null>;
  getProductsByCategory: (category: string) => Product[];
  getExistingProductByCategory: (category: string | undefined) => CartItem | undefined;
  canAddToCart: (product: Product | null) => boolean;
  getCartTotal: () => number;
  clearCart: () => void;
  coinAnimation: boolean;
};

const ShoppingContext = createContext<ShoppingContextType | null>(null);

export const ShoppingProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [coinAnimation, setCoinAnimation] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load products
  const productsQuery = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Manage products error state
  useEffect(() => {
    if (productsQuery.error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    }
  }, [productsQuery.error, toast]);
  
  // Get strongly typed products or empty array
  const products = productsQuery.data || [];

  // Register user mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; phone: string }) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: "¡Bienvenido!",
        description: `Te has registrado exitosamente y has recibido ${data.coins} monedas.`,
      });
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un error al registrarse. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        userId: user?.id,
        total: getCartTotal(),
        products: cart
      };
      const res = await apiRequest('POST', '/api/orders', payload);
      return res.json();
    },
    onSuccess: (data) => {
      setLastOrder(data);
      clearCart();
      
      // Update local user state with new coin balance
      if (user) {
        setUser({
          ...user,
          coins: user.coins - getCartTotal()
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "¡Compra exitosa!",
        description: `Tu pedido ha sido procesado. Recibirás tus productos con el código ${data.receiptCode}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al procesar la orden",
        description: error.message || "Ocurrió un error al procesar la orden. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  // Register user function
  const registerUser = async (userData: { name: string; email: string; phone: string }) => {
    await registerMutation.mutateAsync(userData);
  };

  // Admin login function
  const adminLogin = async () => {
    try {
      // Fetch admin user by email
      const res = await fetch(`/api/users/admin`);
      if (!res.ok) {
        throw new Error("No se pudo autenticar como administrador");
      }
      const adminData = await res.json();
      setUser(adminData);
      
      // Log successful login
      console.log("Admin login successful", adminData);
      
      toast({
        title: t("admin.login.success"),
        description: t("admin.login.success.desc"),
      });
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: t("admin.login.error"),
        description: t("admin.login.error.desc"),
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    clearCart();
    setLastOrder(null);
  };

  // Add product to cart
  const addToCart = (product: Product) => {
    // Check if product can be added
    if (!canAddToCart(product)) return;
    
    // Add to cart
    setCart([...cart, product]);
    
    // Trigger coin animation
    if (user) {
      setCoinAnimation(true);
      setTimeout(() => setCoinAnimation(false), 500);
    }
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se ha agregado a tu carrito.`,
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    const productToRemove = cart.find(p => p.id === productId);
    if (!productToRemove) return;
    
    setCart(cart.filter(p => p.id !== productId));
    
    // Trigger coin animation
    if (user) {
      setCoinAnimation(true);
      setTimeout(() => setCoinAnimation(false), 500);
    }
    
    toast({
      title: "Producto eliminado",
      description: `${productToRemove.name} se ha eliminado de tu carrito.`,
    });
  };

  // Process checkout
  const checkout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar una compra.",
        variant: "destructive",
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Tu carrito está vacío. Agrega productos antes de finalizar la compra.",
        variant: "destructive",
      });
      return;
    }
    
    if (getCartTotal() > user.coins) {
      toast({
        title: "Fondos insuficientes",
        description: "No tienes suficientes monedas para completar esta compra.",
        variant: "destructive",
      });
      return;
    }
    
    await orderMutation.mutateAsync();
  };

  // Scan QR code
  const scanQRCode = async (qrCode: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/qr/${qrCode}`);
      if (!res.ok) {
        throw new Error("Producto no encontrado");
      }
      return await res.json();
    } catch (error) {
      toast({
        title: "Error al escanear",
        description: "No se pudo encontrar el producto con este código QR.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get products by category
  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(p => p.category === category);
  };

  // Check if a product from the same category is already in the cart
  const getExistingProductByCategory = (category: string | undefined): CartItem | undefined => {
    if (!category) return undefined;
    return cart.find(p => p.category === category);
  };

  // Check if a product can be added to the cart
  const canAddToCart = (product: Product | null): boolean => {
    if (!product || !user) return false;
    
    // Check if user has enough coins
    if (user.coins < product.price) return false;
    
    // Check if there's already a product in the same category
    return !getExistingProductByCategory(product.category);
  };

  // Calculate cart total
  const getCartTotal = (): number => {
    return cart.reduce((total, product) => total + product.price, 0);
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <ShoppingContext.Provider
      value={{
        user,
        products,
        cart,
        showCart,
        setShowCart,
        selectedProduct,
        setSelectedProduct,
        lastOrder,
        registerUser,
        adminLogin,
        logout,
        addToCart,
        removeFromCart,
        checkout,
        scanQRCode,
        getProductsByCategory,
        getExistingProductByCategory,
        canAddToCart,
        getCartTotal,
        clearCart,
        coinAnimation
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error("useShopping must be used within a ShoppingProvider");
  }
  return context;
};
