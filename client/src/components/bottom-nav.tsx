import { Home, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface BottomNavProps {
  activeTab: "feed" | "add" | "profile";
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="safe-area-bottom bg-white border-t border-gray-200 px-4">
      <div className="flex items-center justify-around py-2">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className={`flex flex-col items-center py-2 px-4 ${
            activeTab === "feed" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <Home className="mb-1" size={20} />
          <span className="text-xs font-medium">Feed</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setLocation("/add-listing")}
          className={`flex flex-col items-center py-2 px-4 ${
            activeTab === "add" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <Plus className="mb-1" size={20} />
          <span className="text-xs font-medium">New Post</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setLocation("/profile")}
          className={`flex flex-col items-center py-2 px-4 ${
            activeTab === "profile" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <User className="mb-1" size={20} />
          <span className="text-xs font-medium">Profile</span>
        </Button>
      </div>
    </div>
  );
}
