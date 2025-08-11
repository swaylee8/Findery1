import { Home, Car, Anchor, Sparkles } from "lucide-react";

type CategoryType = 'all' | 'homes' | 'cars' | 'boats';

interface CategoryHeaderProps {
  category: CategoryType;
}

const categoryConfig = {
  all: { label: 'For You', icon: Sparkles, color: 'text-white' },
  homes: { label: 'Homes', icon: Home, color: 'text-blue-400' },
  cars: { label: 'Cars', icon: Car, color: 'text-yellow-400' },
  boats: { label: 'Boats', icon: Anchor, color: 'text-cyan-400' }
};

export default function CategoryHeader({ category }: CategoryHeaderProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className="relative h-20 w-full flex items-center justify-center snap-start">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-sm" />
      
      {/* Category Badge */}
      <div className="relative bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
        <div className={`flex items-center gap-2 ${config.color}`}>
          <Icon size={16} />
          <span className="text-sm font-light">{config.label}</span>
        </div>
      </div>
      
      {/* Subtle Indicator Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/20 rounded-full" />
    </div>
  );
}