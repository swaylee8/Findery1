import { Home, Car, Anchor, Calendar, MapPin, Ruler, Fuel, Settings } from "lucide-react";

interface ListingSpecsProps {
  specs: Record<string, any>;
  category: string;
  size?: "sm" | "md";
  maxDisplay?: number;
}

export default function ListingSpecs({ specs, category, size = "md", maxDisplay = 4 }: ListingSpecsProps) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const getSpecIcon = (key: string, category: string) => {
    const iconSize = size === "sm" ? 12 : 14;
    
    // Category-specific icons
    if (category === "homes") {
      switch (key) {
        case "bedrooms": return <Home size={iconSize} />;
        case "bathrooms": return <Home size={iconSize} />;
        case "sqft": return <Ruler size={iconSize} />;
        case "yearBuilt": return <Calendar size={iconSize} />;
        case "propertyType": return <Home size={iconSize} />;
        default: return null;
      }
    } else if (category === "cars") {
      switch (key) {
        case "year": return <Calendar size={iconSize} />;
        case "mileage": return <Ruler size={iconSize} />;
        case "transmission": return <Settings size={iconSize} />;
        case "fuelType": return <Fuel size={iconSize} />;
        case "engine": return <Settings size={iconSize} />;
        default: return null;
      }
    } else if (category === "boats") {
      switch (key) {
        case "year": return <Calendar size={iconSize} />;
        case "length": return <Ruler size={iconSize} />;
        case "boatType": return <Anchor size={iconSize} />;
        case "engine": return <Settings size={iconSize} />;
        case "fuel": return <Fuel size={iconSize} />;
        default: return null;
      }
    }
    
    return null;
  };

  const formatSpecValue = (key: string, value: any) => {
    if (typeof value !== "string" && typeof value !== "number") return null;
    
    switch (key) {
      case "bedrooms":
        return `${value} bed${value !== "1" && value !== 1 ? "s" : ""}`;
      case "bathrooms":
        return `${value} bath${value !== "1" && value !== 1 ? "s" : ""}`;
      case "sqft":
        return `${Number(value).toLocaleString()} sqft`;
      case "yearBuilt":
      case "year":
        return value.toString();
      case "mileage":
        return `${Number(value).toLocaleString()} mi`;
      case "length":
        return `${value}ft`;
      case "transmission":
        return value === "automatic" ? "Auto" : value === "manual" ? "Manual" : value;
      case "fuelType":
      case "fuel":
        return value;
      case "propertyType":
      case "boatType":
        return value;
      case "engine":
        return `${value}`;
      default:
        return value;
    }
  };

  const specEntries = Object.entries(specs)
    .map(([key, value]) => ({
      key,
      value,
      icon: getSpecIcon(key, category),
      formatted: formatSpecValue(key, value)
    }))
    .filter(spec => spec.formatted !== null)
    .slice(0, maxDisplay);

  if (specEntries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${size === "sm" ? "gap-1" : "gap-1.5"}`}>
      {specEntries.map(({ key, formatted, icon }) => (
        <div
          key={key}
          className={`inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full ${
            size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs"
          }`}
        >
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium">{formatted}</span>
        </div>
      ))}
      {Object.keys(specs).length > maxDisplay && (
        <div className={`inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full ${
          size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs"
        }`}>
          +{Object.keys(specs).length - maxDisplay}
        </div>
      )}
    </div>
  );
}