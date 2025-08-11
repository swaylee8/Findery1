import { useState } from "react";
import { Bell, Plus, X, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useUserAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from "@/hooks/use-alerts";
import { useLocation } from "wouter";


export default function Alerts() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: alerts } = useUserAlerts(user?.id || 0);
  const createAlertMutation = useCreateAlert();
  const updateAlertMutation = useUpdateAlert();
  const deleteAlertMutation = useDeleteAlert();
  
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any>(null);
  const [formData, setFormData] = useState({
    alertType: "new_listing",
    category: "",
    zipCode: "",
    minPrice: "",
    maxPrice: "",
    keywords: [] as string[],
  });

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const alertData = {
      userId: user.id,
      alertType: formData.alertType,
      category: formData.category || null,
      zipCode: formData.zipCode || null,
      minPrice: formData.minPrice ? parseInt(formData.minPrice) : null,
      maxPrice: formData.maxPrice ? parseInt(formData.maxPrice) : null,
      keywords: formData.keywords.length > 0 ? formData.keywords : null,
      isActive: true,
    };

    try {
      if (editingAlert) {
        await updateAlertMutation.mutateAsync({ id: editingAlert.id, ...alertData });
      } else {
        await createAlertMutation.mutateAsync(alertData);
      }
      setShowForm(false);
      setEditingAlert(null);
      setFormData({
        alertType: "new_listing",
        category: "",
        zipCode: "",
        minPrice: "",
        maxPrice: "",
        keywords: [],
      });
    } catch (error) {
      console.error("Error creating/updating alert:", error);
    }
  };

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert);
    setFormData({
      alertType: alert.alertType,
      category: alert.category || "",
      zipCode: alert.zipCode || "",
      minPrice: alert.minPrice?.toString() || "",
      maxPrice: alert.maxPrice?.toString() || "",
      keywords: alert.keywords || [],
    });
    setShowForm(true);
  };

  const handleDeleteAlert = async (alertId: number) => {
    try {
      await deleteAlertMutation.mutateAsync(alertId);
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const handleToggleAlert = async (alert: any) => {
    try {
      await updateAlertMutation.mutateAsync({
        id: alert.id,
        isActive: !alert.isActive,
      });
    } catch (error) {
      console.error("Error toggling alert:", error);
    }
  };

  if (showForm) {
    return (
      <div className="mobile-container bg-white min-h-screen flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowForm(false);
              setEditingAlert(null);
            }}
            className="text-instagram-light-gray"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="font-semibold text-instagram-gray text-center flex-1">
            {editingAlert ? "Edit Alert" : "Create Alert"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <Label htmlFor="alertType">Alert Type</Label>
              <Select
                value={formData.alertType}
                onValueChange={(value) => setFormData({ ...formData, alertType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_listing">New Listings</SelectItem>
                  <SelectItem value="price_drop">Price Drops</SelectItem>
                  <SelectItem value="liked_item_price_drop">Price Drops on Liked Items</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any category</SelectItem>
                  <SelectItem value="homes">Homes</SelectItem>
                  <SelectItem value="cars">Cars</SelectItem>
                  <SelectItem value="boats">Boats</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="Enter ZIP code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  placeholder="$0"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  placeholder="Any"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords.join(", ")}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)
                })}
                placeholder="luxury, ocean view, etc."
              />
            </div>

            <Button type="submit" className="w-full">
              {editingAlert ? "Update Alert" : "Create Alert"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="text-instagram-light-gray"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="font-semibold text-instagram-gray text-center flex-1">Alerts</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowForm(true)}
          className="text-instagram-blue"
        >
          <Plus size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {alerts?.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-instagram-light-gray mb-4">No alerts yet</p>
            <Button onClick={() => setShowForm(true)}>Create Your First Alert</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts?.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-instagram-gray">
                        {alert.alertType === "new_listing" && "New Listings"}
                        {alert.alertType === "price_drop" && "Price Drops"}
                        {alert.alertType === "liked_item_price_drop" && "Price Drops on Liked Items"}
                      </h3>
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => handleToggleAlert(alert)}
                        size="sm"
                      />
                    </div>
                    
                    <div className="space-y-1 text-sm text-instagram-light-gray">
                      {alert.category && <p>Category: {alert.category}</p>}
                      {alert.zipCode && <p>Location: {alert.zipCode}</p>}
                      {(alert.minPrice || alert.maxPrice) && (
                        <p>
                          Price: ${alert.minPrice?.toLocaleString() || "0"} - 
                          ${alert.maxPrice?.toLocaleString() || "∞"}
                        </p>
                      )}
                      {alert.keywords && alert.keywords.length > 0 && (
                        <p>Keywords: {alert.keywords.join(", ")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAlert(alert)}
                      className="h-8 w-8"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}