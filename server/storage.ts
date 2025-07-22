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
  type ListingWithUser,
  type BoardWithListings,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Listing operations
  getAllListings(): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  getListingsWithUser(userId?: number): Promise<ListingWithUser[]>;
  getListingsByCategory(category: string, userId?: number): Promise<ListingWithUser[]>;
  getListingsByUserId(userId: number): Promise<Listing[]>;
  getFollowingFeed(userId: number): Promise<ListingWithUser[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, updates: Partial<Listing>): Promise<Listing>;
  reportListing(report: InsertReport): Promise<Report>;
  
  // Board operations
  getUserBoards(userId: number): Promise<BoardWithListings[]>;
  createBoard(board: InsertBoard): Promise<Board>;
  addListingToBoard(boardListing: InsertBoardListing): Promise<BoardListing>;
  removeListingFromBoard(boardId: number, listingId: number): Promise<boolean>;
  deleteBoard(boardId: number): Promise<boolean>;
  
  // Follow operations
  getFollows(userId: number): Promise<Follow[]>;
  getFollowers(userId: number): Promise<Follow[]>;
  followUser(follow: InsertFollow): Promise<Follow>;
  followCategory(follow: InsertFollow): Promise<Follow>;
  followZipCode(follow: InsertFollow): Promise<Follow>;
  unfollow(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean>;
  isFollowing(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean>;
  
  // Alert operations
  getUserAlerts(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: number): Promise<boolean>;
  
  // Like operations
  getLikesByUserId(userId: number): Promise<Like[]>;
  getLikedListings(userId: number): Promise<ListingWithUser[]>;
  toggleLike(like: InsertLike): Promise<boolean>;
  isListingLiked(userId: number, listingId: number): Promise<boolean>;
  getLikesCount(listingId: number): Promise<number>;
  
  // Message operations
  getMessagesByListing(listingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageTemplates(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private likes: Map<number, Like>;
  private messages: Map<number, Message>;
  private boards: Map<number, Board>;
  private boardListings: Map<number, BoardListing>;
  private follows: Map<number, Follow>;
  private alerts: Map<number, Alert>;
  private reports: Map<number, Report>;
  private currentUserId: number;
  private currentListingId: number;
  private currentLikeId: number;
  private currentMessageId: number;
  private currentBoardId: number;
  private currentBoardListingId: number;
  private currentFollowId: number;
  private currentAlertId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.likes = new Map();
    this.messages = new Map();
    this.boards = new Map();
    this.boardListings = new Map();
    this.follows = new Map();
    this.alerts = new Map();
    this.reports = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentLikeId = 1;
    this.currentMessageId = 1;
    this.currentBoardId = 1;
    this.currentBoardListingId = 1;
    this.currentFollowId = 1;
    this.currentAlertId = 1;
    this.currentReportId = 1;
    
    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create demo users with verification status
    const user1: User = {
      id: 1,
      email: "john@example.com",
      password: "password123",
      name: "John Doe",
      profileImage: null,
      isVerified: true,
      createdAt: new Date(),
    };
    
    const user2: User = {
      id: 2,
      email: "sarah@example.com",
      password: "password123",
      name: "Sarah Miller",
      profileImage: null,
      isVerified: true,
      createdAt: new Date(),
    };
    
    const user3: User = {
      id: 3,
      email: "michael@example.com",
      password: "password123",
      name: "Michael Johnson",
      profileImage: null,
      isVerified: false,
      createdAt: new Date(),
    };
    
    this.users.set(1, user1);
    this.users.set(2, user2);
    this.users.set(3, user3);
    this.currentUserId = 4;

    // Create demo listings with enhanced specs
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
      videoUrl: null,
      specs: JSON.stringify({ sqft: 3200, bedrooms: 4, bathrooms: 3, yearBuilt: 2019, oceanfront: true }),
      isReported: false,
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
      videoUrl: null,
      specs: JSON.stringify({ make: "Tesla", model: "Model S", year: 2021, mileage: 15000, condition: "Excellent" }),
      isReported: false,
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
      videoUrl: null,
      specs: JSON.stringify({ length: 65, engineHours: 1200, year: 2018, crew: "Professional", sleeps: 12 }),
      isReported: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    };

    this.listings.set(1, listing1);
    this.listings.set(2, listing2);
    this.listings.set(3, listing3);
    this.currentListingId = 4;

    // Create sample boards
    const board1: Board = {
      id: 1,
      userId: 1,
      name: "Miami Condos",
      description: "Dream beachfront properties",
      isPublic: true,
      createdAt: new Date(),
    };
    
    this.boards.set(1, board1);
    this.currentBoardId = 2;
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
      isVerified: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
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
        user: { ...user, isVerified: user.isVerified },
        isLiked,
        likesCount,
        specs: listing.specs ? JSON.parse(listing.specs) : undefined,
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

  async getFollowingFeed(userId: number): Promise<ListingWithUser[]> {
    const userFollows = Array.from(this.follows.values()).filter(f => f.followerId === userId);
    const allListings = await this.getListingsWithUser(userId);
    
    return allListings.filter(listing => {
      // Include listings from followed users
      if (userFollows.some(f => f.followType === "user" && f.followedId === listing.userId)) {
        return true;
      }
      // Include listings from followed categories
      if (userFollows.some(f => f.followType === "category" && f.followValue === listing.category)) {
        return true;
      }
      // Include listings from followed zip codes
      if (userFollows.some(f => f.followType === "zipcode" && f.followValue === listing.zipCode)) {
        return true;
      }
      return false;
    });
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = {
      ...insertListing,
      id,
      videoUrl: insertListing.videoUrl || null,
      specs: insertListing.specs || null,
      isReported: false,
      createdAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing> {
    const listing = this.listings.get(id);
    if (!listing) throw new Error("Listing not found");
    
    const updatedListing = { ...listing, ...updates };
    this.listings.set(id, updatedListing);
    return updatedListing;
  }

  async reportListing(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const newReport: Report = {
      ...report,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.reports.set(id, newReport);
    
    // Mark listing as reported
    if (report.listingId) {
      await this.updateListing(report.listingId, { isReported: true });
    }
    
    return newReport;
  }

  // Board operations
  async getUserBoards(userId: number): Promise<BoardWithListings[]> {
    const userBoards = Array.from(this.boards.values()).filter(board => board.userId === userId);
    const result: BoardWithListings[] = [];

    for (const board of userBoards) {
      const boardListings = Array.from(this.boardListings.values())
        .filter(bl => bl.boardId === board.id);
      
      const listings: ListingWithUser[] = [];
      for (const bl of boardListings) {
        const listing = await this.getListingById(bl.listingId);
        if (listing) {
          const user = await this.getUser(listing.userId);
          if (user) {
            const isLiked = await this.isListingLiked(userId, listing.id);
            const likesCount = await this.getLikesCount(listing.id);
            listings.push({
              ...listing,
              user,
              isLiked,
              likesCount,
              specs: listing.specs ? JSON.parse(listing.specs) : undefined,
            });
          }
        }
      }

      result.push({
        ...board,
        listings,
        listingCount: listings.length,
      });
    }

    return result;
  }

  async createBoard(board: InsertBoard): Promise<Board> {
    const id = this.currentBoardId++;
    const newBoard: Board = {
      ...board,
      id,
      createdAt: new Date(),
    };
    this.boards.set(id, newBoard);
    return newBoard;
  }

  async addListingToBoard(boardListing: InsertBoardListing): Promise<BoardListing> {
    // Check if listing is already in board
    const existing = Array.from(this.boardListings.values())
      .find(bl => bl.boardId === boardListing.boardId && bl.listingId === boardListing.listingId);
    
    if (existing) {
      return existing;
    }

    const id = this.currentBoardListingId++;
    const newBoardListing: BoardListing = {
      ...boardListing,
      id,
      createdAt: new Date(),
    };
    this.boardListings.set(id, newBoardListing);
    return newBoardListing;
  }

  async removeListingFromBoard(boardId: number, listingId: number): Promise<boolean> {
    const toRemove = Array.from(this.boardListings.entries())
      .find(([_, bl]) => bl.boardId === boardId && bl.listingId === listingId);
    
    if (toRemove) {
      this.boardListings.delete(toRemove[0]);
      return true;
    }
    return false;
  }

  async deleteBoard(boardId: number): Promise<boolean> {
    // Remove all board listings first
    const toRemove = Array.from(this.boardListings.entries())
      .filter(([_, bl]) => bl.boardId === boardId);
    
    toRemove.forEach(([id]) => this.boardListings.delete(id));
    
    // Remove board
    return this.boards.delete(boardId);
  }

  // Follow operations
  async getFollows(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(f => f.followerId === userId);
  }

  async getFollowers(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(f => f.followedId === userId);
  }

  async followUser(follow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const newFollow: Follow = {
      ...follow,
      id,
      createdAt: new Date(),
    };
    this.follows.set(id, newFollow);
    return newFollow;
  }

  async followCategory(follow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const newFollow: Follow = {
      ...follow,
      id,
      followType: "category",
      createdAt: new Date(),
    };
    this.follows.set(id, newFollow);
    return newFollow;
  }

  async followZipCode(follow: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const newFollow: Follow = {
      ...follow,
      id,
      followType: "zipcode",
      createdAt: new Date(),
    };
    this.follows.set(id, newFollow);
    return newFollow;
  }

  async unfollow(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean> {
    const toRemove = Array.from(this.follows.entries())
      .find(([_, f]) => {
        if (f.followerId !== followerId || f.followType !== followType) return false;
        if (followType === "user" && f.followedId === followedId) return true;
        if ((followType === "category" || followType === "zipcode") && f.followValue === followValue) return true;
        return false;
      });
    
    if (toRemove) {
      this.follows.delete(toRemove[0]);
      return true;
    }
    return false;
  }

  async isFollowing(followerId: number, followType: string, followValue?: string, followedId?: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(f => {
      if (f.followerId !== followerId || f.followType !== followType) return false;
      if (followType === "user" && f.followedId === followedId) return true;
      if ((followType === "category" || followType === "zipcode") && f.followValue === followValue) return true;
      return false;
    });
  }

  // Alert operations
  async getUserAlerts(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(a => a.userId === userId);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const newAlert: Alert = {
      ...alert,
      id,
      isActive: true,
      createdAt: new Date(),
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error("Alert not found");
    
    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
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
      isTemplate: insertMessage.isTemplate || false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
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

export const storage = new MemStorage();

// Initialize with sample data including P1 features
storage.users.set(1, {
  id: 1,
  email: "john@example.com",
  name: "John Smith",
  password: "password123",
  isVerified: true,
});

storage.users.set(2, {
  id: 2,
  email: "sarah@example.com",
  name: "Sarah Johnson",
  password: "password123",
  isVerified: false,
});

storage.users.set(3, {
  id: 3,
  email: "mike@example.com",
  name: "Mike Wilson",
  password: "password123",
  isVerified: true,
});

storage.listings.set(1, {
  id: 1,
  userId: 1,
  title: "Modern Beach House",
  description: "Stunning oceanfront property with panoramic views. This contemporary home features an open floor plan, high-end finishes, and floor-to-ceiling windows.",
  price: 850000,
  category: "homes",
  location: "Malibu, CA",
  images: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"],
  specs: JSON.stringify({
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    yearBuilt: 2019,
    propertyType: "House"
  }),
  createdAt: new Date("2024-01-22T10:00:00Z"),
});

storage.listings.set(2, {
  id: 2,
  userId: 2,
  title: "Tesla Model S",
  description: "Excellent condition Tesla Model S with autopilot. Low mileage, well maintained, and includes all original accessories.",
  price: 65000,
  category: "cars",
  location: "San Francisco, CA",
  images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800"],
  specs: JSON.stringify({
    year: 2022,
    mileage: 15000,
    transmission: "automatic",
    fuelType: "electric",
    engine: "Dual Motor"
  }),
  createdAt: new Date("2024-01-22T08:30:00Z"),
});

storage.listings.set(3, {
  id: 3,
  userId: 3,
  title: "Luxury Yacht",
  description: "Beautiful 45-foot yacht perfect for entertaining. Fully equipped with modern amenities and navigation systems.",
  price: 320000,
  category: "boats",
  location: "Newport Beach, CA",
  images: ["https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800"],
  specs: JSON.stringify({
    year: 2020,
    length: 45,
    boatType: "Motor Yacht",
    engine: "Twin Diesel",
    fuel: "Diesel"
  }),
  createdAt: new Date("2024-01-22T12:15:00Z"),
});
