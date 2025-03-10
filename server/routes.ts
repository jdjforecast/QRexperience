import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupGoogleSheetsConnection } from "./googleSheets";
import { z } from "zod";
import { insertUserSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Google Sheets connection
  await setupGoogleSheetsConnection();

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
      
      // Create a unique receipt code
      const receiptCode = `QR${Date.now().toString().slice(-6)}${randomUUID().substring(0, 4)}`;
      
      // Create the order
      const order = await storage.createOrder({
        userId,
        orderDate: new Date(),
        total,
        receiptCode
      });
      
      // Create order items
      for (const product of products) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: product.id,
          price: product.price
        });
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

  const httpServer = createServer(app);
  
  return httpServer;
}
