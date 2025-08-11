import {
  users,
  listings,
  likes,
  messages,
  boards,
  boardListings,
  follows,
  alerts,
  reports,
  comments,
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Like,
  type InsertLike,
  type Message,
  type InsertMessage,
  type Board,
  type InsertBoard,
  type BoardListing,
  type InsertBoardListing,
  type Follow,
  type InsertFollow,
  type Alert,
  type InsertAlert,
  type Report,
  type InsertReport,
  type Comment,
  type InsertComment,
  type ListingWithUser,
  type BoardWithListings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray, sql, like, lte, count, or } from "drizzle-orm";
import { IStorage } from "./storage-interface";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Listing operations
  async getAllListings(): Promise<Listing[]> {
    return await db.select().from(listings).orderBy(desc(listings.createdAt));
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getListingsWithUser(userId?: number): Promise<ListingWithUser[]> {
    const listingsWithUsers = await db
      .select({
        listing: listings,
        user: users,
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .orderBy(desc(listings.createdAt));

    const result: ListingWithUser[] = [];
    
    for (const { listing, user } of listingsWithUsers) {
      const isLiked = userId ? await this.isListingLiked(userId, listing.id) : false;
      const likesCount = await this.getLikesCount(listing.id);
      
      result.push({
        ...listing,
        user: { ...user, isVerified: user.isVerified },
        isLiked,
        likesCount,
        specs: listing.specs ? JSON.parse(listing.specs) : undefined,
      });
    }

    return result;
  }

  async getListingsByCategory(category: string, userId?: number): Promise<ListingWithUser[]> {
    const listingsWithUsers = await db
      .select({
        listing: listings,
        user: users,
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(listings.category, category))
      .orderBy(desc(listings.createdAt));

    const result: ListingWithUser[] = [];
    
    for (const { listing, user } of listingsWithUsers) {
      const isLiked = userId ? await this.isListingLiked(userId, listing.id) : false;
      const likesCount = await this.getLikesCount(listing.id);
      
      result.push({
        ...listing,
        user: { ...user, isVerified: user.isVerified },
        isLiked,
        likesCount,
        specs: listing.specs ? JSON.parse(listing.specs) : undefined,
      });
    }

    return result;
  }

  async getListingsByUserId(userId: number): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt));
  }

  async getFollowingFeed(userId: number): Promise<ListingWithUser[]> {
    // Get user follows
    const userFollows = await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId));

    if (userFollows.length === 0) {
      return [];
    }

    // Get listings from followed users, categories, and locations
    const userIds = userFollows
      .filter(f => f.followType === "user" && f.followedId)
      .map(f => f.followedId!);
    
    const categories = userFollows
      .filter(f => f.followType === "category")
      .map(f => f.followValue!);
    
    const locations = userFollows
      .filter(f => f.followType === "zipcode")
      .map(f => f.followValue!);

    const conditions = [];
    
    if (userIds.length > 0) {
      conditions.push(inArray(listings.userId, userIds));
    }
    
    if (categories.length > 0) {
      conditions.push(inArray(listings.category, categories));
    }
    
    if (locations.length > 0) {
      conditions.push(
        or(...locations.map(loc => like(listings.location, `%${loc}%`)))
      );
    }

    if (conditions.length === 0) {
      return [];
    }

    const listingsWithUsers = await db
      .select({
        listing: listings,
        user: users,
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .where(or(...conditions))
      .orderBy(desc(listings.createdAt));

    const result: ListingWithUser[] = [];
    
    for (const { listing, user } of listingsWithUsers) {
      const isLiked = await this.isListingLiked(userId, listing.id);
      const likesCount = await this.getLikesCount(listing.id);
      
      result.push({
        ...listing,
        user: { ...user, isVerified: user.isVerified },
        isLiked,
        likesCount,
        specs: listing.specs ? JSON.parse(listing.specs) : undefined,
      });
    }

    return result;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db.insert(listings).values(insertListing).returning();
    return listing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async reportListing(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  // Board operations
  async getUserBoards(userId: number): Promise<BoardWithListings[]> {
    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId))
      .orderBy(desc(boards.createdAt));

    const result: BoardWithListings[] = [];
    
    for (const board of userBoards) {
      const boardListingsData = await db
        .select({
          boardListing: boardListings,
          listing: listings,
        })
        .from(boardListings)
        .innerJoin(listings, eq(boardListings.listingId, listings.id))
        .where(eq(boardListings.boardId, board.id));

      result.push({
        ...board,
        listings: boardListingsData.map(({ listing }) => listing),
        listingCount: boardListingsData.length,
      });
    }

    return result;
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const [board] = await db.insert(boards).values(insertBoard).returning();
    return board;
  }

  async addListingToBoard(insertBoardListing: InsertBoardListing): Promise<BoardListing> {
    const [boardListing] = await db
      .insert(boardListings)
      .values(insertBoardListing)
      .returning();
    return boardListing;
  }

  async removeListingFromBoard(boardId: number, listingId: number): Promise<boolean> {
    const result = await db
      .delete(boardListings)
      .where(and(
        eq(boardListings.boardId, boardId),
        eq(boardListings.listingId, listingId)
      ));
    return result.rowCount! > 0;
  }

  async deleteBoard(boardId: number): Promise<boolean> {
    // First delete all board listings
    await db.delete(boardListings).where(eq(boardListings.boardId, boardId));
    
    // Then delete the board
    const result = await db.delete(boards).where(eq(boards.id, boardId));
    return result.rowCount! > 0;
  }

  // Follow operations
  async getFollows(userId: number): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId))
      .orderBy(desc(follows.createdAt));
  }

  async getFollowers(userId: number): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followType, "user"),
        eq(follows.followedId, userId)
      ))
      .orderBy(desc(follows.createdAt));
  }

  async followUser(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();
    return follow;
  }

  async followCategory(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();
    return follow;
  }

  async followZipCode(insertFollow: InsertFollow): Promise<Follow> {
    const [follow] = await db.insert(follows).values(insertFollow).returning();
    return follow;
  }

  async unfollow(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean> {
    const conditions = [eq(follows.followerId, followerId), eq(follows.followType, followType)];
    
    if (followValue) {
      conditions.push(eq(follows.followValue, followValue));
    }
    
    if (followedId) {
      conditions.push(eq(follows.followedId, followedId));
    }

    const result = await db.delete(follows).where(and(...conditions));
    return result.rowCount! > 0;
  }

  async isFollowing(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean> {
    const conditions = [eq(follows.followerId, followerId), eq(follows.followType, followType)];
    
    if (followValue) {
      conditions.push(eq(follows.followValue, followValue));
    }
    
    if (followedId) {
      conditions.push(eq(follows.followedId, followedId));
    }

    const [follow] = await db.select().from(follows).where(and(...conditions));
    return !!follow;
  }

  // Alert operations
  async getUserAlerts(userId: number): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, userId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert> {
    const [alert] = await db
      .update(alerts)
      .set(updates)
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id));
    return result.rowCount! > 0;
  }

  // Like operations
  async getLikesByUserId(userId: number): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.userId, userId))
      .orderBy(desc(likes.createdAt));
  }

  async getLikedListings(userId: number): Promise<ListingWithUser[]> {
    const userLikes = await db
      .select({
        like: likes,
        listing: listings,
        user: users,
      })
      .from(likes)
      .innerJoin(listings, eq(likes.listingId, listings.id))
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(likes.userId, userId))
      .orderBy(desc(likes.createdAt));

    const result: ListingWithUser[] = [];
    
    for (const { listing, user } of userLikes) {
      const likesCount = await this.getLikesCount(listing.id);
      
      result.push({
        ...listing,
        user: { ...user, isVerified: user.isVerified },
        isLiked: true,
        likesCount,
        specs: listing.specs ? JSON.parse(listing.specs) : undefined,
      });
    }

    return result;
  }

  async toggleLike(insertLike: InsertLike): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, insertLike.userId),
        eq(likes.listingId, insertLike.listingId)
      ));

    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      return false; // Unliked
    } else {
      await db.insert(likes).values(insertLike);
      return true; // Liked
    }
  }

  async isListingLiked(userId: number, listingId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.listingId, listingId)));
    return !!like;
  }

  async getLikesCount(listingId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.listingId, listingId));
    return result.count;
  }

  // Message operations
  async getMessagesByListing(listingId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.listingId, listingId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getConversations(): Promise<any[]> {
    // Return mock conversations with preview data
    return [
      {
        id: 1,
        listingId: 1,
        listingTitle: "2024 Tesla Model S",
        listingImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800",
        lastMessage: "Thanks for your interest! When would you like to schedule a viewing?",
        lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
        otherUserName: "Sarah Johnson",
        otherUserAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150",
        isOnline: true,
        unreadCount: 2
      },
      {
        id: 2,
        listingId: 2,
        listingTitle: "Beautiful Modern House",
        listingImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        lastMessage: "The price is negotiable. What's your budget?",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        otherUserName: "Mike Chen",
        otherUserAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        isOnline: false,
        unreadCount: 0
      }
    ];
  }

  async getMessageTemplates(): Promise<string[]> {
    return [
      "Hi! Is this still available?",
      "What's the condition like?",
      "I'm very interested. When can we meet?",
      "Is the price negotiable?",
      "Can you tell me more about this?",
      "Do you have more photos?",
    ];
  }
}