import { useParams, useLocation } from "wouter";
import { ArrowLeft, Share, MapPin, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListing, useToggleLike } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import PhotoCarousel from "@/components/photo-carousel";
import { useToast } from "@/hooks/use-toast";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const listingId = parseInt(id || "0");
  const { data: listing, isLoading } = useListing(listingId, user?.id);
  const toggleLikeMutation = useToggleLike();

  const handleToggleLike = () => {
    if (!user) return;
    
    toggleLikeMutation.mutate(
      { userId: user.id, listingId },
      {
        onSuccess: () => {
          toast({
            title: listing?.isLiked ? "Removed from likes" : "Added to likes",
            description: listing?.isLiked ? "You unliked this listing" : "You liked this listing",
          });
        },
      }
    );
  };

  const handleMessageSeller = () => {
    setLocation(`/messages/${listingId}`);
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-white min-h-screen flex items-center justify-center">
        <p className="text-instagram-light-gray">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mobile-container bg-white min-h-screen flex items-center justify-center">
        <p className="text-instagram-light-gray">Listing not found</p>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="text-instagram-gray"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-semibold text-instagram-gray">Listing Details</h2>
        <Button variant="ghost" size="icon" className="text-instagram-gray">
          <Share size={20} />
        </Button>
      </div>

      {/* Photo Carousel */}
      <PhotoCarousel images={listing.images} />

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Title and Price */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-instagram-gray">{listing.title}</h3>
            <p className="text-success-green text-2xl font-bold">
              ${listing.price.toLocaleString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleLike}
            disabled={toggleLikeMutation.isPending}
            className="heart-animation"
          >
            <Heart
              size={28}
              className={listing.isLiked ? "text-instagram-red fill-instagram-red" : "text-instagram-gray"}
            />
          </Button>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2">
          <MapPin className="text-instagram-light-gray" size={16} />
          <span className="text-instagram-light-gray">{listing.location}</span>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold text-instagram-gray mb-2">Description</h4>
          <p className="text-instagram-gray leading-relaxed">{listing.description}</p>
        </div>

        {/* Seller Info */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {listing.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-instagram-gray">{listing.user.name}</p>
            <p className="text-instagram-light-gray text-sm">
              Typically responds within an hour
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="text-yellow-400" size={16} fill="currentColor" />
            <span className="text-instagram-gray text-sm font-medium">4.9</span>
          </div>
        </div>

        {/* Message Button */}
        <Button
          onClick={handleMessageSeller}
          className="w-full bg-instagram-blue text-white py-3 rounded-lg font-semibold hover:bg-instagram-blue/90"
        >
          Message Seller
        </Button>
      </div>
    </div>
  );
}
