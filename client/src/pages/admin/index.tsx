import { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminProducts from "./products";
import AdminUsers from "./users";
import AdminOrders from "./orders";
import AdminTools from "./tools";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("products");

  const handleBackToApp = () => {
    setLocation("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
          </div>
          <Button onClick={handleBackToApp} variant="outline" size="sm">
            Volver a la Aplicación
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle>Dashboard de Administración</CardTitle>
            <CardDescription>
              Gestione productos, usuarios, órdenes y configuraciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              defaultValue="products"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full border-b bg-gray-50 rounded-none p-0">
                <TabsTrigger 
                  value="products" 
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Productos
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Usuarios
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Órdenes
                </TabsTrigger>
                <TabsTrigger 
                  value="tools" 
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Herramientas
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="products">
                  <AdminProducts />
                </TabsContent>
                
                <TabsContent value="users">
                  <AdminUsers />
                </TabsContent>
                
                <TabsContent value="orders">
                  <AdminOrders />
                </TabsContent>
                
                <TabsContent value="tools">
                  <AdminTools />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Panel de Administración - Experiencia QR de Compra Virtual
        </div>
      </footer>
    </div>
  );
}