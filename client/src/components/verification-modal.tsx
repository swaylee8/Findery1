import { useState } from "react";
import { X, Upload, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VerificationModal({ open, onOpenChange }: VerificationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    taxId: "",
    phoneNumber: "",
    address: "",
    website: "",
    description: "",
    documents: [] as File[],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, documents: [...formData.documents, ...files] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This is a placeholder - in production, you'd submit to a verification service
    console.log("Verification request submitted:", formData);
    
    // Simulate submission
    alert("Verification request submitted! We'll review your application within 2-3 business days.");
    onOpenChange(false);
    setStep(1);
    setFormData({
      businessName: "",
      businessType: "",
      taxId: "",
      phoneNumber: "",
      address: "",
      website: "",
      description: "",
      documents: [],
    });
  };

  const removeDocument = (index: number) => {
    const newDocs = formData.documents.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocs });
  };

  const isStep1Valid = formData.businessName && formData.businessType && formData.phoneNumber;
  const isStep2Valid = formData.address && formData.description;
  const isStep3Valid = formData.documents.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="text-instagram-blue" size={20} />
            <span>Seller Verification</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-instagram-blue' : 'bg-gray-200'}`} />
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-instagram-blue' : 'bg-gray-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-instagram-blue' : 'bg-gray-200'}`} />
            <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-instagram-blue' : 'bg-gray-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-instagram-blue' : 'bg-gray-200'}`} />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-instagram-gray">Business Information</h3>
                
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Your business name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <select
                    id="businessType"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="dealer">Auto Dealer</option>
                    <option value="realtor">Real Estate Agent</option>
                    <option value="broker">Boat Broker</option>
                    <option value="individual">Individual Seller</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID / License Number</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!isStep1Valid}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-instagram-gray">Location & Details</h3>
                
                <div>
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full business address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourbusiness.com"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your business and verification needs"
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1"
                    disabled={!isStep2Valid}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-instagram-gray">Document Upload</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-600 mb-2">Upload verification documents</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="documents"
                  />
                  <Label htmlFor="documents" className="cursor-pointer text-instagram-blue text-sm">
                    Choose files
                  </Label>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Accepted documents:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Business license</li>
                    <li>Professional license (dealers, realtors)</li>
                    <li>Government-issued ID</li>
                    <li>Tax documents</li>
                  </ul>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded files:</p>
                    {formData.documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index)}
                          className="h-6 w-6"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="text-blue-500 mt-0.5" size={16} />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Review Process</p>
                    <p>Applications are reviewed within 2-3 business days. You'll receive an email with the decision.</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!isStep3Valid}
                  >
                    Submit Application
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}