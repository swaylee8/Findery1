import { useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useListings } from "@/hooks/use-listings";
import ListingCard from "@/components/listing-card";
import CategoryFilter from "@/components/category-filter";
import BottomNav from "@/components/bottom-nav";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { user } = useAuth();
  
  const { data: listings, isLoading } = useListings(
    activeCategory === "all" ? undefined : activeCategory,
    user?.id
  );

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="safe-area-top bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-instagram-gray">Scroll & Sold</h1>
          <Search className="text-instagram-light-gray" size={20} />
        </div>
        
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-96 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
            
            {listings?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-instagram-light-gray">
                  No listings found in this category
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav activeTab="feed" />
    </div>
  );
}
