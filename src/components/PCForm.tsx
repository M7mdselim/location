
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
  const [photo, setPhoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PCFormData>({
    defaultValues: {
      name: "",
      owner: "",
      ipAddress: "",
      macAddress: "",
      photo: "",
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const onSubmit = async (data: PCFormData) => {
    setLoading(true);
    try {
      if (photo) {
        data.photo = photo;
      }
      await addNewPC(data);
      reset();
      setPhoto(null);
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
            <Label htmlFor="photo">Photo</Label>
            <div className="mt-1 flex flex-col gap-4">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-md file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              
              {photo && (
                <div className="relative mt-2 rounded-md overflow-hidden border border-border">
                  <img src={photo} alt="Preview" className="w-full h-48 object-cover" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {!photo && (
                <div className="flex items-center justify-center h-48 rounded-md border border-dashed border-border">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="h-8 w-8 mb-2" />
                    <p>No photo selected</p>
                  </div>
                </div>
              )}
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
