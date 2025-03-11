# Aplicación de Compra Virtual con Escaneo QR

Esta aplicación permite a los usuarios escanear códigos QR de productos utilizando la cámara del dispositivo y agregarlos directamente al carrito de compras.

## Requisitos

- Node.js 18+ 
- PostgreSQL (opcional, la aplicación puede funcionar con almacenamiento en memoria)

## Funcionalidades principales

- Escaneo de códigos QR de productos usando la cámara del dispositivo
- Carrito de compras en tiempo real
- Gestión de usuarios
- Panel de administración
- Interfaz multilingüe (español e inglés)
- Registro de escaneos con datos de geolocalización

## Importante sobre el escáner QR

El acceso a la cámara para el escaneo QR requiere:
- Un contexto seguro (HTTPS)
- Permisos del navegador para acceder a la cámara
- Funciona mejor en dispositivos móviles

## Despliegue de la aplicación

### Opción 1: Despliegue en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente la configuración en el archivo `vercel.json`
3. Configura las siguientes variables de entorno:
   - `DATABASE_URL` - URL de conexión a la base de datos PostgreSQL (opcional)
   - Otras variables secretas necesarias para integraciones

### Opción 2: Despliegue en Netlify

1. Conecta tu repositorio de GitHub a Netlify
2. Netlify detectará automáticamente la configuración en el archivo `netlify.toml`
3. Configura las variables de entorno similares a las de Vercel

### Opción 3: Despliegue manual

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura las variables de entorno en un archivo `.env`
4. Construye la aplicación: `npm run build`
5. Inicia la aplicación: `npm start`

## Desarrollo local

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. La aplicación estará disponible en `http://localhost:5000`

## Notas

El escáner QR requiere permiso de cámara, que solo funciona en contextos seguros (HTTPS). Para desarrollo local, puedes usar:
- Chrome con la bandera de características --unsafely-treat-insecure-origin-as-secure
- Ngrok para crear un túnel seguro a tu servidor local