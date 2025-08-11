import { Home, Plus, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="safe-area-bottom bg-white border-t border-gray-200 px-4">
      <div className="flex items-center justify-between px-8 py-2">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className={`flex flex-col items-center py-2 px-3 ${
            location === "/" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <Home className="mb-1" size={20} />
          <span className="text-xs font-medium">Feed</span>
        </Button>

        {/* Add Listing button moved to Profile section */}

        <Button
          variant="ghost"
          onClick={() => setLocation("/alerts")}
          className={`flex flex-col items-center py-2 px-3 ${
            location === "/alerts" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <Bell className="mb-1" size={20} />
          <span className="text-xs font-medium">Alerts</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setLocation("/profile")}
          className={`flex flex-col items-center py-2 px-3 ${
            location === "/profile" ? "text-instagram-blue" : "text-instagram-light-gray"
          }`}
        >
          <User className="mb-1" size={20} />
          <span className="text-xs font-medium">Profile</span>
        </Button>
      </div>
    </div>
  );
}
