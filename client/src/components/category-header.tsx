// Clean emoji-only category headers - no icon imports needed

type CategoryType = 'all' | 'homes' | 'cars' | 'boats';

interface CategoryHeaderProps {
  category: CategoryType;
}

const categoryConfig = {
  all: { emoji: '✨', color: 'text-white' },
  homes: { emoji: '🏠', color: 'text-blue-400' },
  cars: { emoji: '🚗', color: 'text-yellow-400' },
  boats: { emoji: '🚤', color: 'text-cyan-400' }
};

export default function CategoryHeader({ category }: CategoryHeaderProps) {
  const config = categoryConfig[category];

  return (
    <div className="relative h-20 w-full flex items-center justify-center snap-start">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-sm" />
      
      {/* Category Emoji - Clean */}
      <div className="relative">
        <span className="text-3xl drop-shadow-lg">{config.emoji}</span>
      </div>
      
      {/* Subtle Indicator Line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/20 rounded-full" />
    </div>
  );
}