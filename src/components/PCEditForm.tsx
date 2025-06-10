import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { useForm } from "react-hook-form";
import { PC, PCFormData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Computer, Camera, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PCEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const { pcs, updateExistingPC } = usePC();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pc, setPC] = useState<PC | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PCFormData>();

  useEffect(() => {
    if (!id) return;

    const currentPC = pcs.find(p => p.id === id);
    if (currentPC) {
      setPC(currentPC);
      reset({
        name: currentPC.name,
        owner: currentPC.owner,
        ipAddress: currentPC.ipAddress,
        macAddress: currentPC.macAddress || "",
        photo: currentPC.photo || "",
      });
      setPhotos(currentPC.photos || [currentPC.photo].filter(Boolean));
      setLoading(false);
    }
  }, [id, pcs, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || processingFiles) return;

    // Prevent multiple simultaneous processing
    setProcessingFiles(true);

    // Limit to 5 total photos
    if (photos.length + files.length > 5) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can only upload up to 5 photos per PC",
        variant: "destructive",
      });
      setProcessingFiles(false);
      return;
    }

    const fileArray = Array.from(files);
    let processedCount = 0;

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotoData = reader.result as string;
        
        setPhotos(prevPhotos => {
          // Check if this photo already exists
          const isDuplicate = prevPhotos.some(existingPhoto => existingPhoto === newPhotoData);
          
          if (isDuplicate) {
            console.log("Duplicate photo detected, skipping...");
            return prevPhotos;
          }
          
          // Only add if not duplicate
          return [...prevPhotos, newPhotoData];
        });

        processedCount++;
        if (processedCount === fileArray.length) {
          setProcessingFiles(false);
        }
      };
      
      reader.onerror = () => {
        processedCount++;
        if (processedCount === fileArray.length) {
          setProcessingFiles(false);
        }
      };
      
      reader.readAsDataURL(file);
    });

    // Clear the input to allow the same file to be selected again if needed
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PCFormData) => {
    if (!id) return;
    
    setSaving(true);
    try {
      // Set the first photo as the main photo
      data.photo = photos.length > 0 ? photos[0] : "";
      
      // Set all photos in the photos array
      data.photos = photos;
      
      await updateExistingPC(id, data);
      navigate("/pc/" + id);
    } catch (error) {
      console.error("Error updating PC:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pc) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">PC Not Found</h2>
        <p className="mt-2">The PC you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit PC</CardTitle>
          <CardDescription>Update the details of {pc.name}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">PC Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Desktop-01"
                {...register("name", { required: "PC name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner <span className="text-destructive">*</span></Label>
              <Input
                id="owner"
                placeholder="John Doe"
                {...register("owner", { required: "Owner is required" })}
              />
              {errors.owner && (
                <p className="text-sm text-destructive">{errors.owner.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address <span className="text-destructive">*</span></Label>
              <Input
                id="ipAddress"
                placeholder="192.168.1.100"
                {...register("ipAddress", { required: "IP address is required" })}
              />
              {errors.ipAddress && (
                <p className="text-sm text-destructive">{errors.ipAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="macAddress">MAC Address</Label>
              <Input
                id="macAddress"
                placeholder="00:1A:2B:3C:4D:5E"
                {...register("macAddress")}
              />
              {errors.macAddress && (
                <p className="text-sm text-destructive">{errors.macAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Photos (Up to 5)</Label>
              <div className="mt-1 flex flex-col gap-4">
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  disabled={processingFiles}
                  className="file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-md file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                
                {photos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden border border-border">
                        <img src={photo} alt={`Preview ${index + 1}`} className="w-full h-48 object-cover" />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 rounded-md border border-dashed border-border">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Camera className="h-8 w-8 mb-2" />
                      <p>No photos selected</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {photos.length} of 5 photos selected {processingFiles && "(Processing...)"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              disabled={saving}
              onClick={() => navigate("/pc/" + id)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Computer className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Computer className="mr-2 h-4 w-4" />
                  Update PC
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PCEditForm;
