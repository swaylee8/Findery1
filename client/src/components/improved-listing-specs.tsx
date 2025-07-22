import { Badge } from "@/components/ui/badge";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImprovedListingSpecsProps {
  category: string;
  specs?: any;
  isOwner?: boolean;
  onEdit?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function ImprovedListingSpecs({ 
  category, 
  specs, 
  isOwner = false, 
  onEdit,
  size = "sm" 
}: ImprovedListingSpecsProps) {
  if (!specs) return null;

  const getRelevantSpecs = () => {
    switch (category) {
      case "homes":
        return [
          { key: "bedrooms", label: "bed", value: specs.bedrooms, suffix: specs.bedrooms === 1 ? " bed" : " beds" },
          { key: "bathrooms", label: "bath", value: specs.bathrooms, suffix: specs.bathrooms === 1 ? " bath" : " baths" },
          { key: "sqft", label: "sqft", value: specs.sqft, suffix: " sqft" },
        ].filter(spec => spec.value);
        
      case "cars":
        return [
          { key: "year", label: "year", value: specs.year, suffix: "" },
          { key: "mileage", label: "miles", value: specs.mileage, suffix: " mi" },
          { key: "fuelType", label: "fuel", value: specs.fuelType, suffix: "" },
        ].filter(spec => spec.value);
        
      case "boats":
        return [
          { key: "length", label: "length", value: specs.length, suffix: " ft" },
          { key: "year", label: "year", value: specs.year, suffix: "" },
          { key: "engine", label: "engine", value: specs.engine, suffix: "" },
        ].filter(spec => spec.value);
        
      default:
        return [];
    }
  };

  const relevantSpecs = getRelevantSpecs();

  if (relevantSpecs.length === 0) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-1.5">
        {relevantSpecs.slice(0, 3).map((spec) => (
          <Badge
            key={spec.key}
            variant="secondary"
            className={`${sizeClasses[size]} bg-black/10 text-black font-medium`}
          >
            {typeof spec.value === "number" && spec.value > 999 
              ? `${(spec.value / 1000).toFixed(spec.value % 1000 === 0 ? 0 : 1)}k${spec.suffix.replace(/ \w+/, spec.suffix.split(' ')[1] ? ` ${spec.suffix.split(' ')[1]}` : '')}`
              : `${spec.value}${spec.suffix}`
            }
          </Badge>
        ))}
      </div>
      
      {isOwner && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-6 w-6 opacity-70 hover:opacity-100"
        >
          <Edit2 size={12} />
        </Button>
      )}
    </div>
  );
}