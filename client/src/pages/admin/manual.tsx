import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowDown, BookOpen, Coffee, ShoppingCart, Users, QrCode, Settings, BarChart, Download, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function UserManual() {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Manual de Usuario</h1>
        <p className="text-muted-foreground text-sm md:text-base">Guía completa de todas las funcionalidades del sistema</p>
      </div>

      <Tabs defaultValue="usuario" className="w-full">
        <TabsList className="mb-4 w-full flex flex-wrap">
          <TabsTrigger value="usuario" className="flex-1 min-w-[140px] text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="truncate">Guía de Usuario</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex-1 min-w-[140px] text-xs md:text-sm">
            <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="truncate">Guía de Administrador</span>
          </TabsTrigger>
          <TabsTrigger value="tecnico" className="flex-1 min-w-[140px] text-xs md:text-sm">
            <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="truncate">Documentación Técnica</span>
          </TabsTrigger>
        </TabsList>

        {/* GUÍA DE USUARIO NORMAL */}
        <TabsContent value="usuario" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Introducción para Usuarios</CardTitle>
              <CardDescription className="text-sm">
                Bienvenido al sistema de compra virtual mediante códigos QR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 text-sm md:text-base">
              <p className="break-words">
                Este sistema te permite escanear códigos QR para ver productos, comprarlos con tus monedas virtuales 
                y generar un recibo digital para reclamar tus productos físicamente. A continuación encontrarás 
                todas las funciones disponibles para los usuarios.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="registro">
                  <AccordionTrigger className="font-medium text-sm md:text-base py-3">
                    Registro de Usuario
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs md:text-sm">
                    <p>Para comenzar a usar el sistema, debes registrarte con tus datos personales:</p>
                    <ol className="list-decimal ml-4 md:ml-6 space-y-1">
                      <li>Accede a la opción "Registrarse" desde la pantalla de bienvenida</li>
                      <li>Completa el formulario con tu nombre, correo electrónico, teléfono y empresa</li>
                      <li>Al registrarte, recibirás automáticamente 100 monedas para realizar compras</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="scanner">
                  <AccordionTrigger className="font-medium text-sm md:text-base py-3">
                    Escaneo de Códigos QR
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-xs md:text-sm">
                    <p>El sistema te permite escanear códigos QR de productos para ver su información y comprarlos:</p>
                    <ol className="list-decimal ml-4 md:ml-6 space-y-1">
                      <li>Desde la pantalla principal, pulsa el botón "Escanear Código QR"</li>
                      <li>Apunta la cámara de tu dispositivo hacia el código QR del producto</li>
                      <li>Al detectar el código, verás la información detallada del producto</li>
                      <li>Si deseas comprarlo, pulsa "Agregar al Carrito"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="compras">
                  <AccordionTrigger className="font-medium">
                    Realizando Compras
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Para comprar productos con tus monedas virtuales:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Después de escanear un producto, agrégalo al carrito</li>
                      <li>Puedes ver los productos en tu carrito pulsando el icono del carrito</li>
                      <li>Cuando estés listo, pulsa "Finalizar Compra" en el carrito</li>
                      <li>El sistema deducirá automáticamente las monedas de tu cuenta</li>
                      <li>Se generará un código QR de recibo que puedes usar para reclamar los productos físicamente</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mis-qrs">
                  <AccordionTrigger className="font-medium">
                    Mis Códigos QR
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema guarda todos tus recibos de compra para que puedas acceder a ellos en cualquier momento:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la sección "Mis QRs" desde el menú principal</li>
                      <li>Verás un historial de todas tus compras realizadas</li>
                      <li>Pulsa en cualquier compra para ver el código QR del recibo</li>
                      <li>Puedes mostrar este QR para reclamar tus productos físicamente</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="categorias">
                  <AccordionTrigger className="font-medium">
                    Navegación por Categorías
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Puedes explorar productos por categorías sin necesidad de escanear códigos QR:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>En la pantalla principal, desplázate hacia abajo para ver las categorías disponibles</li>
                      <li>Pulsa en una categoría para ver todos los productos relacionados</li>
                      <li>Explora los productos y agrégalos al carrito desde esta vista</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GUÍA DE ADMINISTRADOR */}
        <TabsContent value="admin" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Funciones de Administración</CardTitle>
              <CardDescription className="text-sm">
                Guía completa de las herramientas disponibles para los administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 text-sm md:text-base">
              <p className="break-words">
                Como administrador, tienes acceso a herramientas avanzadas para gestionar usuarios, productos, 
                estadísticas del sistema y configuración de la tienda. A continuación se describen todas las 
                funciones disponibles.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="acceso">
                  <AccordionTrigger className="font-medium">
                    Acceso al Panel de Administración
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Para acceder al panel de administración:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Haz clic en el enlace "Admin" en el pie de página de la aplicación</li>
                      <li>Ingresa tus credenciales de administrador (correo y contraseña)</li>
                      <li>Una vez autenticado, accederás al panel de control de administración</li>
                      <li>Para salir, puedes hacer clic en el botón λ (lambda) ubicado en la barra lateral</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="usuarios">
                  <AccordionTrigger className="font-medium">
                    Gestión de Usuarios
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Como administrador, puedes gestionar todos los usuarios del sistema:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la pestaña "Usuarios" en el panel de administración</li>
                      <li>Crea nuevos usuarios con el botón "Crear Nuevo Usuario"</li>
                      <li>Puedes otorgar permisos de administrador marcando la casilla correspondiente</li>
                      <li>Modifica la cantidad de monedas de cualquier usuario con "Ajustar Monedas"</li>
                      <li>Restablece las monedas a 100 con "Restablecer Monedas"</li>
                      <li>Cambia la contraseña de usuarios con "Cambiar Contraseña"</li>
                      <li>Elimina usuarios utilizando el botón "Eliminar Usuario"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="productos">
                  <AccordionTrigger className="font-medium">
                    Gestión de Productos
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Administra el catálogo de productos disponibles:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la pestaña "Productos" en el panel de administración</li>
                      <li>Crea nuevos productos con el botón "Crear Nuevo Producto"</li>
                      <li>Completa todos los campos: nombre, categoría, precio, descripción, URL de imagen y stock</li>
                      <li>El código QR se genera automáticamente, pero puedes personalizarlo</li>
                      <li>Edita productos existentes con el botón "Editar"</li>
                      <li>Visualiza el código QR de un producto con "Ver QR"</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ordenes">
                  <AccordionTrigger className="font-medium">
                    Gestión de Órdenes
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>Visualiza y administra todas las órdenes realizadas en el sistema:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la pestaña "Órdenes" en el panel de administración</li>
                      <li>Filtra las órdenes por fecha o por usuario utilizando los filtros disponibles</li>
                      <li>Haz clic en "Ver Detalles" para visualizar la información completa de una orden</li>
                      <li>Verifica los productos comprados, el total pagado y el código QR del recibo</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="herramientas">
                  <AccordionTrigger className="font-medium">
                    Herramientas Administrativas
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema ofrece herramientas adicionales para la administración:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la pestaña "Herramientas" en el panel de administración</li>
                      <li><strong>Configuración de Marca:</strong> Personaliza el logo, colores, nombre y descripción de la tienda</li>
                      <li><strong>Lector de QR:</strong> Escanea códigos QR para verificar productos o recibos de compra</li>
                      <li><strong>Exportación de Datos:</strong> Exporta usuarios, productos y órdenes en formato CSV</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="google-sheets">
                  <AccordionTrigger className="font-medium">
                    Integración con Google Sheets
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema permite sincronizar datos con Google Sheets:</p>
                    <ol className="list-decimal ml-6 space-y-1">
                      <li>Accede a la pestaña "Google Sheets" en el panel de administración</li>
                      <li>Configura la conexión con Google Sheets proporcionando la URL de la hoja de cálculo</li>
                      <li>Pulsa "Sincronizar Ahora" para enviar los datos del sistema a Google Sheets</li>
                      <li>También puedes configurar Google Drive para almacenamiento adicional</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOCUMENTACIÓN TÉCNICA */}
        <TabsContent value="tecnico" className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Documentación Técnica</CardTitle>
              <CardDescription className="text-sm">
                Información técnica sobre la estructura y funcionamiento del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 text-sm md:text-base">
              <p className="break-words">
                Esta sección proporciona información técnica sobre la arquitectura del sistema, modelos de datos 
                y funcionalidades implementadas. Esta documentación es útil para desarrolladores y personal técnico.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="arquitectura">
                  <AccordionTrigger className="font-medium">
                    Arquitectura del Sistema
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema está construido con una arquitectura cliente-servidor moderna:</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li><strong>Frontend:</strong> React.js con TypeScript</li>
                      <li><strong>Backend:</strong> Node.js con Express</li>
                      <li><strong>Almacenamiento:</strong> Base de datos en memoria con persistencia opcional a través de Google Sheets</li>
                      <li><strong>UI Components:</strong> Shadcn/UI + Tailwind CSS</li>
                      <li><strong>Estado:</strong> React Context API + TanStack Query para gestión de estado y caché</li>
                    </ul>
                    <p className="mt-2">La aplicación sigue un enfoque modular con separación clara entre:</p>
                    <ul className="list-disc ml-6 space-y-1">
                      <li>Componentes de interfaz de usuario</li>
                      <li>Lógica de negocio</li>
                      <li>Servicios de datos</li>
                      <li>Utilidades de apoyo</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="modelos">
                  <AccordionTrigger className="font-medium">
                    Modelos de Datos
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema utiliza los siguientes modelos de datos principales:</p>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Usuario (User)</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>id: number (identificador único)</li>
                        <li>name: string (nombre completo)</li>
                        <li>email: string (correo electrónico - único)</li>
                        <li>phone: string (teléfono)</li>
                        <li>company: string (empresa)</li>
                        <li>password: string | null (contraseña - opcional para usuarios normales)</li>
                        <li>coins: number (monedas disponibles)</li>
                        <li>isAdmin: boolean (indica si el usuario tiene permisos de administrador)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Producto (Product)</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>id: number (identificador único)</li>
                        <li>name: string (nombre del producto)</li>
                        <li>category: string (categoría del producto)</li>
                        <li>price: number (precio en monedas)</li>
                        <li>description: string (descripción detallada)</li>
                        <li>imageUrl: string (URL de la imagen)</li>
                        <li>qrCode: string (código QR único)</li>
                        <li>stock: number (cantidad disponible)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Orden (Order)</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>id: number (identificador único)</li>
                        <li>userId: number (ID del usuario que realizó la compra)</li>
                        <li>orderDate: Date (fecha y hora de la compra)</li>
                        <li>total: number (total pagado en monedas)</li>
                        <li>receiptCode: string (código único para el recibo QR)</li>
                        <li>items: OrderItem[] (array de elementos comprados)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Item de Orden (OrderItem)</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>id: number (identificador único)</li>
                        <li>orderId: number (ID de la orden a la que pertenece)</li>
                        <li>productId: number (ID del producto)</li>
                        <li>price: number (precio en el momento de la compra)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Configuración de Marca (BrandSettings)</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>id: number (identificador único)</li>
                        <li>logoUrl: string (URL del logo)</li>
                        <li>primaryColor: string (color primario en hex)</li>
                        <li>secondaryColor: string (color secundario en hex)</li>
                        <li>storeName: string (nombre de la tienda)</li>
                        <li>storeDescription: string (descripción de la tienda)</li>
                        <li>welcomeImageUrl: string (imagen de bienvenida)</li>
                        <li>language: string (idioma predeterminado)</li>
                        <li>fontFamily: string (fuente principal)</li>
                        <li>borderRadius: string (radio de bordes)</li>
                        <li>enableAnimations: boolean (activar/desactivar animaciones)</li>
                        <li>saleImageUrl: string (imagen para promociones)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="funcionalidades">
                  <AccordionTrigger className="font-medium">
                    Funcionalidades Implementadas
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema incluye las siguientes funcionalidades principales:</p>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Autenticación y Usuarios</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Registro de usuarios</li>
                        <li>Inicio de sesión para administradores</li>
                        <li>Gestión de perfiles de usuario</li>
                        <li>Sistema de monedas virtuales</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Gestión de Productos</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>CRUD completo de productos</li>
                        <li>Categorización de productos</li>
                        <li>Generación automática de códigos QR</li>
                        <li>Control de inventario</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Compras y Carrito</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Carrito de compras</li>
                        <li>Proceso de pago con monedas virtuales</li>
                        <li>Generación de recibos con códigos QR</li>
                        <li>Historial de compras</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Funcionalidades QR</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Escaneo de códigos QR de productos</li>
                        <li>Generación de códigos QR para productos</li>
                        <li>Códigos QR de recibos para reclamar productos</li>
                        <li>Verificación de QR en panel de administración</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Panel de Administración</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Gestión de usuarios</li>
                        <li>Gestión de productos</li>
                        <li>Visualización y gestión de órdenes</li>
                        <li>Herramientas administrativas</li>
                        <li>Personalización de marca</li>
                        <li>Exportación de datos</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Integración Externa</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>Sincronización con Google Sheets</li>
                        <li>Exportación de datos a CSV</li>
                        <li>Soporte para múltiples idiomas</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="api">
                  <AccordionTrigger className="font-medium">
                    API Reference
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>El sistema expone los siguientes endpoints principales:</p>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Usuarios</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>POST /api/users</code> - Crear un nuevo usuario</li>
                        <li><code>GET /api/users/:id</code> - Obtener información de un usuario</li>
                        <li><code>PATCH /api/users/:id/coins</code> - Actualizar monedas de un usuario</li>
                        <li><code>PATCH /api/users/:id/password</code> - Cambiar contraseña de usuario</li>
                        <li><code>DELETE /api/users/:id</code> - Eliminar un usuario</li>
                        <li><code>GET /api/admin/users</code> - Obtener todos los usuarios (admin)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Productos</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>GET /api/products</code> - Obtener todos los productos</li>
                        <li><code>GET /api/products/:id</code> - Obtener un producto específico</li>
                        <li><code>GET /api/products/qr/:qrCode</code> - Buscar producto por código QR</li>
                        <li><code>GET /api/products/category/:category</code> - Productos por categoría</li>
                        <li><code>POST /api/products</code> - Crear un nuevo producto (admin)</li>
                        <li><code>PATCH /api/products/:id</code> - Actualizar un producto</li>
                        <li><code>PATCH /api/products/:id/stock</code> - Actualizar stock de producto</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Órdenes</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>POST /api/orders</code> - Crear una nueva orden</li>
                        <li><code>GET /api/orders/:id</code> - Obtener una orden específica</li>
                        <li><code>GET /api/users/:userId/orders</code> - Órdenes de un usuario</li>
                        <li><code>GET /api/admin/orders</code> - Obtener todas las órdenes (admin)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Configuración</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>GET /api/brand-settings</code> - Obtener configuración de marca</li>
                        <li><code>POST /api/brand-settings</code> - Actualizar configuración de marca</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Autenticación</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>POST /api/auth/login</code> - Iniciar sesión (admin)</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Exportación</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>GET /api/export/users</code> - Exportar usuarios a CSV</li>
                        <li><code>GET /api/export/products</code> - Exportar productos a CSV</li>
                        <li><code>GET /api/export/orders</code> - Exportar órdenes a CSV</li>
                      </ul>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium">Google Sheets</h4>
                      <ul className="list-disc ml-6 space-y-1">
                        <li><code>GET /api/admin/google-config</code> - Obtener configuración de Google</li>
                        <li><code>POST /api/admin/simple-google-sheets-config</code> - Configurar Google Sheets</li>
                        <li><code>POST /api/admin/simple-google-drive-config</code> - Configurar Google Drive</li>
                        <li><code>GET /api/admin/sync-sheets</code> - Sincronizar datos con Google Sheets</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}