import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupGoogleSheetsConnection } from "./googleSheets";
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
      const userId = req.headers['user-id'];
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No user ID provided" });
      }
      
      const user = await storage.getUser(parseInt(userId as string));
      
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

  // Get admin user for login
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

  // Get product by QR code
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
  
  // Get all users for admin
  app.get("/api/admin/users", checkAdminAccess, async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to get users" });
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

  const httpServer = createServer(app);
  
  return httpServer;
}
