import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

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
  company: string;
  coins: number;
  isAdmin: boolean;
  password?: string; // Agregamos campo de contraseña
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  qrCode: string;
  stock: number;
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
  saleImageUrl: string; // Nueva imagen para el banner "SALE"
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
  registerUser: (userData: { name: string; email: string; phone: string; company: string }) => Promise<void>;
  adminLogin: (email?: string, password?: string) => Promise<void>;
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
  // Cargar usuario desde localStorage si existe
  const savedUserJSON = localStorage.getItem('currentUser');
  const savedUser = savedUserJSON ? JSON.parse(savedUserJSON) : null;
  
  // Cargar carrito desde localStorage si existe
  const savedCartJSON = localStorage.getItem('cart');
  const savedCart = savedCartJSON ? JSON.parse(savedCartJSON) : [];
  
  const [user, setUser] = useState<User | null>(savedUser);
  const [cart, setCart] = useState<CartItem[]>(savedCart);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [coinAnimation, setCoinAnimation] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

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
    mutationFn: async (userData: { name: string; email: string; phone: string; company: string }) => {
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
      
      // Update local user state with new coin balance
      if (user) {
        setUser({
          ...user,
          coins: user.coins - getCartTotal()
        });
        
        // Confirmar la actualización de stock mediante API para cada producto en el carrito
        // Esto garantiza que los stocks se actualicen correctamente después de completada la compra
        Promise.all(
          cart.map(product => {
            // Aseguramos que el stock nunca sea negativo
            const finalStock = Math.max(0, product.stock - 1);
            return updateProductStockMutation.mutateAsync({
              productId: product.id,
              newStock: finalStock
            });
          })
        ).then(() => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        });
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      // Asegurarse de que se invalidan todas las consultas relacionadas con órdenes
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Invalida específicamente las órdenes del usuario actual
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/users/${user.id}/orders`] 
        });
      }
      
      // Limpiar carrito después de completar la orden
      clearCart();
      
      toast({
        title: "¡Compra exitosa!",
        description: `Tu pedido ha sido procesado. Recibirás tus productos con el código ${data.receiptCode}.`,
      });
      
      // Redirigir a la página de QRs después de una pequeña espera
      // Usamos setLocation en lugar de window.location para mantener el estado
      setTimeout(() => {
        // Guardamos el usuario actual en localStorage antes de la redirección
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Usamos el router para navegar sin perder el estado
        setLocation("/my-qrs");
      }, 1500);
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
  const registerUser = async (userData: { name: string; email: string; phone: string; company: string }) => {
    await registerMutation.mutateAsync(userData);
  };

  // Admin login function
  const adminLogin = async (email?: string, password?: string) => {
    try {
      let adminData;
      
      if (email && password) {
        // Autenticar con email y contraseña
        const res = await apiRequest('POST', '/api/auth/login', { email, password });
        if (!res.ok) {
          throw new Error("Credenciales incorrectas");
        }
        adminData = await res.json();
      } else {
        // Modo de desarrollo: obtener admin directamente
        const res = await fetch(`/api/users/admin`);
        if (!res.ok) {
          throw new Error("No se pudo autenticar como administrador");
        }
        adminData = await res.json();
      }

      // Verificar si el usuario es realmente administrador
      if (!adminData.isAdmin) {
        throw new Error("El usuario no tiene permisos de administrador");
      }
      
      // Guardar el usuario en el estado y en localStorage
      setUser(adminData);
      localStorage.setItem('currentUser', JSON.stringify(adminData));
      
      // Log successful login
      console.log("Admin login successful", adminData);
      
      toast({
        title: t("admin.login.success"),
        description: t("admin.login.success.desc"),
      });
      
      return adminData; // Devolvemos los datos para que la página de login pueda redirigir
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
    
    // Eliminar el usuario de localStorage
    localStorage.removeItem('currentUser');
  };

  // Effect para guardar el carrito en localStorage siempre que cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  // Update product stock mutation
  const updateProductStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }: { productId: number, newStock: number }) => {
      const res = await apiRequest('PATCH', `/api/products/${productId}/stock`, { stock: newStock });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar stock",
        description: error.message || "Ocurrió un error al actualizar el stock del producto.",
        variant: "destructive",
      });
    }
  });
  
  // Add product to cart
  const addToCart = (product: Product) => {
    // Check if product can be added
    if (!canAddToCart(product)) return;
    
    // Check if product has stock
    if (product.stock <= 0) {
      toast({
        title: "Producto sin stock",
        description: `${product.name} no tiene unidades disponibles.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add to cart
    setCart([...cart, product]);
    
    // Update stock in the backend
    const newStock = product.stock - 1;
    updateProductStockMutation.mutate({ 
      productId: product.id, 
      newStock 
    });
    
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
    
    // Restaurar el stock del producto
    const currentProduct = products.find(p => p.id === productId);
    if (currentProduct) {
      const newStock = currentProduct.stock + 1;
      updateProductStockMutation.mutate({ 
        productId, 
        newStock 
      });
    }
    
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
    // Obtener información del dispositivo y ubicación para el registro
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      return {
        type: isMobile ? 'mobile' : 'desktop',
        userAgent: userAgent
      };
    };
    
    // Función para obtener la geolocalización si está disponible
    const getLocation = (): Promise<{latitude: number, longitude: number} | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            resolve(null);
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      });
    };
    
    try {
      console.log("Escaneando QR código:", qrCode);
      
      // Limpia el código QR de posibles espacios o caracteres no deseados
      const cleanQrCode = qrCode.trim();
      
      if (!cleanQrCode) {
        console.error("Código QR vacío detectado");
        throw new Error("Código QR inválido");
      }
      
      // Registro para depuración
      console.log("Buscando producto con código QR:", cleanQrCode);
      
      // Obtener la geolocalización si está disponible
      const geoLocation = await getLocation();
      
      // Obtener información del dispositivo
      const deviceInfo = getDeviceInfo();
      
      // Consultar el producto
      const res = await fetch(`/api/products/qr/${encodeURIComponent(cleanQrCode)}`);
      console.log("Respuesta del servidor:", res.status, res.statusText);
      
      // Determinar si el escaneo fue exitoso
      const isSuccessful = res.ok;
      
      // Crear el objeto de registro
      const scanLog = {
        qrCode: cleanQrCode,
        userId: user?.id || null,
        productId: null, // Se actualizará si se encuentra el producto
        scanDate: new Date(),
        latitude: geoLocation?.latitude || null,
        longitude: geoLocation?.longitude || null,
        deviceInfo: JSON.stringify(deviceInfo),
        successful: isSuccessful,
        scanContext: "user_scanner_page"
      };
      
      // Si la consulta falla, registrar un escaneo fallido
      if (!isSuccessful) {
        // Registrar el escaneo fallido
        try {
          await fetch('/api/qr-scans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(scanLog),
          });
        } catch (logError) {
          console.error("Error al registrar escaneo fallido:", logError);
        }
        
        if (res.status === 404) {
          throw new Error("Producto no encontrado");
        } else {
          throw new Error(`Error del servidor: ${res.status}`);
        }
      }
      
      // Si la consulta es exitosa, obtener el producto
      const product = await res.json();
      console.log("Producto encontrado:", product);
      
      // Actualizar el ID del producto en el registro
      scanLog.productId = product.id;
      
      // Registrar el escaneo exitoso
      try {
        await fetch('/api/qr-scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scanLog),
        });
      } catch (logError) {
        console.error("Error al registrar escaneo exitoso:", logError);
      }
      
      return product;
    } catch (error: any) {
      console.error("Error al escanear QR:", error);
      toast({
        title: "Error al escanear",
        description: error.message || "No se pudo encontrar el producto con este código QR.",
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
    
    // Check if product has stock available
    if (product.stock <= 0) return false;
    
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
