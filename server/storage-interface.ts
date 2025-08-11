import {
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
  getConversations(): Promise<any[]>;
  getMessagesByListing(listingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessageTemplates(): Promise<string[]>;
}