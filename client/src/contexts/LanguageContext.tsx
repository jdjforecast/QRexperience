import { createContext, useState, useContext, ReactNode } from "react";

// Define the supported languages
type Language = "en" | "es";

// Define the translations type
type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

// Define our translations
const translations: Translations = {
  // Welcome page
  "welcome.title": {
    en: "Virtual Shopping Experience",
    es: "Experiencia de Compra Virtual"
  },
  "welcome.subtitle": {
    en: "Scan QR codes for a seamless shopping experience.",
    es: "Escanea códigos QR para una experiencia de compra sin problemas."
  },
  "welcome.start": {
    en: "Start Shopping",
    es: "Comenzar a Comprar"
  },
  "welcome.login": {
    en: "Already have an account? Sign in",
    es: "¿Ya tienes una cuenta? Inicia sesión"
  },

  // Register page
  "register.title": {
    en: "Create Account",
    es: "Crear Cuenta"
  },
  "register.subtitle": {
    en: "Register to start your virtual shopping experience.",
    es: "Regístrate para comenzar tu experiencia de compra virtual."
  },
  "register.name": {
    en: "Full Name",
    es: "Nombre Completo"
  },
  "register.email": {
    en: "Email",
    es: "Correo Electrónico"
  },
  "register.phone": {
    en: "Phone",
    es: "Teléfono"
  },
  "register.register": {
    en: "Register",
    es: "Registrarse"
  },
  "register.error.name": {
    en: "Name is required",
    es: "El nombre es requerido"
  },
  "register.error.email": {
    en: "Valid email is required",
    es: "Se requiere un correo electrónico válido"
  },
  "register.error.phone": {
    en: "Valid phone is required",
    es: "Se requiere un teléfono válido"
  },

  // Home page
  "home.title": {
    en: "Welcome,",
    es: "Bienvenido,"
  },
  "home.scanner": {
    en: "Scan QR Code",
    es: "Escanear Código QR"
  },
  "home.categories": {
    en: "Categories",
    es: "Categorías"
  },
  "home.products": {
    en: "Products",
    es: "Productos"
  },

  // Scanner page
  "scanner.title": {
    en: "Scan QR Code",
    es: "Escanear Código QR"
  },
  "scanner.instruction": {
    en: "Position the QR code within the frame to scan.",
    es: "Posiciona el código QR dentro del marco para escanear."
  },
  "scanner.close": {
    en: "Close",
    es: "Cerrar"
  },

  // Product page
  "product.add": {
    en: "Add to Cart",
    es: "Agregar al Carrito"
  },
  "product.back": {
    en: "Back",
    es: "Volver"
  },
  "product.category.warning": {
    en: "You already have a product in this category",
    es: "Ya tienes un producto de esta categoría"
  },
  "product.category.warning.desc": {
    en: "You can only select one product per category. You must remove",
    es: "Solo puedes seleccionar un producto por categoría. Debes eliminar"
  },
  "product.category.warning.from": {
    en: "from your cart to add this product.",
    es: "del carrito para agregar este producto."
  },

  // Cart modal
  "cart.title": {
    en: "My Cart",
    es: "Mi Carrito"
  },
  "cart.empty": {
    en: "Your cart is empty",
    es: "Tu carrito está vacío"
  },
  "cart.total": {
    en: "Total:",
    es: "Total:"
  },
  "cart.checkout": {
    en: "Checkout",
    es: "Finalizar Compra"
  },

  // Receipt page
  "receipt.success": {
    en: "Purchase Successful!",
    es: "¡Compra Exitosa!"
  },
  "receipt.receipt": {
    en: "Receipt #",
    es: "Recibo #"
  },
  "receipt.name": {
    en: "Name:",
    es: "Nombre:"
  },
  "receipt.date": {
    en: "Date:",
    es: "Fecha:"
  },
  "receipt.total": {
    en: "Total:",
    es: "Total:"
  },
  "receipt.products": {
    en: "Products:",
    es: "Productos:"
  },
  "receipt.qr": {
    en: "Pickup QR Code",
    es: "Código QR de Recogida"
  },
  "receipt.qr.desc": {
    en: "Present this code at the pickup point",
    es: "Presenta este código en el punto de recogida"
  },
  "receipt.download": {
    en: "Download",
    es: "Descargar"
  },
  "receipt.home": {
    en: "Go to Home",
    es: "Ir al Inicio"
  },

  // Common
  "common.product": {
    en: "Product",
    es: "Producto"
  },
  "common.category": {
    en: "Category",
    es: "Categoría"
  },
  "common.email": {
    en: "Email",
    es: "Correo Electrónico"
  },
  "common.password": {
    en: "Password",
    es: "Contraseña"
  },
  "common.login": {
    en: "Login",
    es: "Iniciar Sesión"
  },

  // Admin Login
  "admin.login": {
    en: "Admin Access",
    es: "Acceso de Administrador"
  },
  "admin.login.desc": {
    en: "Enter your credentials to access the admin panel",
    es: "Ingresa tus credenciales para acceder al panel de administración"
  },
  "admin.login.success": {
    en: "Login Successful",
    es: "Inicio de Sesión Exitoso"
  },
  "admin.login.success.desc": {
    en: "You have successfully logged in as administrator",
    es: "Has iniciado sesión exitosamente como administrador"
  },
  "admin.login.failed": {
    en: "Login Failed",
    es: "Inicio de Sesión Fallido"
  },
  "admin.login.failed.desc": {
    en: "Invalid email or password. Please try again",
    es: "Correo electrónico o contraseña inválidos. Por favor, intenta de nuevo"
  },
  "admin.login.error": {
    en: "Authentication Error",
    es: "Error de Autenticación"
  },
  "admin.login.error.desc": {
    en: "There was an error logging in. Please try again",
    es: "Hubo un error al iniciar sesión. Por favor, intenta de nuevo"
  },
  
  // Category names
  "category.electronics": {
    en: "Electronics",
    es: "Electrónicos"
  },
  "category.clothing": {
    en: "Clothing",
    es: "Ropa"
  },
  "category.groceries": {
    en: "Groceries",
    es: "Comestibles"
  },
  "category.housewares": {
    en: "Housewares",
    es: "Artículos para el Hogar"
  },
  "category.toys": {
    en: "Toys",
    es: "Juguetes"
  },
  "category.beauty": {
    en: "Beauty",
    es: "Belleza"
  }
};

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es"); // Default to Spanish

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}