import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceSuggestionProps {
  category: string;
  zipCode: string;
  specs?: any;
  currentPrice: number;
  className?: string;
}

export default function PriceSuggestion({
  category,
  zipCode,
  specs,
  currentPrice,
  className = ""
}: PriceSuggestionProps) {
  const [priceData, setPriceData] = useState<{
    min: number;
    max: number;
    median: number;
    comparison: "fair" | "high" | "low";
  } | null>(null);

  useEffect(() => {
    // Simulate price analysis - in production, this would query real market data
    const calculatePriceSuggestion = () => {
      // Mock calculation based on category and specs
      let basePrice = currentPrice;
      let variance = 0.15; // 15% variance
      
      // Adjust based on category
      if (category === "homes") {
        basePrice = specs?.sqft ? specs.sqft * 300 : currentPrice; // $300/sqft baseline
        variance = 0.20;
      } else if (category === "cars") {
        const yearFactor = specs?.year ? (2024 - specs.year) * 0.05 : 0.1;
        basePrice = currentPrice * (1 - yearFactor);
        variance = 0.25;
      } else if (category === "boats") {
        const lengthFactor = specs?.length ? specs.length * 10000 : basePrice;
        basePrice = lengthFactor;
        variance = 0.30;
      }

      const min = Math.round(basePrice * (1 - variance));
      const max = Math.round(basePrice * (1 + variance));
      const median = Math.round((min + max) / 2);

      let comparison: "fair" | "high" | "low" = "fair";
      if (currentPrice < min) comparison = "low";
      else if (currentPrice > max) comparison = "high";

      return { min, max, median, comparison };
    };

    const suggestion = calculatePriceSuggestion();
    setPriceData(suggestion);
  }, [category, zipCode, specs, currentPrice]);

  if (!priceData) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getComparisonIcon = () => {
    switch (priceData.comparison) {
      case "high":
        return <TrendingUp size={14} className="text-red-500" />;
      case "low":
        return <TrendingDown size={14} className="text-green-500" />;
      default:
        return <Minus size={14} className="text-blue-500" />;
    }
  };

  const getComparisonColor = () => {
    switch (priceData.comparison) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getComparisonText = () => {
    switch (priceData.comparison) {
      case "high":
        return "Above market";
      case "low":
        return "Below market";
      default:
        return "Fair price";
    }
  };

  return (
    <div className={`${className}`}>
      <Badge
        variant="outline"
        className={`${getComparisonColor()} flex items-center space-x-1`}
      >
        {getComparisonIcon()}
        <span className="text-xs font-medium">
          {getComparisonText()}: {formatPrice(priceData.min)}–{formatPrice(priceData.max)}
        </span>
      </Badge>
    </div>
  );
}