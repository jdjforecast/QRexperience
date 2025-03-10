import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  coins: integer("coins").notNull().default(100),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  phone: true,
  coins: true,
});

// Product Schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  qrCode: text("qr_code").notNull(),
  stock: integer("stock").default(100).notNull(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  price: true,
  description: true,
  imageUrl: true,
  qrCode: true,
  stock: true,
});

// Order Schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  orderDate: timestamp("order_date").notNull(),
  total: integer("total").notNull(),
  receiptCode: text("receipt_code").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  orderDate: true,
  total: true,
  receiptCode: true,
});

// Order Items Schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  price: integer("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  price: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Category type
export const categories = [
  'Frutas y Verduras',
  'Lácteos',
  'Carnes',
  'Panadería',
  'Bebidas',
  'Snacks'
] as const;

export type Category = typeof categories[number];

// Brand Settings Schema
export const brandSettings = pgTable("brand_settings", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url").notNull(),
  primaryColor: text("primary_color").default("#3b82f6").notNull(),
  secondaryColor: text("secondary_color").default("#10b981").notNull(),
  welcomeImageUrl: text("welcome_image_url").notNull(),
  language: text("language").default("es").notNull(),
  fontFamily: text("font_family").default("Inter").notNull(),
  borderRadius: text("border_radius").default("0.5rem").notNull(),
  enableAnimations: boolean("enable_animations").default(true).notNull(),
});

export const insertBrandSettingsSchema = createInsertSchema(brandSettings).pick({
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  welcomeImageUrl: true,
  language: true,
  fontFamily: true,
  borderRadius: true,
  enableAnimations: true,
});

export type InsertBrandSettings = z.infer<typeof insertBrandSettingsSchema>;
export type BrandSettings = typeof brandSettings.$inferSelect;
