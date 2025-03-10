import { users, type User, type InsertUser } from "@shared/schema";
import { products, type Product, type InsertProduct } from "@shared/schema";
import { orders, type Order, type InsertOrder } from "@shared/schema";
import { orderItems, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { synchronizeWithGoogleSheets } from "./googleSheets";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: number, newCoinsAmount: number): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByQrCode(qrCode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  
  // Order items operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Initialize with some sample products
    this.initializeProducts();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
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
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    
    // Synchronize with Google Sheets
    await synchronizeWithGoogleSheets('products', Array.from(this.products.values()));
    return product;
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
}

export const storage = new MemStorage();
