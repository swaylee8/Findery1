import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIDescriptionGeneratorProps {
  category: string;
  specs?: any;
  images: string[];
  onDescriptionGenerated: (description: string) => void;
  className?: string;
}

export default function AIDescriptionGenerator({
  category,
  specs,
  images,
  onDescriptionGenerated,
  className = ""
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDescription = async () => {
    setIsGenerating(true);
    
    try {
      // This is a placeholder for AI generation - in production, connect to OpenAI/Claude API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Generate a description based on category and specs
      const generatedDescription = generatePlaceholderDescription(category, specs);
      
      onDescriptionGenerated(generatedDescription);
      
      toast({
        title: "Description generated!",
        description: "AI has created a description based on your specs and photos.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Unable to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlaceholderDescription = (category: string, specs: any) => {
    const baseDescriptions = {
      homes: `Beautiful ${specs?.propertyType || 'property'} featuring ${specs?.bedrooms || 'multiple'} bedrooms and ${specs?.bathrooms || 'multiple'} bathrooms. This stunning home offers ${specs?.sqft || 'spacious'} square feet of living space with modern amenities and premium finishes. Perfect for those seeking comfort and style in a desirable location.`,
      
      cars: `Excellent condition ${specs?.year || 'late model'} ${specs?.make || 'vehicle'} ${specs?.model || ''} with ${specs?.mileage || 'low'} miles. This well-maintained ${specs?.fuelType || 'vehicle'} features ${specs?.transmission || 'smooth'} transmission and comes with all original documentation. Perfect for daily driving or weekend adventures.`,
      
      boats: `Magnificent ${specs?.length || 'full-size'} foot ${specs?.boatType || 'vessel'} perfect for entertaining and water adventures. This ${specs?.year || 'well-maintained'} boat features ${specs?.engine || 'reliable power'} and comes equipped with modern navigation and safety equipment. Ideal for fishing, cruising, or water sports enthusiasts.`
    };

    return baseDescriptions[category as keyof typeof baseDescriptions] || 
           "Quality item in excellent condition. Well-maintained and ready for its next owner. Contact for more details and to schedule a viewing.";
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={generateDescription}
      disabled={isGenerating}
      className={`${className} flex items-center space-x-2`}
    >
      {isGenerating ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Wand2 size={16} />
      )}
      <span>
        {isGenerating ? "Generating..." : "Generate with AI"}
      </span>
    </Button>
  );
}