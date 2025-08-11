import { useState } from "react";
import { useLocation } from "wouter";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";


const categories = [
  { id: "homes", label: "🏠 Home" },
  { id: "cars", label: "🚗 Car" },
  { id: "boats", label: "🚤 Boat" },
];

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createListingMutation = useCreateListing();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("homes");
  const [location, setListingLocation] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = () => {
    // Mock image upload - in a real app this would use a file picker
    const mockImages = [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    ];
    
    if (images.length < 5) {
      const newImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      setImages([...images, newImage]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one photo",
        variant: "destructive",
      });
      return;
    }

    const listingData = {
      userId: user.id,
      title,
      description,
      price: parseInt(price),
      category,
      location,
      zipCode,
      images,
    };

    createListingMutation.mutate(listingData, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Your listing has been created",
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create listing",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="text-instagram-gray"
        >
          Cancel
        </Button>
        <h2 className="font-semibold text-instagram-gray">New Listing</h2>
        <Button
          onClick={handleSubmit}
          disabled={createListingMutation.isPending}
          className="text-instagram-blue font-semibold bg-transparent hover:bg-transparent"
        >
          {createListingMutation.isPending ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* Image Upload */}
        <div>
          <label className="block text-instagram-gray font-medium mb-2">
            Photos (up to 5)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer ${
                  images[index]
                    ? "bg-gray-200"
                    : "bg-gray-100 border-2 border-dashed border-gray-300"
                }`}
                onClick={!images[index] ? handleImageUpload : undefined}
              >
                {images[index] ? (
                  <img
                    src={images[index]}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="text-gray-400" size={24} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-instagram-gray font-medium mb-2">Category</label>
          <div className="flex space-x-3">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                type="button"
                variant={category === cat.id ? "default" : "outline"}
                onClick={() => setCategory(cat.id)}
                className={
                  category === cat.id
                    ? "bg-instagram-blue text-white hover:bg-instagram-blue/90"
                    : "bg-gray-100 text-instagram-gray hover:bg-gray-200"
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-instagram-gray font-medium mb-2">Title</label>
          <Input
            type="text"
            placeholder="What are you selling?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
          />
        </div>

        <div>
          <label className="block text-instagram-gray font-medium mb-2">Price</label>
          <Input
            type="number"
            placeholder="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
          />
        </div>

        <div>
          <label className="block text-instagram-gray font-medium mb-2">Description</label>
          <Textarea
            placeholder="Tell people about your listing..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue resize-none"
          />
        </div>

        <div>
          <label className="block text-instagram-gray font-medium mb-2">Location</label>
          <Input
            type="text"
            placeholder="City, State"
            value={location}
            onChange={(e) => setListingLocation(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
          />
        </div>

        <div>
          <label className="block text-instagram-gray font-medium mb-2">ZIP Code</label>
          <Input
            type="text"
            placeholder="90210"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-instagram-blue"
          />
        </div>
      </div>

    </div>
  );
}
