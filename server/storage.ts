import { users, type User, type InsertUser } from "@shared/schema";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { orders, type Order, type InsertOrder } from "@shared/schema";
import { orderItems, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { brandSettings, type BrandSettings, type InsertBrandSettings } from "@shared/schema";
import { qrScanLogs, type QrScanLog, type InsertQrScanLog } from "@shared/schema";
import { synchronizeWithGoogleSheets, getGoogleConfig } from "./googleSheets";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByEmailAndPassword(email: string, password: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: number, newCoinsAmount: number): Promise<User | undefined>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  exportUsersToCSV(): Promise<string>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByQrCode(qrCode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: number, newStock: number): Promise<Product | undefined>;
  exportProductsToCSV(): Promise<string>;
  generateQrCodeForProduct(productId: number): Promise<string>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  exportOrdersToCSV(): Promise<string>;
  
  // Order items operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getAllOrderItems(): Promise<OrderItem[]>;
  
  // Brand settings operations
  getBrandSettings(): Promise<BrandSettings | undefined>;
  createOrUpdateBrandSettings(settings: InsertBrandSettings): Promise<BrandSettings>;
  
  // QR scan log operations
  logQrScan(scanLog: InsertQrScanLog): Promise<QrScanLog>;
  getQrScanLogs(qrCode?: string, userId?: number): Promise<QrScanLog[]>;
  getQrScanLog(id: number): Promise<QrScanLog | undefined>;
  getProductScanStats(productId: number): Promise<{ totalScans: number, uniqueUsers: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private brandSettings: Map<number, BrandSettings>;
  private qrScanLogs: Map<number, QrScanLog>;
  
  private userId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;
  private brandSettingsId: number;
  private qrScanLogId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.brandSettings = new Map();
    this.qrScanLogs = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.brandSettingsId = 1;
    this.qrScanLogId = 1;
    
    // Initialize with some sample products
    this.initializeProducts();
    
    // Initialize default brand settings
    this.initializeBrandSettings();
    
    // Initialize a default admin user
    this.initializeAdminUser();
  }
  
  private async initializeAdminUser() {
    // Create admin users if they don't exist
    const adminUsers: InsertUser[] = [
      {
        name: 'Administrador',
        email: 'admin@example.com',
        phone: '1234567890',
        company: 'Admin Company',
        password: 'admin123', // Contraseña por defecto
        coins: 1000,
        isAdmin: true
      },
      {
        name: 'Jaime',
        email: 'jdjfc@hotmail.com',
        phone: '1234567890',
        company: 'Admin Company',
        password: 'admin123', // Contraseña por defecto
        coins: 1000,
        isAdmin: true
      }
    ];
    
    // Create admin users
    for (const adminUser of adminUsers) {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(adminUser.email);
      if (!existingUser) {
        await this.createUser(adminUser);
      }
    }
  }
  
  private async initializeBrandSettings() {
    const defaultSettings: InsertBrandSettings = {
      logoUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=300&h=200&fit=crop&crop=center',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      welcomeImageUrl: 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=1200&h=600&fit=crop&crop=center',
      language: 'es',
      fontFamily: 'Inter',
      borderRadius: '0.5rem',
      enableAnimations: true,
    };
    
    await this.createOrUpdateBrandSettings(defaultSettings);
  }
  
  private async initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: 'Queso Fresco',
        category: 'Lácteos',
        price: 30,
        description: 'Queso fresco artesanal, perfecto para ensaladas y sándwiches.',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD001'
      },
      {
        name: 'Ensalada Fresca',
        category: 'Frutas y Verduras',
        price: 25,
        description: 'Mix de hojas verdes, tomate y aguacate, perfecto para acompañar tus comidas.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD002'
      },
      {
        name: 'Pizza Artesanal',
        category: 'Panadería',
        price: 20,
        description: 'Pizza de masa fina elaborada con ingredientes frescos de primera calidad.',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD003'
      },
      {
        name: 'Filete de Res',
        category: 'Carnes',
        price: 45,
        description: 'Corte premium de res, ideal para asar a la parrilla.',
        imageUrl: 'https://images.unsplash.com/photo-1602014508516-dcfb08761ccf?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD004'
      },
      {
        name: 'Agua Mineral',
        category: 'Bebidas',
        price: 15,
        description: 'Agua mineral natural sin gas, refrescante y pura.',
        imageUrl: 'https://images.unsplash.com/photo-1564725073275-10240394e0f8?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD005'
      },
      {
        name: 'Mix de Frutos Secos',
        category: 'Snacks',
        price: 35,
        description: 'Mezcla de nueces, almendras y pasas. Snack saludable y energético.',
        imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=300&h=200&fit=crop&crop=center',
        qrCode: 'QRPROD006'
      }
    ];
    
    for (const product of sampleProducts) {
      await this.createProduct(product);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserByEmailAndPassword(email: string, password: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email && user.password === password
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, password: newPassword };
    this.users.set(userId, updatedUser);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('users', Array.from(this.users.values()));
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      company: insertUser.company,
      coins: insertUser.coins || 100,
      isAdmin: insertUser.isAdmin || false,
      password: insertUser.password || null
    };
    this.users.set(id, user);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('users', Array.from(this.users.values()));
    return user;
  }
  
  async updateUserCoins(userId: number, newCoinsAmount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, coins: newCoinsAmount };
    this.users.set(userId, updatedUser);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('users', Array.from(this.users.values()));
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    // Check if user exists
    const user = await this.getUser(id);
    if (!user) return false;
    
    // Don't allow deleting admin users to prevent locking out
    if (user.isAdmin) return false;
    
    // Delete the user
    const result = this.users.delete(id);
    
    // Synchronize with Google Sheets
    if (result) {
      await synchronizeWithGoogleSheets('users', Array.from(this.users.values()));
    }
    
    return result;
  }
  
  async exportUsersToCSV(): Promise<string> {
    const users = await this.getAllUsers();
    
    // Header row
    let csv = 'ID,Name,Email,Phone,Company,Coins,IsAdmin\n';
    
    // Data rows
    for (const user of users) {
      csv += `${user.id},"${user.name}","${user.email}","${user.phone}","${user.company}",${user.coins},${user.isAdmin}\n`;
    }
    
    return csv;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByQrCode(qrCode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.qrCode === qrCode
    );
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      stock: insertProduct.stock !== undefined ? insertProduct.stock : 100
    };
    this.products.set(id, product);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('products', Array.from(this.products.values()));
    return product;
  }
  
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('products', Array.from(this.products.values()));
    return updatedProduct;
  }
  
  async updateProductStock(id: number, newStock: number): Promise<Product | undefined> {
    return this.updateProduct(id, { stock: newStock });
  }
  
  async exportProductsToCSV(): Promise<string> {
    const products = await this.getAllProducts();
    
    // Header row
    let csv = 'ID,Name,Category,Price,Description,QR Code,Stock\n';
    
    // Data rows
    for (const product of products) {
      csv += `${product.id},"${product.name}","${product.category}",${product.price},"${product.description}","${product.qrCode}",${product.stock}\n`;
    }
    
    return csv;
  }
  
  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { ...insertOrder, id };
    this.orders.set(id, order);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('orders', Array.from(this.orders.values()));
    return order;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async exportOrdersToCSV(): Promise<string> {
    const orders = await this.getAllOrders();
    
    // Header row para la vista completa (inclusiva de usuario y productos)
    let csv = 'ID Orden,Código Recibo,Fecha Compra,Total Orden,ID Usuario,Nombre Usuario,Email Usuario,Empresa Usuario,ID Producto,Nombre Producto,Categoría Producto,Precio Producto\n';
    
    // Recorrer todas las órdenes
    for (const order of orders) {
      // Formatear la fecha de la orden
      const date = order.orderDate instanceof Date 
        ? order.orderDate.toISOString() 
        : new Date(order.orderDate).toISOString();
      
      // Obtener la información del usuario
      const user = await this.getUser(order.userId);
      if (!user) continue; // Si no hay usuario, saltamos esta orden
      
      // Obtener los items de la orden
      const orderItems = await this.getOrderItems(order.id);
      
      if (orderItems.length === 0) {
        // Si no hay items, al menos registrar la orden con el usuario
        csv += `${order.id},"${order.receiptCode}","${date}",${order.total},${user.id},"${user.name}","${user.email}","${user.company}",,,,\n`;
      } else {
        // Por cada item en la orden, crear una fila
        for (const item of orderItems) {
          const product = await this.getProduct(item.productId);
          if (!product) continue; // Si no hay producto, saltamos este item
          
          // Crear línea con toda la información relacionada
          csv += `${order.id},"${order.receiptCode}","${date}",${order.total},${user.id},"${user.name}","${user.email}","${user.company}",${product.id},"${product.name}","${product.category}",${product.price}\n`;
        }
      }
    }
    
    // Enviar a Google Sheets si está configurado
    const config = await getGoogleConfig();
    if (config.connected && config.sheets) {
      try {
        await synchronizeWithGoogleSheets('orders_detailed', [], csv);
      } catch (error) {
        console.error('Error al sincronizar órdenes con Google Sheets:', error);
      }
    }
    
    return csv;
  }
  
  // Order items operations
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('orderItems', Array.from(this.orderItems.values()));
    return orderItem;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (orderItem) => orderItem.orderId === orderId
    );
  }
  
  async getAllOrderItems(): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values());
  }
  
  // Brand settings operations
  async getBrandSettings(): Promise<BrandSettings | undefined> {
    // Since we'll only have one brand settings record, always return the first one if it exists
    const settings = Array.from(this.brandSettings.values());
    return settings.length > 0 ? settings[0] : undefined;
  }
  
  async createOrUpdateBrandSettings(settings: InsertBrandSettings): Promise<BrandSettings> {
    const existingSettings = await this.getBrandSettings();
    
    // Ensure all required fields have values
    const processedSettings = {
      logoUrl: settings.logoUrl || "https://cdn-icons-png.flaticon.com/512/5234/5234876.png",
      welcomeImageUrl: settings.welcomeImageUrl || "https://cdn-icons-png.flaticon.com/512/2331/2331966.png",
      primaryColor: settings.primaryColor || "#3b82f6",
      secondaryColor: settings.secondaryColor || "#10b981",
      language: settings.language || "es",
      fontFamily: settings.fontFamily || "Inter",
      borderRadius: settings.borderRadius || "0.5rem",
      enableAnimations: settings.enableAnimations !== undefined ? settings.enableAnimations : true,
      storeName: settings.storeName || "Mi Tienda",
      storeDescription: settings.storeDescription || "Descripción de la tienda",
      saleImageUrl: settings.saleImageUrl || ""
    };
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings: BrandSettings = { ...existingSettings, ...processedSettings };
      this.brandSettings.set(existingSettings.id, updatedSettings);
      
      // Synchronize with Google Sheets
      await synchronizeWithGoogleSheets('brandSettings', Array.from(this.brandSettings.values()));
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.brandSettingsId++;
      const newSettings: BrandSettings = { 
        id, 
        ...processedSettings
      };
      this.brandSettings.set(id, newSettings);
      
      // Synchronize with Google Sheets
      await synchronizeWithGoogleSheets('brandSettings', Array.from(this.brandSettings.values()));
      return newSettings;
    }
  }
  
  // QR scan log operations
  async logQrScan(scanLog: InsertQrScanLog): Promise<QrScanLog> {
    const id = this.qrScanLogId++;
    const qrScanLog: QrScanLog = {
      ...scanLog,
      id,
      userId: scanLog.userId || null,
      productId: scanLog.productId || null,
      scanDate: scanLog.scanDate || new Date(),
      latitude: scanLog.latitude || null,
      longitude: scanLog.longitude || null,
      deviceInfo: scanLog.deviceInfo || null,
      successful: scanLog.successful !== undefined ? scanLog.successful : true,
      scanContext: scanLog.scanContext || null
    };
    this.qrScanLogs.set(id, qrScanLog);
    
    // No synchronizamos con Google Sheets para evitar exceso de datos
    // Los logs son principalmente para analíticas internas
    
    return qrScanLog;
  }
  
  async getQrScanLogs(qrCode?: string, userId?: number): Promise<QrScanLog[]> {
    let logs = Array.from(this.qrScanLogs.values());
    
    if (qrCode) {
      logs = logs.filter(log => log.qrCode === qrCode);
    }
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    // Ordenar por fecha de escaneo, más reciente primero
    return logs.sort((a, b) => {
      const dateA = a.scanDate instanceof Date ? a.scanDate : new Date(a.scanDate);
      const dateB = b.scanDate instanceof Date ? b.scanDate : new Date(b.scanDate);
      return dateB.getTime() - dateA.getTime();
    });
  }
  
  async getQrScanLog(id: number): Promise<QrScanLog | undefined> {
    return this.qrScanLogs.get(id);
  }
  
  async getProductScanStats(productId: number): Promise<{ totalScans: number, uniqueUsers: number }> {
    const logs = Array.from(this.qrScanLogs.values()).filter(
      log => log.productId === productId && log.successful === true
    );
    
    const uniqueUserSet = new Set<number>();
    logs.forEach(log => {
      if (log.userId) {
        uniqueUserSet.add(log.userId);
      }
    });
    
    return {
      totalScans: logs.length,
      uniqueUsers: uniqueUserSet.size
    };
  }
  
  async generateQrCodeForProduct(productId: number): Promise<string> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error(`Producto con ID ${productId} no encontrado`);
    }
    
    // Si ya tiene un código QR, lo devolvemos
    if (product.qrCode) {
      return product.qrCode;
    }
    
    // Si no, generamos uno nuevo
    const qrCode = `QRPROD${String(productId).padStart(3, '0')}`;
    
    // Actualizamos el producto con el nuevo código
    await this.updateProduct(productId, { qrCode });
    
    return qrCode;
  }
}

export const storage = new MemStorage();