import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertListingSchema, insertLikeSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Listing routes
  app.get("/api/listings", async (req, res) => {
    try {
      const { category, userId } = req.query;
      const userIdNum = userId ? parseInt(userId as string) : undefined;
      
      let listings;
      if (category && category !== "all") {
        listings = await storage.getListingsByCategory(category as string, userIdNum);
      } else {
        listings = await storage.getListingsWithUser(userIdNum);
      }
      
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { userId } = req.query;
      
      const listing = await storage.getListingById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const user = await storage.getUser(listing.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userIdNum = userId ? parseInt(userId as string) : undefined;
      const isLiked = userIdNum ? await storage.isListingLiked(userIdNum, id) : false;
      const likesCount = await storage.getLikesCount(id);

      const listingWithUser = {
        ...listing,
        user: { ...user, password: undefined },
        isLiked,
        likesCount,
      };

      res.json(listingWithUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get("/api/users/:id/listings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const listings = await storage.getListingsByUserId(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Like routes
  app.post("/api/likes/toggle", async (req, res) => {
    try {
      const likeData = insertLikeSchema.parse(req.body);
      const isLiked = await storage.toggleLike(likeData);
      const likesCount = await storage.getLikesCount(likeData.listingId);
      
      res.json({ isLiked, likesCount });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid like data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get("/api/users/:id/likes", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const likedListings = await storage.getLikedListings(userId);
      res.json(likedListings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch liked listings" });
    }
  });

  // Message routes
  app.get("/api/listings/:id/messages", async (req, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const messages = await storage.getMessagesByListing(listingId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
