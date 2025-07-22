import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";

export default function Messages() {
  const { listingId } = useParams<{ listingId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const id = parseInt(listingId || "0");
  const { data: listing } = useListing(id, user?.id);

  // Mock messages for demonstration
  const mockMessages = [
    {
      id: 1,
      text: "Hi! I'm interested in this listing. Is it still available?",
      isMe: true,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 2,
      text: "Yes, it's still available! Would you like to schedule a viewing?",
      isMe: false,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: 3,
      text: "That would be great! What times work for you this weekend?",
      isMe: true,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // In a real app, this would send the message to the backend
    console.log("Sending message:", message);
    setMessage("");
  };

  if (!listing) {
    return (
      <div className="mobile-container bg-white min-h-screen flex items-center justify-center">
        <p className="text-instagram-light-gray">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(`/listing/${listingId}`)}
          className="text-instagram-gray"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {listing.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-instagram-gray">{listing.user.name}</h3>
          <p className="text-xs text-instagram-light-gray">Active now</p>
        </div>
        <Button variant="ghost" size="icon" className="text-instagram-gray">
          <Phone size={20} />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-2xl px-4 py-2 max-w-xs ${
                msg.isMe
                  ? "bg-instagram-blue text-white"
                  : "bg-gray-100 text-instagram-gray"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-instagram-blue"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="text-instagram-blue"
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
}
