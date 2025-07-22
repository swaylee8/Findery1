import { CheckCircle, Shield } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function VerifiedBadge({ size = "md", showText = false, className = "" }: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <CheckCircle 
        size={iconSize} 
        className="text-instagram-blue fill-instagram-blue/10" 
      />
      {showText && (
        <span className={`font-medium text-instagram-blue ${
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        }`}>
          Verified
        </span>
      )}
    </div>
  );
}