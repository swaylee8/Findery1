import { useState } from "react";
import { Bell, X, DollarSign, MapPin, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useCreateAlert } from "@/hooks/use-alerts";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertModal({ isOpen, onClose }: AlertModalProps) {
  const [alertData, setAlertData] = useState({
    category: "",
    maxPrice: "",
    location: "",
    keywords: "",
    isActive: true,
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const createAlert = useCreateAlert();

  const handleCreate = async () => {
    if (!user) return;
    
    try {
      await createAlert.mutateAsync({
        userId: user.id,
        alertType: "price",
        category: alertData.category || undefined,
        maxPrice: alertData.maxPrice ? parseInt(alertData.maxPrice) : undefined,
        zipCode: alertData.location || undefined,
        keywords: alertData.keywords || undefined,
        isActive: alertData.isActive,
      });
      
      toast({
        title: "Alert created!",
        description: "You'll be notified when matching listings are posted.",
      });
      
      onClose();
      setAlertData({
        category: "",
        maxPrice: "",
        location: "",
        keywords: "",
        isActive: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive",
      });
    }
  };

  const hasValidData = alertData.category || alertData.maxPrice || alertData.location || alertData.keywords;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell size={20} />
            <span>Create Price Alert</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center space-x-2">
              <Tag size={16} />
              <span>Category</span>
            </Label>
            <Select
              value={alertData.category}
              onValueChange={(value) => setAlertData({ ...alertData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homes">Homes</SelectItem>
                <SelectItem value="cars">Cars</SelectItem>
                <SelectItem value="boats">Boats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Max Price</span>
            </Label>
            <Input
              id="maxPrice"
              placeholder="e.g., 500000"
              value={alertData.maxPrice}
              onChange={(e) => setAlertData({ ...alertData, maxPrice: e.target.value })}
              type="number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., San Francisco, CA"
              value={alertData.location}
              onChange={(e) => setAlertData({ ...alertData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              placeholder="e.g., waterfront, garage, pool"
              value={alertData.keywords}
              onChange={(e) => setAlertData({ ...alertData, keywords: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active" className="text-sm font-medium">
              Active Alert
            </Label>
            <Switch
              id="active"
              checked={alertData.isActive}
              onCheckedChange={(checked) => setAlertData({ ...alertData, isActive: checked })}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleCreate}
              disabled={!hasValidData || createAlert.isPending}
              className="flex-1 bg-instagram-blue text-white hover:bg-instagram-blue/90"
            >
              {createAlert.isPending ? "Creating..." : "Create Alert"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}