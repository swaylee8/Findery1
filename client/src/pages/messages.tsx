import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Phone, Send, MoreHorizontal, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useListing } from "@/hooks/use-listings";
import { useAuth } from "@/hooks/use-auth";
import { useHaptics } from "@/hooks/use-haptics";
import { useSound } from "@/hooks/use-sound";

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export default function Messages() {
  const { listingId } = useParams<{ listingId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { triggerHaptic } = useHaptics();
  const { playSound } = useSound();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm interested in this listing. Is it still available?",
      isMe: true,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: 'read'
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
      status: 'read'
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const id = parseInt(listingId || "0");
  const { data: listing } = useListing(id, user?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage.trim(),
      isMe: true,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
    triggerHaptic('light');
    playSound('pop');
    
    // Simulate typing indicator and response
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Thanks for your message! I'll get back to you soon.",
        isMe: false,
        timestamp: new Date(),
      }]);
      triggerHaptic('light');
      playSound('notification');
    }, 3000);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!listing) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white font-light">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">
      {/* Header with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center space-x-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(`/listing/${listingId}`)}
          className="text-white/80 hover:text-white hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft size={24} />
        </Button>

        {/* User Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-gray-700/50 flex items-center justify-center">
            <span className="text-white font-light text-sm">
              {listing.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          {/* Online status dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500/90 rounded-full border-2 border-black" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-light text-white text-lg tracking-wide">{listing.user.name}</h3>
            {listing.user.isVerified && (
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
            )}
          </div>
          <p className="text-xs text-green-400 font-light">Active now</p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
            data-testid="button-call"
          >
            <Phone size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
            data-testid="button-more"
          >
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </motion.div>

      {/* Listing Preview - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mt-4 bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 flex items-center space-x-4"
      >
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h4 className="text-white font-light text-sm truncate">{listing.title}</h4>
          <p className="text-gray-400 font-light text-xs">${listing.price.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex mb-4 ${message.isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-3 rounded-2xl backdrop-blur-sm border ${
                    message.isMe
                      ? "bg-blue-500/20 border-blue-500/30 text-blue-100"
                      : "bg-gray-800/40 border-gray-700/50 text-gray-200"
                  }`}
                >
                  <p className="font-light leading-relaxed">{message.text}</p>
                </div>
                <div className={`flex items-center mt-1 space-x-2 ${message.isMe ? "justify-end" : "justify-start"}`}>
                  <span className="text-xs text-gray-500 font-light">{formatTime(message.timestamp)}</span>
                  {message.isMe && message.status && (
                    <span className={`text-xs font-light ${
                      message.status === 'read' ? 'text-blue-400' : 
                      message.status === 'delivered' ? 'text-gray-400' : 
                      'text-gray-500'
                    }`}>
                      {message.status === 'read' ? 'Read' : message.status === 'delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-gray-400 font-light">typing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-black/80 backdrop-blur-xl border-t border-gray-800/50"
      >
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="bg-gray-800/40 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 font-light rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              data-testid="input-message"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10 w-8 h-8"
              data-testid="button-emoji"
            >
              <Smile size={16} />
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 disabled:bg-gray-800/40 disabled:border-gray-700/50 disabled:text-gray-500 rounded-2xl w-12 h-12 p-0"
            data-testid="button-send"
          >
            <Send size={18} />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewMessage("Is this still available?")}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl px-3 py-2 text-xs font-light"
            data-testid="quick-available"
          >
            Is this available?
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewMessage("Can we schedule a viewing?")}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl px-3 py-2 text-xs font-light"
            data-testid="quick-viewing"
          >
            Schedule viewing
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewMessage("What's your best price?")}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl px-3 py-2 text-xs font-light"
            data-testid="quick-price"
          >
            Best price?
          </Button>
        </div>
      </motion.div>
    </div>
  );
}