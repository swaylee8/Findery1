import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertListingSchema, 
  insertLikeSchema, 
  insertMessageSchema,
  insertBoardSchema,
  insertBoardListingSchema,
  insertFollowSchema,
  insertAlertSchema,
  insertReportSchema
} from "@shared/schema";
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

  app.get("/api/message-templates", async (req, res) => {
    try {
      const templates = await storage.getMessageTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message templates" });
    }
  });

  // Board routes
  app.get("/api/users/:id/boards", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const boards = await storage.getUserBoards(userId);
      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch boards" });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const boardData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(boardData);
      res.json(board);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid board data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create board" });
    }
  });

  app.post("/api/boards/:id/listings", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const { listingId } = req.body;
      const boardListing = await storage.addListingToBoard({ boardId, listingId });
      res.json(boardListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to add listing to board" });
    }
  });

  app.delete("/api/boards/:boardId/listings/:listingId", async (req, res) => {
    try {
      const boardId = parseInt(req.params.boardId);
      const listingId = parseInt(req.params.listingId);
      const removed = await storage.removeListingFromBoard(boardId, listingId);
      res.json({ success: removed });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove listing from board" });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      const boardId = parseInt(req.params.id);
      const deleted = await storage.deleteBoard(boardId);
      res.json({ success: deleted });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete board" });
    }
  });

  // Follow routes
  app.get("/api/users/:id/follows", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const follows = await storage.getFollows(userId);
      res.json(follows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch follows" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.post("/api/follow", async (req, res) => {
    try {
      const followData = insertFollowSchema.parse(req.body);
      let follow;
      
      if (followData.followType === "user") {
        follow = await storage.followUser(followData);
      } else if (followData.followType === "category") {
        follow = await storage.followCategory(followData);
      } else if (followData.followType === "zipcode") {
        follow = await storage.followZipCode(followData);
      } else {
        return res.status(400).json({ message: "Invalid follow type" });
      }
      
      res.json(follow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to follow" });
    }
  });

  app.delete("/api/follow", async (req, res) => {
    try {
      const { followerId, followType, followValue, followedId } = req.body;
      const unfollowed = await storage.unfollow(followerId, followType, followValue, followedId);
      res.json({ success: unfollowed });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow" });
    }
  });

  app.get("/api/follow/check", async (req, res) => {
    try {
      const { followerId, followType, followValue, followedId } = req.query;
      const isFollowing = await storage.isFollowing(
        parseInt(followerId as string),
        followType as string,
        followValue as string,
        followedId ? parseInt(followedId as string) : undefined
      );
      res.json({ isFollowing });
    } catch (error) {
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  app.get("/api/users/:id/following-feed", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const feed = await storage.getFollowingFeed(userId);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch following feed" });
    }
  });

  // Alert routes
  app.get("/api/users/:id/alerts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid alert data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const updates = req.body;
      const alert = await storage.updateAlert(alertId, updates);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const deleted = await storage.deleteAlert(alertId);
      res.json({ success: deleted });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  // Report routes
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.reportListing(reportData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit report" });
    }
  });

  // Alert routes
  app.get("/api/alerts/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (!req.session.userId || req.session.userId !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const alert = await storage.updateAlert(alertId, req.body);
      res.json(alert);
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await storage.deleteAlert(alertId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
