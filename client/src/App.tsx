import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Scanner from "@/pages/scanner";
import ProductPage from "@/pages/product";
import Receipt from "@/pages/receipt";
import MyQRs from "@/pages/my-qrs";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin";
import { ShoppingProvider } from "@/contexts/ShoppingContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CartModal from "@/components/ui/cart-modal";
import AdminRoute from "@/components/layout/admin-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/register" component={Register} />
      <Route path="/home" component={Home} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/products/category/:category" component={Home} />
      <Route path="/receipt/:id" component={Receipt} />
      <Route path="/my-qrs" component={MyQRs} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ShoppingProvider>
          <Router />
          <CartModal />
          <Toaster />
        </ShoppingProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
