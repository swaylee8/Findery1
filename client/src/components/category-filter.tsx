import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  variant?: "horizontal" | "vertical";
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  variant = "horizontal" 
}: CategoryFilterProps) {
  const categories = [
    { id: "all", label: "✨", icon: "✨" },
    { id: "homes", label: "🏠", icon: "🏠" },
    { id: "cars", label: "🚗", icon: "🚗" },
    { id: "boats", label: "🚤", icon: "🚤" },
  ];

  const containerClass = variant === "vertical" 
    ? "flex flex-col space-y-2" 
    : "flex space-x-2 overflow-x-auto";

  const buttonClass = variant === "vertical"
    ? "w-full justify-start text-left"
    : "whitespace-nowrap";

  return (
    <div className={containerClass}>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="ghost"
          size="sm"
          className={`${buttonClass} relative group transition-all duration-300 ${
            variant === "vertical" 
              ? selectedCategory === category.id 
                ? "bg-white/20 backdrop-blur-md text-white shadow-lg scale-105" 
                : "text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105"
              : selectedCategory === category.id 
                ? "bg-white/20 backdrop-blur-md shadow-lg scale-110" 
                : "bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:scale-105"
          } rounded-2xl px-4 py-3 border border-white/10`}
          onClick={() => onCategoryChange(category.id)}
          data-testid={`filter-${category.id}`}
        >
          <span className={`text-xl transition-all duration-300 ${
            selectedCategory === category.id 
              ? 'drop-shadow-lg' 
              : 'group-hover:drop-shadow-md'
          }`}>
            {category.icon}
          </span>
          {selectedCategory === category.id && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse" />
          )}
        </Button>
      ))}
    </div>
  );
}