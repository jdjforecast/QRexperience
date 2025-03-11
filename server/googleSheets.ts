import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtenemos el equivalente a __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Interfaces para la configuración
export interface GoogleSheetsConfig {
  spreadsheetUrl?: string;  // Nueva opción simplificada: URL de la hoja
  spreadsheetId?: string;   // Método tradicional - ID de la hoja
  clientEmail?: string;     // Método tradicional - Credenciales
  privateKey?: string;      // Método tradicional - Credenciales
  lastSyncTime?: string;
}

export interface GoogleDriveConfig {
  folderUrl?: string;       // Nueva opción simplificada: URL de la carpeta
  folderId?: string;        // Método tradicional - ID de la carpeta
  clientEmail?: string;     // Método tradicional - Credenciales
  privateKey?: string;      // Método tradicional - Credenciales
  lastSyncTime?: string;
}

interface GoogleConfig {
  sheets?: GoogleSheetsConfig;
  drive?: GoogleDriveConfig;
  connected: boolean;
  simpleMode: boolean;      // Indica si estamos en modo simple (solo URL) o completo (credenciales)
}

// Path donde se guardará la configuración
const CONFIG_FILE_PATH = path.join(__dirname, '..', 'googleConfig.json');

// Función para extraer el ID de la hoja de cálculo de una URL de Google Sheets
function extractSpreadsheetId(url: string): string | null {
  // Patrón para URLs de Google Sheets
  // Ejemplos:
  // https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=0
  // https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit?usp=sharing
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Función para extraer el ID de la carpeta de una URL de Google Drive
function extractFolderId(url: string): string | null {
  // Patrón para URLs de carpetas de Google Drive
  // Ejemplos:
  // https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz
  // https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWxYz?usp=sharing
  const regex = /\/folders\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Función para obtener la configuración actual
export async function getGoogleConfig(): Promise<GoogleConfig> {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      const config = JSON.parse(fileContent) as GoogleConfig;
      return config;
    }
    return { connected: false, simpleMode: true };
  } catch (error) {
    console.error('Error al leer la configuración de Google:', error);
    return { connected: false, simpleMode: true };
  }
}

// Función para guardar la configuración de Google Sheets
export async function saveGoogleSheetsConfig(config: GoogleSheetsConfig): Promise<GoogleConfig> {
  try {
    let fullConfig: GoogleConfig;
    
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      fullConfig = JSON.parse(fileContent) as GoogleConfig;
    } else {
      fullConfig = { connected: false, simpleMode: true };
    }
    
    // Actualizar la configuración
    fullConfig.sheets = {
      ...config,
      lastSyncTime: new Date().toISOString()
    };
    
    // Determinar si hay suficiente información para considerar que está conectado
    const isConnected = !!(
      config.spreadsheetId && 
      config.clientEmail && 
      config.privateKey
    );
    
    fullConfig.connected = isConnected || !!(fullConfig.drive && 
      fullConfig.drive.folderId && 
      fullConfig.drive.clientEmail && 
      fullConfig.drive.privateKey);
    
    // Guardar la configuración
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(fullConfig, null, 2));
    
    return fullConfig;
  } catch (error) {
    console.error('Error al guardar la configuración de Google Sheets:', error);
    throw error;
  }
}

// Función para guardar la configuración de Google Drive
export async function saveGoogleDriveConfig(config: GoogleDriveConfig): Promise<GoogleConfig> {
  try {
    let fullConfig: GoogleConfig;
    
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      fullConfig = JSON.parse(fileContent) as GoogleConfig;
    } else {
      fullConfig = { connected: false, simpleMode: true };
    }
    
    // Actualizar la configuración
    fullConfig.drive = {
      ...config,
      lastSyncTime: new Date().toISOString()
    };
    
    // Determinar si hay suficiente información para considerar que está conectado
    const isConnected = !!(
      config.folderId && 
      config.clientEmail && 
      config.privateKey
    );
    
    fullConfig.connected = isConnected || !!(fullConfig.sheets && 
      fullConfig.sheets.spreadsheetId && 
      fullConfig.sheets.clientEmail && 
      fullConfig.sheets.privateKey);
    
    // Guardar la configuración
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(fullConfig, null, 2));
    
    return fullConfig;
  } catch (error) {
    console.error('Error al guardar la configuración de Google Drive:', error);
    throw error;
  }
}

// Función para obtener estadísticas de sincronización
export async function getSyncStats(): Promise<{ users: number; products: number; orders: number }> {
  // En una implementación real, estas estadísticas se obtendrían de Google Sheets
  // Por ahora, devolvemos valores estáticos
  return {
    users: 2,
    products: 6,
    orders: 0
  };
}

/**
 * Esta función sincroniza datos con Google Sheets
 * En una implementación real, utilizaría la API de Google Sheets
 * Por ahora, simularemos escribiendo en un archivo local
 */
