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
          className={`${buttonClass} relative group transition-all duration-300 hover:scale-110 p-2`}
          onClick={() => onCategoryChange(category.id)}
          data-testid={`filter-${category.id}`}
        >
          <span className={`text-2xl transition-all duration-300 ${
            selectedCategory === category.id 
              ? 'scale-125 drop-shadow-lg filter brightness-125' 
              : 'group-hover:scale-110 group-hover:drop-shadow-md opacity-70 group-hover:opacity-100'
          }`}>
            {category.icon}
          </span>
          {selectedCategory === category.id && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg" />
          )}
        </Button>
      ))}
    </div>
  );
}