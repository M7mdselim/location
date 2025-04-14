
import React, { useState } from "react";
import { usePC } from "@/contexts/PCContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PCFormData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Computer, Camera, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PCForm = () => {
  const { addNewPC } = usePC();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PCFormData>({
    defaultValues: {
      name: "",
      owner: "",
      ipAddress: "",
      macAddress: "",
      photo: "",
      photos: [],
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 total photos
    if (photos.length + files.length > 5) {
      toast({
        title: "Maximum Photos Reached",
        description: "You can only upload up to 5 photos per PC",
        variant: "destructive",
      });
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prevPhotos => [...prevPhotos, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: PCFormData) => {
    setLoading(true);
    try {
      // Set the first photo as the main photo, or empty if no photos
      data.photo = photos.length > 0 ? photos[0] : "";
      
      // Set all photos in the photos array
      data.photos = photos;

      await addNewPC(data);
      reset();
      setPhotos([]);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding PC:", error);
      // Error is already handled in the context with toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New PC</CardTitle>
        <CardDescription>Enter the details of the PC you want to track</CardDescription>
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
                {photos.length} of 5 photos selected
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            disabled={loading}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Computer className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Computer className="mr-2 h-4 w-4" />
                Save PC
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PCForm;
