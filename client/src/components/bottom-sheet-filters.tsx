import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface FilterState {
  priceRange: [number, number];
  bedrooms?: number;
  mileage?: [number, number];
  year?: [number, number];
  zipCode?: string;
  category?: string;
}

interface BottomSheetFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  category?: string;
}

export function BottomSheetFilters({ filters, onFiltersChange, category }: BottomSheetFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price}`;
  };

  const formatMileage = (mileage: number) => {
    if (mileage >= 1000) return `${(mileage / 1000).toFixed(0)}K mi`;
    return `${mileage} mi`;
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 5000000],
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 5000000) count++;
    if (localFilters.bedrooms) count++;
    if (localFilters.mileage) count++;
    if (localFilters.year) count++;
    if (localFilters.zipCode) count++;
    return count;
  };

  const renderCategorySpecificFilters = () => {
    switch (category) {
      case "homes":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Bedrooms</Label>
              <Select
                value={localFilters.bedrooms?.toString() || ""}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  bedrooms: value ? parseInt(value) : undefined
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Any bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+ Bedroom</SelectItem>
                  <SelectItem value="2">2+ Bedrooms</SelectItem>
                  <SelectItem value="3">3+ Bedrooms</SelectItem>
                  <SelectItem value="4">4+ Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "cars":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Mileage Range</Label>
              <div className="mt-2 mb-4">
                <Slider
                  value={localFilters.mileage || [0, 200000]}
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    mileage: value as [number, number]
                  })}
                  max={200000}
                  step={5000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatMileage(localFilters.mileage?.[0] || 0)}</span>
                  <span>{formatMileage(localFilters.mileage?.[1] || 200000)}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Year Range</Label>
              <div className="mt-2 mb-4">
                <Slider
                  value={localFilters.year || [1990, 2024]}
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    year: value as [number, number]
                  })}
                  min={1990}
                  max={2024}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{localFilters.year?.[0] || 1990}</span>
                  <span>{localFilters.year?.[1] || 2024}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "boats":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Year Range</Label>
              <div className="mt-2 mb-4">
                <Slider
                  value={localFilters.year || [1980, 2024]}
                  onValueChange={(value) => setLocalFilters({
                    ...localFilters,
                    year: value as [number, number]
                  })}
                  min={1980}
                  max={2024}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{localFilters.year?.[0] || 1980}</span>
                  <span>{localFilters.year?.[1] || 2024}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter size={16} className="mr-2" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={16} className="mr-1" />
              Clear All
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-20">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="mt-2 mb-4">
              <Slider
                value={localFilters.priceRange}
                onValueChange={(value) => setLocalFilters({
                  ...localFilters,
                  priceRange: value as [number, number]
                })}
                max={5000000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatPrice(localFilters.priceRange[0])}</span>
                <span>{formatPrice(localFilters.priceRange[1])}</span>
              </div>
            </div>
          </div>

          {/* ZIP Code */}
          <div>
            <Label htmlFor="zipCode" className="text-sm font-medium">
              ZIP Code
            </Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="Enter ZIP code"
              value={localFilters.zipCode || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                zipCode: e.target.value || undefined
              })}
              className="mt-2"
              maxLength={5}
            />
          </div>

          {/* Category-specific filters */}
          {renderCategorySpecificFilters()}
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}