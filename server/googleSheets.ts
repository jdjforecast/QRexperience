import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

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
 * Convierte datos CSV a formato para visualización en Google Sheets
 */
function csvToHtml(csvData: string): string {
  const rows = csvData.split('\n');
  let html = '<html><head><style>';
  html += 'table { border-collapse: collapse; width: 100%; }';
  html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
  html += 'th { background-color: #f2f2f2; }';
  html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
  html += '</style></head><body>';
  html += '<h2>' + new Date().toLocaleDateString() + ' - Datos exportados</h2>';
  html += '<table>';
  
  rows.forEach((row, index) => {
    const cells = row.split(',');
    html += '<tr>';
    
    cells.forEach(cell => {
      // Si es la primera fila, usamos encabezados
      if (index === 0) {
        html += `<th>${cell.replace(/"/g, '')}</th>`;
      } else {
        html += `<td>${cell.replace(/"/g, '')}</td>`;
      }
    });
    
    html += '</tr>';
  });
  
  html += '</table></body></html>';
  return html;
}

/**
 * Esta función sincroniza datos con Google Sheets
 * Implementación para el modo simple usando compartir a través de URL
 */
export async function synchronizeWithGoogleSheets(
  sheetName: string,
  data: any[],
  csvData?: string
): Promise<void> {
  try {
    // Obtenemos la configuración
    const config = await getGoogleConfig();
    
    // Si no está configurado, no hacemos nada
    if (!config.connected || !config.sheets) {
      console.log(`[Google Sheets] No hay configuración para sincronizar ${sheetName}`);
      return Promise.resolve();
    }
    
    console.log(`[Google Sheets] Synchronizing ${data.length} records to "${sheetName}" sheet`);
    
    // En modo simple, necesitamos generar y guardar un HTML/CSV que pueda ser visualizado
    // a través de la URL compartida
    if (config.simpleMode && config.sheets.spreadsheetUrl) {
      // Si no se proporcionó CSV, generamos uno simple para debug
      if (!csvData) {
        // Crear un archivo temporal para guardar el CSV
        const tempCSV = `${sheetName}_export_${Date.now()}.csv`;
        const tempPath = path.join(__dirname, '..', tempCSV);
        
        // Convertir datos a CSV
        let csvContent = '';
        
        // Añadir encabezados
        if (data.length > 0) {
          csvContent += Object.keys(data[0]).join(',') + '\n';
        }
        
        // Añadir filas
        data.forEach(item => {
          csvContent += Object.values(item).map(val => `"${val}"`).join(',') + '\n';
        });
        
        // Guardar CSV
        fs.writeFileSync(tempPath, csvContent);
        csvData = csvContent;
        
        console.log(`[Google Sheets] CSV generated at: ${tempPath}`);
      }
      
      // En una implementación real, aquí enviaríamos los datos a Google Sheets
      // mediante la API. En este modo simple, guardamos un HTML que muestra los datos
      // y que podría ser abierto y compartido.
      
      // Convertir el CSV a HTML para visualización
      const htmlContent = csvToHtml(csvData);
      const htmlPath = path.join(__dirname, '..', `${sheetName}_export_${Date.now()}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      console.log(`[Google Sheets] HTML visualización generada en: ${htmlPath}`);
      console.log(`[Google Sheets] Para ver los datos en Google Sheets, por favor copie y pegue el contenido del archivo CSV.`);
      
      // En un entorno real, podríamos usar la API de Web para publicar estos datos
      // Por ahora, solo registramos el éxito del proceso
    } else if (!config.simpleMode) {
      // Implementación para el modo API completo
      // En un entorno de producción, usaríamos la API oficial de Google
      console.log(`[Google Sheets] Usando API para sincronizar con Google Sheets (no implementado)`);
    }
    
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
