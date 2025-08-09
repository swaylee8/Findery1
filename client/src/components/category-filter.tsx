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
    { id: "all", label: "All", icon: "🏠" },
    { id: "homes", label: "Homes", icon: "🏡" },
    { id: "cars", label: "Cars", icon: "🚗" },
    { id: "boats", label: "Boats", icon: "⛵" },
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
          variant={selectedCategory === category.id ? "default" : "ghost"}
          size="sm"
          className={`${buttonClass} ${
            variant === "vertical" 
              ? selectedCategory === category.id 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
              : selectedCategory === category.id 
                ? "bg-white text-black" 
                : "bg-white/20 text-white hover:bg-white/30"
          }`}
          onClick={() => onCategoryChange(category.id)}
          data-testid={`filter-${category.id}`}
        >
          <span className="mr-2">{category.icon}</span>
          {category.label}
        </Button>
      ))}
    </div>
  );
}