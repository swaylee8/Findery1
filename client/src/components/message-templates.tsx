import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessageTemplates } from "@/hooks/use-messages";

interface MessageTemplatesProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function MessageTemplates({ onSendMessage, isLoading }: MessageTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  
  const { data: templates } = useMessageTemplates();

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    setCustomMessage(template);
  };

  const handleSend = () => {
    if (customMessage.trim()) {
      onSendMessage(customMessage.trim());
      setCustomMessage("");
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Templates */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-instagram-gray">Quick Messages</p>
        <div className="grid grid-cols-1 gap-2">
          {templates?.map((template, index) => (
            <button
              key={index}
              onClick={() => handleTemplateSelect(template)}
              className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                selectedTemplate === template
                  ? "border-instagram-blue bg-instagram-blue/5 text-instagram-blue"
                  : "border-gray-200 hover:border-gray-300 text-instagram-gray"
              }`}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-instagram-gray">Your Message</p>
        <div className="relative">
          <Textarea
            placeholder="Write your message or select a template above..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="min-h-[80px] resize-none pr-12"
          />
          <Button
            onClick={handleSend}
            disabled={!customMessage.trim() || isLoading}
            size="sm"
            className="absolute bottom-2 right-2 bg-instagram-blue text-white hover:bg-instagram-blue/90"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}