export async function synchronizeWithGoogleSheets(
  sheetName: string,
  data: any[]
): Promise<void> {
  try {
    // Obtenemos la configuración
    const config = await getGoogleConfig();
    
    // Si no está configurado, no hacemos nada
    if (!config.connected || !config.sheets) {
      console.log(`[Google Sheets] No hay configuración para sincronizar ${sheetName}`);
      return Promise.resolve();
    }
    
    // Por ahora, solo registramos que sincronizaríamos con Google Sheets
    console.log(`[Google Sheets] Synchronizing ${data.length} records to "${sheetName}" sheet`);
    
    // En una implementación real, se usaría la API de Google Sheets:
    // 1. Autenticar usando credenciales de cuenta de servicio
    // 2. Obtener una referencia a la hoja específica
    // 3. Escribir los datos en la hoja
    
    // Nota: En un entorno de producción, se utilizaría:
    // - Paquete npm google-spreadsheet o directamente la API de Google Sheets
    // - OAuth2 o cuenta de servicio para autenticación
    // - Mecanismos adecuados de manejo de errores y reintentos
    
    // Actualizar el tiempo de última sincronización
    if (config.sheets) {
      config.sheets.lastSyncTime = new Date().toISOString();
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error synchronizing with Google Sheets:', error);
    return Promise.reject(error);
  }
}

/**
 * Esta función configuraría la conexión inicial con Google Sheets
 * Crearía las hojas necesarias si no existen
 */
export async function setupGoogleSheetsConnection(): Promise<void> {
  try {
    // Obtenemos la configuración
    const config = await getGoogleConfig();
    
    // Si no está configurado, no hacemos nada
    if (!config.connected || !config.sheets) {
      console.log('[Google Sheets] No hay configuración para inicializar la conexión');
      return Promise.resolve();
    }
    
    // Registramos que estamos configurando la conexión
    console.log('[Google Sheets] Setting up connection to Google Sheets');
    
    // En una implementación real:
    // 1. Comprobar si la hoja de cálculo existe, si no, crearla
    // 2. Asegurar que existan todas las hojas requeridas (users, products, orders, orderItems)
    // 3. Configurar los encabezados de columna para cada hoja
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error setting up Google Sheets connection:', error);
    return Promise.reject(error);
  }
}

/**
 * Función para configurar Google Sheets con solo una URL
 * Modo simplificado que no requiere credenciales de API
 */
export async function saveSimpleGoogleSheetsConfig(url: string): Promise<GoogleConfig> {
  try {
    // Extraer el ID de la hoja de la URL
    const spreadsheetId = extractSpreadsheetId(url);
    
    if (!spreadsheetId) {
      throw new Error('URL de Google Sheets inválida. Asegúrate de que es una URL de una hoja de cálculo de Google Sheets.');
    }
    
    // Crear configuración simplificada
    const config: GoogleSheetsConfig = {
      spreadsheetUrl: url,
      spreadsheetId: spreadsheetId
    };
    
    let fullConfig: GoogleConfig;
    
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      fullConfig = JSON.parse(fileContent) as GoogleConfig;
    } else {
      fullConfig = { connected: false, simpleMode: true };
    }
    
    // Actualizar la configuración
    fullConfig.sheets = {
      ...config,
      lastSyncTime: new Date().toISOString()
    };
    
    // En modo simple, consideramos que está conectado si tenemos el ID de la hoja
    fullConfig.connected = !!spreadsheetId;
    fullConfig.simpleMode = true;
    
    // Guardar la configuración
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(fullConfig, null, 2));
    
    return fullConfig;
  } catch (error) {
    console.error('Error al guardar la configuración simple de Google Sheets:', error);
    throw error;
  }
}

/**
 * Función para configurar Google Drive con solo una URL
 * Modo simplificado que no requiere credenciales de API
 */
export async function saveSimpleGoogleDriveConfig(url: string): Promise<GoogleConfig> {
  try {
    // Extraer el ID de la carpeta de la URL
    const folderId = extractFolderId(url);
    
    if (!folderId) {
      throw new Error('URL de Google Drive inválida. Asegúrate de que es una URL de una carpeta de Google Drive.');
    }
    
    // Crear configuración simplificada
    const config: GoogleDriveConfig = {
      folderUrl: url,
      folderId: folderId
    };
    
    let fullConfig: GoogleConfig;
    
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      fullConfig = JSON.parse(fileContent) as GoogleConfig;
    } else {
      fullConfig = { connected: false, simpleMode: true };
    }
    
    // Actualizar la configuración
    fullConfig.drive = {
      ...config,
      lastSyncTime: new Date().toISOString()
    };
    
    // En modo simple, consideramos que está conectado si tenemos el ID de la carpeta
    fullConfig.connected = !!folderId;
    fullConfig.simpleMode = true;
    
    // Guardar la configuración
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(fullConfig, null, 2));
    
    return fullConfig;
  } catch (error) {
    console.error('Error al guardar la configuración simple de Google Drive:', error);
    throw error;
  }
}
