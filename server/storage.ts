import { users, type User, type InsertUser } from "@shared/schema";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { orders, type Order, type InsertOrder } from "@shared/schema";
import { orderItems, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { brandSettings, type BrandSettings, type InsertBrandSettings } from "@shared/schema";
import { synchronizeWithGoogleSheets } from "./googleSheets";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: number, newCoinsAmount: number): Promise<User | undefined>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private brandSettings: Map<number, BrandSettings>;
  
  private userId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;
  private brandSettingsId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.brandSettings = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.brandSettingsId = 1;
    
    // Initialize with some sample products
    this.initializeProducts();
    
    // Initialize default brand settings
    this.initializeBrandSettings();
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

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, coins: insertUser.coins || 100 };
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
  
  async exportUsersToCSV(): Promise<string> {
    const users = await this.getAllUsers();
    
    // Header row
    let csv = 'ID,Name,Email,Phone,Coins\n';
    
    // Data rows
    for (const user of users) {
      csv += `${user.id},"${user.name}","${user.email}","${user.phone}",${user.coins}\n`;
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
    
    // Header row
    let csv = 'ID,User ID,Order Date,Total,Receipt Code\n';
    
    // Data rows
    for (const order of orders) {
      const date = order.orderDate instanceof Date 
        ? order.orderDate.toISOString() 
        : new Date(order.orderDate).toISOString();
      
      csv += `${order.id},${order.userId},"${date}",${order.total},"${order.receiptCode}"\n`;
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
    
    if (existingSettings) {
      // Update existing settings
      const updatedSettings: BrandSettings = { ...existingSettings, ...settings };
      this.brandSettings.set(existingSettings.id, updatedSettings);
      
      // Synchronize with Google Sheets
      await synchronizeWithGoogleSheets('brandSettings', Array.from(this.brandSettings.values()));
      return updatedSettings;
    } else {
      // Create new settings
      const id = this.brandSettingsId++;
      const newSettings: BrandSettings = { ...settings, id };
      this.brandSettings.set(id, newSettings);
      
      // Synchronize with Google Sheets
      await synchronizeWithGoogleSheets('brandSettings', Array.from(this.brandSettings.values()));
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
