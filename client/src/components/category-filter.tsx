import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "All" },
  { id: "homes", label: "🏠 Homes" },
  { id: "cars", label: "🚗 Cars" },
  { id: "boats", label: "🚤 Boats" },
];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex space-x-4">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          onClick={() => onCategoryChange(category.id)}
          className={
            activeCategory === category.id
              ? "px-4 py-2 rounded-full bg-instagram-blue text-white text-sm font-medium hover:bg-instagram-blue/90"
              : "px-4 py-2 rounded-full bg-gray-100 text-instagram-gray text-sm font-medium hover:bg-gray-200"
          }
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
