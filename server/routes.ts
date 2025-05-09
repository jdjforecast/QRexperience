import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  setupGoogleSheetsConnection,
  synchronizeWithGoogleSheets,
  getGoogleConfig,
  saveGoogleSheetsConfig,
  saveGoogleDriveConfig,
  saveSimpleGoogleSheetsConfig,
  saveSimpleGoogleDriveConfig,
  getSyncStats,
  GoogleSheetsConfig,
  GoogleDriveConfig
} from "./googleSheets";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertProductSchema,
  insertBrandSettingsSchema
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Google Sheets connection
  await setupGoogleSheetsConnection();

  // Admin middleware to verify if user is an admin
  const checkAdminAccess = async (req: Request, res: Response, next: Function) => {
    try {
      // For demo/development purposes, we'll bypass actual authentication
      // In a real production app, this would use proper auth tokens
      
      // Get email from header or query parameter
      const userEmail = req.headers['user-email'] || req.query.userEmail;
      
      if (!userEmail) {
        // For demo purposes: if no email is provided, we'll use Jaime's email
        const adminUser = await storage.getUserByEmail('jdjfc@hotmail.com');
        if (adminUser) {
          next();
          return;
        }
        return res.status(401).json({ message: "Unauthorized: Please provide a user email" });
      }
      
      const user = await storage.getUserByEmail(userEmail as string);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: User is not an admin" });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // ==== User Routes ====
  // Register a new user
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(userInput.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Create the user with 100 initial coins
      const user = await storage.createUser({
        ...userInput,
        coins: 100
      });
      
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get admin user for login - this route must be before routes with params
  app.get("/api/users/admin", async (_req: Request, res: Response) => {
    try {
      // Get all users
      const users = await storage.getAllUsers();
      
      // Find admin user
      const adminUser = users.find(user => user.isAdmin);
      
      if (!adminUser) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      res.json(adminUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to get admin user" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Check if user is admin
  app.get("/api/users/:id/admin", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ isAdmin: user.isAdmin || false });
    } catch (error) {
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Update user coins
  app.patch("/api/users/:id/coins", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { coins } = req.body;
      
      if (typeof coins !== "number" || coins < 0) {
        return res.status(400).json({ message: "Invalid coins amount" });
      }
      
      const updatedUser = await storage.updateUserCoins(userId, coins);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user coins" });
    }
  });

  // ==== Product Routes ====
  // Get all products
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  // Get product by QR code - specific routes must be before generic ones
  app.get("/api/products/qr/:qrCode", async (req: Request, res: Response) => {
    try {
      const qrCode = req.params.qrCode;
      const product = await storage.getProductByQrCode(qrCode);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product by QR code" });
    }
  });

  // Get products by category
  app.get("/api/products/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products by category" });
    }
  });

  // Get product by ID
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  // ==== Order Routes ====
  // Create an order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { userId, total, products } = req.body;
      
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one product" });
      }
      
      // Get user to check if they have enough coins
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.coins < total) {
        return res.status(400).json({ message: "User does not have enough coins" });
      }
      
      // Check if user has already bought any of these products (limit 1 per user)
      const userOrders = await storage.getOrdersByUser(userId);
      
      // Get all order items for this user's orders
      const userOrderItems = await Promise.all(
        userOrders.map(order => storage.getOrderItems(order.id))
      );
      
      // Flatten the array of order items
      const flattenedOrderItems = userOrderItems.flat();
      
      // Check if any product in the cart has already been purchased by this user
      for (const cartProduct of products) {
        const alreadyPurchased = flattenedOrderItems.some(
          item => item.productId === cartProduct.id
        );
        
        if (alreadyPurchased) {
          return res.status(400).json({ 
            message: "You've already purchased one of these products. Only one purchase per product is allowed."
          });
        }
        
        // Check if product is in stock
        const product = await storage.getProduct(cartProduct.id);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${cartProduct.id} not found` });
        }
        
        if (product.stock <= 0) {
          return res.status(400).json({ 
            message: `Product "${product.name}" is out of stock` 
          });
        }
      }
      
      // Create a unique receipt code
      const receiptCode = `QR${Date.now().toString().slice(-6)}${randomUUID().substring(0, 4)}`;
      
      // Create the order
      const order = await storage.createOrder({
        userId,
        orderDate: new Date(),
        total,
        receiptCode
      });
      
      // Create order items and update product stock
      for (const cartProduct of products) {
        // Create order item
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartProduct.id,
          price: cartProduct.price
        });
        
        // Update product stock (decrease by 1)
        const product = await storage.getProduct(cartProduct.id);
        if (product) {
          await storage.updateProductStock(product.id, product.stock - 1);
        }
      }
      
      // Update user's coins
      await storage.updateUserCoins(userId, user.coins - total);
      
      // Return the complete order with items
      const orderItems = await storage.getOrderItems(order.id);
      
      res.status(201).json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(orderId);
      
      res.json({
        ...order,
        items: orderItems
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  // Get orders by user ID
  app.get("/api/users/:userId/orders", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUser(userId);
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user orders" });
    }
  });
  
  // ==== CSV Export Routes ====
  // Export users as CSV
  app.get("/api/export/users", async (_req: Request, res: Response) => {
    try {
      const csv = await storage.exportUsersToCSV();
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export users to CSV" });
    }
  });
  
  // Export products as CSV
  app.get("/api/export/products", async (_req: Request, res: Response) => {
    try {
      const csv = await storage.exportProductsToCSV();
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="products.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export products to CSV" });
    }
  });
  
  // Export orders as CSV
  app.get("/api/export/orders", async (_req: Request, res: Response) => {
    try {
      const csv = await storage.exportOrdersToCSV();
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', 'attachment; filename="orders.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export orders to CSV" });
    }
  });
  
  // ==== Google Integration Routes ====
  // Get Google configuration
  app.get("/api/admin/google-config", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      const config = await getGoogleConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Failed to get Google configuration" });
    }
  });
  
  // Save Google Sheets configuration
  app.post("/api/admin/google-sheets-config", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const config: GoogleSheetsConfig = req.body;
      const updatedConfig = await saveGoogleSheetsConfig(config);
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to save Google Sheets configuration" });
    }
  });
  
  // Save Google Drive configuration
  app.post("/api/admin/google-drive-config", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const config: GoogleDriveConfig = req.body;
      const updatedConfig = await saveGoogleDriveConfig(config);
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to save Google Drive configuration" });
    }
  });
  
  // Save Simple Google Sheets configuration (solo URL)
  app.post("/api/admin/simple-google-sheets-config", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const updatedConfig = await saveSimpleGoogleSheetsConfig(url);
      res.json(updatedConfig);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to save simple Google Sheets configuration" });
    }
  });
  
  // Save Simple Google Drive configuration (solo URL)
  app.post("/api/admin/simple-google-drive-config", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }
      const updatedConfig = await saveSimpleGoogleDriveConfig(url);
      res.json(updatedConfig);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to save simple Google Drive configuration" });
    }
  });
  
  // Get sync stats
  app.get("/api/admin/sync-stats", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      const stats = await getSyncStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sync stats" });
    }
  });
  
  // Trigger sync with Google Sheets manually
  app.get("/api/admin/sync-sheets", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      // Sync users
      const users = await storage.getAllUsers();
      await synchronizeWithGoogleSheets('users', users);
      
      // Sync products
      const products = await storage.getAllProducts();
      await synchronizeWithGoogleSheets('products', products);
      
      // Sync orders
      const orders = await storage.getAllOrders();
      await synchronizeWithGoogleSheets('orders', orders);
      
      res.json({ message: "Synchronization completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync with Google Sheets" });
    }
  });
  
  // ==== Product Stock Management ====
  // Create a new product (admin only)
  app.post("/api/products", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const productInput = insertProductSchema.parse(req.body);
      
      // Check if a product with this QR code already exists
      if (productInput.qrCode) {
        const existingProduct = await storage.getProductByQrCode(productInput.qrCode);
        if (existingProduct) {
          return res.status(409).json({ message: "Product with this QR code already exists" });
        }
      }
      
      const product = await storage.createProduct(productInput);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Update a product
  app.patch("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, updates);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  // Update product stock
  app.patch("/api/products/:id/stock", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { stock } = req.body;
      
      if (typeof stock !== "number" || stock < 0) {
        return res.status(400).json({ message: "Invalid stock amount" });
      }
      
      const updatedProduct = await storage.updateProductStock(productId, stock);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product stock" });
    }
  });
  
  // ==== Brand Settings Routes ====
  // Get brand settings
  app.get("/api/brand-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await storage.getBrandSettings();
      
      if (!settings) {
        return res.status(404).json({ message: "Brand settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get brand settings" });
    }
  });
  
  // Update brand settings (admin only)
  app.post("/api/brand-settings", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const settingsInput = insertBrandSettingsSchema.parse(req.body);
      
      const settings = await storage.createOrUpdateBrandSettings(settingsInput);
      
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid brand settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand settings" });
    }
  });
  
  // ==== Admin Routes ===
  
  // Admin login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmailAndPassword(email, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!user.isAdmin) {
        return res.status(403).json({ message: "User is not an admin" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Update user password
  app.patch("/api/users/:id/password", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { password } = req.body;
      
      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Valid password is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUserPassword(userId, password);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });
  
  // Get all users for admin
  app.get("/api/admin/users", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
    }
  });
  
  // Delete a user (admin access required)
  app.delete("/api/users/:id", checkAdminAccess, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Get user to check if it's an admin
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting admin users
      if (user.isAdmin) {
        return res.status(403).json({ message: "Cannot delete admin users" });
      }
      
      const result = await storage.deleteUser(userId);
      if (!result) {
        return res.status(404).json({ message: "Failed to delete user" });
      }
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Get all orders for admin
  app.get("/api/admin/orders", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrders();
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to get orders" });
    }
  });
  
  // QR Scan Logs routes
  app.post("/api/qr-scans", async (req: Request, res: Response) => {
    try {
      const scanLog = req.body;
      const result = await storage.logQrScan(scanLog);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al registrar escaneo QR:", error);
      res.status(500).json({ success: false, message: "Error al registrar escaneo QR" });
    }
  });
  
  app.get("/api/qr-scans", async (req: Request, res: Response) => {
    try {
      const qrCode = req.query.qrCode as string | undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      const logs = await storage.getQrScanLogs(qrCode, userId);
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error al obtener registros de escaneo QR:", error);
      res.status(500).json({ success: false, message: "Error al obtener registros de escaneo QR" });
    }
  });
  
  app.get("/api/products/:id/scan-stats", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const stats = await storage.getProductScanStats(productId);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error al obtener estadísticas de escaneo para el producto:", error);
      res.status(500).json({ success: false, message: "Error al obtener estadísticas de escaneo" });
    }
  });
  
  app.get("/api/products/:id/qr-code", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const qrCode = await storage.generateQrCodeForProduct(productId);
      res.status(200).json({ qrCode });
    } catch (error) {
      console.error("Error al generar código QR para el producto:", error);
      res.status(500).json({ success: false, message: "Error al generar código QR para el producto" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
