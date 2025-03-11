# Guía de Despliegue para Producción

Esta guía proporciona instrucciones detalladas para desplegar la aplicación de Compra Virtual con Escaneo QR en un entorno de producción.

## Requisitos importantes para producción

### 1. Protocolo HTTPS

Para acceder a la cámara en navegadores modernos, la aplicación **debe** estar servida a través de HTTPS. Esto es un requisito de seguridad impuesto por los navegadores para funcionalidades sensibles como acceso a la cámara, geolocalización, etc.

### 2. Permisos de cámara

Los usuarios deben conceder permisos para acceder a la cámara. En iOS, estos permisos deben ser solicitados por la propia aplicación.

### 3. Acceso a la geolocalización

La aplicación registra datos de ubicación con los escaneos QR (si el usuario lo permite). Esto también requiere permisos especiales y HTTPS.

## Opciones de despliegue

### Opción 1: Vercel (Recomendado)

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel automáticamente detectará la configuración en `vercel.json`
3. Configura las siguientes variables de entorno:
   - `DATABASE_URL` - URL de conexión a la base de datos PostgreSQL (si usas base de datos)
   - `STRIPE_SECRET_KEY` - Clave secreta de Stripe para procesar pagos
   - `VITE_STRIPE_PUBLIC_KEY` - Clave pública de Stripe para el frontend

### Opción 2: Netlify

1. Conecta tu repositorio de GitHub a Netlify
2. Netlify detectará automáticamente la configuración en `netlify.toml`
3. Configura las variables de entorno similares a Vercel

#### Solución a problemas comunes en Netlify

Si encuentras errores relacionados con **"top-level await"** o **"resolver packages"**, la configuración especial en los archivos `netlify.toml` y `vite.netlify.config.js` debería resolverlos:

- El archivo `vite.netlify.config.js` configura Vite para usar formato ESM en lugar de CJS
- Se han marcado como externos los paquetes problemáticos (`@babel/preset-typescript` y `lightningcss`)
- La configuración de Node está establecida en versión 18 para compatibilidad óptima

## Configuración de Stripe para producción

Para procesar pagos en producción con Stripe:

1. Crea una cuenta en [Stripe](https://stripe.com) si aún no tienes una
2. En el dashboard de Stripe, cambia de modo "Test" a modo "Live" cuando estés listo para aceptar pagos reales
3. Obtén las claves de API de producción:
   - `STRIPE_SECRET_KEY` - Clave secreta (comienza con `sk_live_`)
   - `VITE_STRIPE_PUBLIC_KEY` - Clave pública (comienza con `pk_live_`)
4. Configura webhooks para recibir notificaciones sobre eventos de pago
5. Actualiza la configuración de pagos para incluir los impuestos y métodos de pago adecuados para tu región

## Consideraciones finales

- **Dominio personalizado**: Configura un dominio personalizado para mejorar la experiencia de usuario
- **Certificado SSL**: Asegúrate de que tu dominio tiene un certificado SSL válido (Vercel y Netlify lo proporcionan automáticamente)
- **Modo PWA**: Considera habilitar funcionalidades de Progressive Web App para mejorar la experiencia en móviles

## Solución de problemas comunes

- **Error de cámara**: Si los usuarios no pueden acceder a la cámara, verifica que:
  1. La aplicación esté servida sobre HTTPS
  2. El dispositivo tenga una cámara funcional
  3. El usuario haya concedido permisos de cámara

- **Errores de pago**: Si hay problemas con los pagos:
  1. Verifica las claves de API de Stripe
  2. Comprueba que la moneda y configuración regional es correcta
  3. Revisa los logs de Stripe para identificar errores específicos