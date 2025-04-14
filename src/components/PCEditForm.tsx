
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { getPCById } from "@/lib/storage";
import { PC, PCFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Computer, Upload, X, Plus, Image } from "lucide-react";

const PCEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const [pc, setPC] = useState<PC | null>(null);
  const [loading, setLoading] = useState(true);
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
  const { updateExistingPC } = usePC();
  const navigate = useNavigate();

  // Load PC data when component mounts or ID changes
  useEffect(() => {
    const loadPC = async () => {
      if (id) {
        setLoading(true);
        try {
          const pcData = await getPCById(id);
          setPC(pcData || null);
          
          if (pcData) {
            setFormData({
              name: pcData.name,
              owner: pcData.owner,
              ipAddress: pcData.ipAddress,
              photo: pcData.photo,
              photos: pcData.photos || [],
            });
            setPhotoPreview(pcData.photo || null);
            setAdditionalPhotos(pcData.photos?.slice(1) || []);
          }
        } catch (error) {
          console.error("Error loading PC:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPC();
  }, [id]);

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

  const handleAdditionalPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if already at maximum photos (5 total including main photo)
    if (additionalPhotos.length >= 4) {
      alert("Maximum of 5 photos allowed (1 main + 4 additional)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAdditionalPhotos(prev => [...prev, result]);
      
      // Update the formData.photos array
      const updatedPhotos = [formData.photo, ...prev, result].filter(Boolean);
      setFormData(prev => ({
        ...prev,
        photos: updatedPhotos,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoPreview(null);
    
    // If there are additional photos, make the first one the main photo
    if (additionalPhotos.length > 0) {
      const [newMain, ...rest] = additionalPhotos;
      setPhotoPreview(newMain);
      setAdditionalPhotos(rest);
      setFormData(prev => ({
        ...prev,
        photo: newMain,
        photos: [newMain, ...rest],
      }));
    } else {
      setFormData(prev => ({ ...prev, photo: "", photos: [] }));
    }
  };

  const handleRemoveAdditionalPhoto = (index: number) => {
    const updatedPhotos = [...additionalPhotos];
    updatedPhotos.splice(index, 1);
    setAdditionalPhotos(updatedPhotos);
    
    // Update formData.photos
    const allPhotos = [formData.photo, ...updatedPhotos].filter(Boolean);
    setFormData(prev => ({
      ...prev,
      photos: allPhotos,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.name || !formData.owner || !formData.ipAddress) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const allPhotos = [formData.photo, ...additionalPhotos].filter(Boolean);
      const photoData = { ...formData, photos: allPhotos };
      
      const updatedPC = await updateExistingPC(id, photoData);
      if (updatedPC) {
        navigate(`/pc/${id}`);
      }
    } catch (error) {
      console.error("Error updating PC:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-xl font-medium mb-4">Loading PC data...</h2>
      </div>
    );
  }

  if (!pc) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">PC Not Found</h2>
        <p className="mb-6">The PC you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isValidForm = () => {
    return formData.name.trim() !== "" && 
           formData.owner.trim() !== "" && 
           formData.ipAddress.trim() !== "";
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(`/pc/${id}`)} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to PC Details
      </Button>
      
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Edit PC</CardTitle>
          <CardDescription>
            Update the details of {pc.name}
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
              <Label htmlFor="photo">Main Photo</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("photo")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {photoPreview ? "Change Main Photo" : "Upload Main Photo"}
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
            
            {/* Additional Photos Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Additional Photos ({additionalPhotos.length}/4)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={additionalPhotos.length >= 4}
                  onClick={() => document.getElementById("additionalPhoto")?.click()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Photo
                </Button>
                <Input
                  id="additionalPhoto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdditionalPhotoChange}
                />
              </div>
              
              {additionalPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {additionalPhotos.map((photo, index) => (
                    <div key={index} className="relative group rounded-md overflow-hidden border border-border">
                      <img
                        src={photo}
                        alt={`Additional photo ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveAdditionalPhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 rounded-md border border-dashed border-border bg-muted/30">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Image className="h-6 w-6 mb-1" />
                    <span className="text-sm">No additional photos</span>
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
              {isSubmitting ? "Saving..." : "Update PC Data"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PCEditForm;
