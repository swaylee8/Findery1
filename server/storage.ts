import {
  users,
  listings,
  likes,
  messages,
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Like,
  type InsertLike,
  type Message,
  type InsertMessage,
  type ListingWithUser,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Listing operations
  getAllListings(): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  getListingsWithUser(userId?: number): Promise<ListingWithUser[]>;
  getListingsByCategory(category: string, userId?: number): Promise<ListingWithUser[]>;
  getListingsByUserId(userId: number): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  
  // Like operations
  getLikesByUserId(userId: number): Promise<Like[]>;
  getLikedListings(userId: number): Promise<ListingWithUser[]>;
  toggleLike(like: InsertLike): Promise<boolean>;
  isListingLiked(userId: number, listingId: number): Promise<boolean>;
  getLikesCount(listingId: number): Promise<number>;
  
  // Message operations
  getMessagesByListing(listingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private likes: Map<number, Like>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentListingId: number;
  private currentLikeId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.likes = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentLikeId = 1;
    this.currentMessageId = 1;
    
    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create demo users
    const user1: User = {
      id: 1,
      email: "john@example.com",
      password: "password123",
      name: "John Doe",
      profileImage: null,
      createdAt: new Date(),
    };
    
    const user2: User = {
      id: 2,
      email: "sarah@example.com",
      password: "password123",
      name: "Sarah Miller",
      profileImage: null,
      createdAt: new Date(),
    };
    
    const user3: User = {
      id: 3,
      email: "michael@example.com",
      password: "password123",
      name: "Michael Johnson",
      profileImage: null,
      createdAt: new Date(),
    };
    
    this.users.set(1, user1);
    this.users.set(2, user2);
    this.users.set(3, user3);
    this.currentUserId = 4;

    // Create demo listings
    const listing1: Listing = {
      id: 1,
      userId: 1,
      title: "Modern Beach House",
      description: "Stunning oceanfront property with breathtaking panoramic views of the Pacific Ocean. Features floor-to-ceiling windows, infinity pool, and private beach access. 4 spacious bedrooms, 3 full bathrooms, gourmet kitchen.",
      price: 2850000,
      category: "homes",
      location: "Malibu, CA",
      zipCode: "90265",
      images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
      ],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };

    const listing2: Listing = {
      id: 2,
      userId: 2,
      title: "2021 Tesla Model S",
      description: "Fully loaded Tesla Model S with autopilot, only 15k miles, pristine condition. Premium interior, enhanced autopilot, supercharging enabled.",
      price: 67500,
      category: "cars",
      location: "San Francisco, CA",
      zipCode: "94102",
      images: [
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    };

    const listing3: Listing = {
      id: 3,
      userId: 3,
      title: "65ft Luxury Yacht",
      description: "Pristine condition luxury yacht, fully equipped for deep sea adventures. Professional crew available, state-of-the-art navigation system, spacious living areas.",
      price: 1250000,
      category: "boats",
      location: "Miami, FL",
      zipCode: "33101",
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
      ],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    };

    this.listings.set(1, listing1);
    this.listings.set(2, listing2);
    this.listings.set(3, listing3);
    this.currentListingId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllListings(): Promise<Listing[]> {
    return Array.from(this.listings.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListingsWithUser(userId?: number): Promise<ListingWithUser[]> {
    const allListings = await this.getAllListings();
    const result: ListingWithUser[] = [];

    for (const listing of allListings) {
      const user = await this.getUser(listing.userId);
      if (!user) continue;

      const isLiked = userId ? await this.isListingLiked(userId, listing.id) : false;
      const likesCount = await this.getLikesCount(listing.id);

      result.push({
        ...listing,
        user,
        isLiked,
        likesCount,
      });
    }

    return result;
  }

  async getListingsByCategory(category: string, userId?: number): Promise<ListingWithUser[]> {
    const allListings = await this.getListingsWithUser(userId);
    return allListings.filter(listing => listing.category === category);
  }

  async getListingsByUserId(userId: number): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter(listing => listing.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = {
      ...insertListing,
      id,
      createdAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async getLikesByUserId(userId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.userId === userId);
  }

  async getLikedListings(userId: number): Promise<ListingWithUser[]> {
    const userLikes = await this.getLikesByUserId(userId);
    const likedListingIds = userLikes.map(like => like.listingId);
    
    const result: ListingWithUser[] = [];
    for (const listingId of likedListingIds) {
      const listing = await this.getListingById(listingId);
      if (!listing) continue;
      
      const user = await this.getUser(listing.userId);
      if (!user) continue;

      const likesCount = await this.getLikesCount(listing.id);

      result.push({
        ...listing,
        user,
        isLiked: true,
        likesCount,
      });
    }

    return result.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async toggleLike(insertLike: InsertLike): Promise<boolean> {
    // Check if like already exists
    const existingLike = Array.from(this.likes.values()).find(
      like => like.userId === insertLike.userId && like.listingId === insertLike.listingId
    );

    if (existingLike) {
      // Unlike - remove the like
      this.likes.delete(existingLike.id);
      return false;
    } else {
      // Like - add the like
      const id = this.currentLikeId++;
      const like: Like = {
        ...insertLike,
        id,
        createdAt: new Date(),
      };
      this.likes.set(id, like);
      return true;
    }
  }

  async isListingLiked(userId: number, listingId: number): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      like => like.userId === userId && like.listingId === listingId
    );
  }

  async getLikesCount(listingId: number): Promise<number> {
    return Array.from(this.likes.values()).filter(like => like.listingId === listingId).length;
  }

  async getMessagesByListing(listingId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.listingId === listingId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
