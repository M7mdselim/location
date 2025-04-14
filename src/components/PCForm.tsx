
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { PCFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Computer, Upload, X } from "lucide-react";

const PCForm = () => {
  const [formData, setFormData] = useState<PCFormData>({
    name: "",
    owner: "",
    ipAddress: "",
    photo: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNewPC } = usePC();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setFormData((prev) => ({ ...prev, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.owner || !formData.ipAddress) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const newPC = addNewPC(formData);
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error submitting form:", error);
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
            <Label htmlFor="photo">Photo (Optional)</Label>
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
