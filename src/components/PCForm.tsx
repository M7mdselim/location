
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { PCFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Computer, Upload, X, Plus, Image } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PCForm = () => {
  const [formData, setFormData] = useState<PCFormData>({
    name: "",
    owner: "",
    ipAddress: "",
    photo: "",
    photos: [],
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNewPC } = usePC();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear name error when editing name field
    if (name === 'name') {
      setError(null);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, isMain = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      
      if (isMain) {
        setPhotoPreview(result);
        setFormData((prev) => ({ ...prev, photo: result }));
      } else {
        if (additionalPhotos.length >= 4) {
          setError("Maximum 5 photos allowed (1 main + 4 additional)");
          return;
        }
        
        setAdditionalPhotos(prev => [...prev, result]);
        setFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), result]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  const handleRemoveAdditionalPhoto = (index: number) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name || !formData.owner || !formData.ipAddress) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPC = await addNewPC(formData);
      if (newPC) {
        navigate(`/dashboard`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.message || "Failed to add PC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidForm = () => {
    return formData.name.trim() !== "" && 
           formData.owner.trim() !== "" && 
           formData.ipAddress.trim() !== "";
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Add New PC</CardTitle>
        <CardDescription>
          Enter the details of the PC you want to track
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">PC Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter PC name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              name="owner"
              placeholder="Enter owner name"
              value={formData.owner}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              name="ipAddress"
              placeholder="Enter IP address"
              value={formData.ipAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Main Photo (Optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("photo")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleClearPhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <div className="mt-2 relative rounded-md overflow-hidden border border-border">
                <img
                  src={photoPreview}
                  alt="PC Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            {!photoPreview && (
              <div className="mt-2 flex items-center justify-center h-48 rounded-md border border-dashed border-border bg-muted/50">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Computer className="h-8 w-8 mb-2" />
                  <span>No photo uploaded</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Additional Photos (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {additionalPhotos.length}/4 photos
              </span>
            </div>
            
            {additionalPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {additionalPhotos.map((photo, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden border border-border">
                    <img
                      src={photo}
                      alt={`Additional PC Photo ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveAdditionalPhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {additionalPhotos.length < 4 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById("additionalPhoto")?.click()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Photo ({additionalPhotos.length}/4)
              </Button>
            )}
            
            <Input
              id="additionalPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoChange(e, false)}
            />
            
            {additionalPhotos.length === 0 && (
              <div className="mt-2 flex items-center justify-center h-20 rounded-md border border-dashed border-border bg-muted/50">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Image className="h-6 w-6 mb-1" />
                  <span className="text-xs">No additional photos</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={!isValidForm() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save PC Data"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PCForm;
