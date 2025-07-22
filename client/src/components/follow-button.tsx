import { UserPlus, UserCheck, Bell, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useFollow, useUnfollow, useIsFollowing } from "@/hooks/use-follows";
import { useToast } from "@/hooks/use-toast";

interface FollowButtonProps {
  type: "user" | "category" | "zipcode";
  targetId?: number;
  targetValue?: string;
  targetName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline";
}

export default function FollowButton({ 
  type, 
  targetId, 
  targetValue, 
  targetName,
  size = "md",
  variant = "outline" 
}: FollowButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: followStatus } = useIsFollowing(
    user?.id || 0,
    type,
    targetValue,
    targetId
  );
  
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();
  
  const isFollowing = followStatus?.isFollowing || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const handleToggleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync({
          followerId: user.id,
          followType: type,
          followValue: targetValue,
          followedId: targetId,
        });
        
        const displayName = targetName || targetValue || `User ${targetId}`;
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${displayName}`,
        });
      } else {
        await followMutation.mutateAsync({
          followerId: user.id,
          followedId: targetId,
          followType: type,
          followValue: targetValue,
        });
        
        const displayName = targetName || targetValue || `User ${targetId}`;
        toast({
          title: "Following",
          description: `You are now following ${displayName}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const getIcon = () => {
    if (type === "user") {
      return isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />;
    } else if (type === "category") {
      return <Tag size={16} />;
    } else {
      return <MapPin size={16} />;
    }
  };

  const getText = () => {
    if (type === "user") {
      return isFollowing ? "Following" : "Follow";
    } else if (type === "category") {
      return isFollowing ? `Following ${targetValue}` : `Follow ${targetValue}`;
    } else {
      return isFollowing ? `Following ${targetValue}` : `Follow ${targetValue}`;
    }
  };

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";

  return (
    <Button
      variant={isFollowing ? "default" : variant}
      size={buttonSize}
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`flex items-center space-x-2 ${
        isFollowing 
          ? "bg-instagram-blue text-white hover:bg-instagram-blue/90" 
          : "bg-transparent text-instagram-blue border-instagram-blue hover:bg-instagram-blue hover:text-white"
      } ${size === "sm" ? "text-xs px-3 py-1" : ""}`}
    >
      {getIcon()}
      <span className={size === "sm" ? "hidden sm:inline" : ""}>
        {isLoading ? "..." : getText()}
      </span>
    </Button>
  );
}