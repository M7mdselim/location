import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash, Computer, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PCDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { pcs, deleteExistingPC } = usePC();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [dialogPhotoIndex, setDialogPhotoIndex] = useState(0);

  const pc = id ? pcs.find(p => p.id === id) : null;

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

  const photos = pc.photos && pc.photos.length > 0 ? pc.photos : [pc.photo].filter(Boolean);

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      const success = await deleteExistingPC(id);
      if (success) {
        toast({
          title: "PC Deleted",
          description: `${pc.name} has been removed from your list`,
        });
        navigate("/dashboard");
      } else {
        throw new Error("Failed to delete PC");
      }
    } catch (error) {
      console.error("Error deleting PC:", error);
      toast({
        title: "Error",
        description: "Failed to delete PC",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const nextPhoto = () => {
    if (photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (photos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openPhotoDialog = (index: number) => {
    setDialogPhotoIndex(index);
    setShowPhotoDialog(true);
  };

  const nextDialogPhoto = () => {
    if (photos.length <= 1) return;
    setDialogPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevDialogPhoto = () => {
    if (photos.length <= 1) return;
    setDialogPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card className="w-full">
        <CardHeader className="relative">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{pc.name}</h2>
            <Badge variant="outline" className="rounded-full px-3">
              {pc.ipAddress}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {photos.length > 0 && (
            <div className="relative rounded-md overflow-hidden border border-border h-64">
              <img 
                src={photos[currentPhotoIndex]} 
                alt={pc.name} 
                className="w-full h-full object-fill cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openPhotoDialog(currentPhotoIndex)}
              />
              
              {photos.length > 1 && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {photos.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full cursor-pointer ${currentPhotoIndex === index ? 'bg-primary' : 'bg-background/80'}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
              <p className="mt-1">{pc.owner}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">IP Address</h3>
              <p className="mt-1">{pc.ipAddress}</p>
            </div>
            
            {pc.macAddress && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">MAC Address</h3>
                <p className="mt-1">{pc.macAddress}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Added</h3>
              <p className="mt-1">{new Date(pc.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {photos.length > 1 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">All Photos</h3>
              <div className="grid grid-cols-5 gap-2">
                {photos.map((photo, index) => (
                  <div 
                    key={index} 
                    className={`rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity ${index === currentPhotoIndex ? 'border-primary' : 'border-border'}`}
                    onClick={() => openPhotoDialog(index)}
                  >
                    <img src={photo} alt={`${pc.name} ${index + 1}`} className="w-full h-16 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <Separator />
        
        <CardFooter className="flex justify-between p-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/pc/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Photo Viewer Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{pc.name} - Photo {dialogPhotoIndex + 1} of {photos.length}</DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 p-6 pt-2">
            <div className="relative flex justify-center items-center">
              <img 
                src={photos[dialogPhotoIndex]} 
                alt={`${pc.name} ${dialogPhotoIndex + 1}`} 
                className="max-w-full max-h-[60vh] object-contain rounded-md"
              />
              
              {photos.length > 1 && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                    onClick={prevDialogPhoto}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                    onClick={nextDialogPhoto}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {photos.length > 1 && (
              <div className="flex justify-center mt-4 space-x-1">
                {photos.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full cursor-pointer ${dialogPhotoIndex === index ? 'bg-primary' : 'bg-background border border-border'}`}
                    onClick={() => setDialogPhotoIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{pc.name}</strong> and all of its associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Computer className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PCDetails;
