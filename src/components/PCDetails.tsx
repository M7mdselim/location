
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePC } from "@/contexts/PCContext";
import { getPCById } from "@/lib/storage";
import { PC } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Trash, Edit, Computer, Calendar, User, Network, Wifi } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PCDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [pc, setPC] = useState<PC | null>(null);
  const [loading, setLoading] = useState(true);
  const { deleteExistingPC } = usePC();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load PC data when component mounts or ID changes
  useEffect(() => {
    const loadPC = async () => {
      if (id) {
        setLoading(true);
        try {
          const pcData = await getPCById(id);
          setPC(pcData || null);
        } catch (error) {
          console.error("Error loading PC:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPC();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-xl font-medium mb-4">Loading PC details...</h2>
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

  const handleDelete = () => {
    if (id) {
      deleteExistingPC(id);
      navigate("/dashboard");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">PC Image</CardTitle>
            </CardHeader>
            <CardContent>
              {pc.photo ? (
                <div className="rounded-md overflow-hidden border border-border">
                  <img
                    src={pc.photo}
                    alt={pc.name}
                    className="w-full aspect-square object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 rounded-md border border-dashed border-border bg-gradient-to-br from-pc-blue to-pc-teal">
                  <Computer className="h-16 w-16 text-white" />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Additional photos if available */}
          {pc.photos && pc.photos.length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Additional Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pc.photos.slice(1).map((photoUrl, index) => (
                    <div key={index} className="rounded-md overflow-hidden border border-border">
                      <img
                        src={photoUrl}
                        alt={`${pc.name} photo ${index + 2}`}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/pc/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the PC data
                    for "{pc.name}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{pc.name}</CardTitle>
              <CardDescription>{pc.ipAddress}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-pc-blue mt-0.5" />
                  <div>
                    <h3 className="font-medium">Owner</h3>
                    <p className="text-lg">{pc.owner}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Network className="h-5 w-5 text-pc-blue mt-0.5" />
                  <div>
                    <h3 className="font-medium">IP Address</h3>
                    <p className="text-lg font-mono">{pc.ipAddress}</p>
                  </div>
                </div>
                
                {pc.macAddress && (
                  <div className="flex items-start space-x-3">
                    <Wifi className="h-5 w-5 text-pc-blue mt-0.5" />
                    <div>
                      <h3 className="font-medium">MAC Address</h3>
                      <p className="text-lg font-mono">{pc.macAddress}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <Computer className="h-5 w-5 text-pc-blue mt-0.5" />
                  <div>
                    <h3 className="font-medium">PC Name</h3>
                    <p className="text-lg">{pc.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-pc-blue mt-0.5" />
                  <div>
                    <h3 className="font-medium">Added On</h3>
                    <p>{formatDate(pc.createdAt)}</p>
                  </div>
                </div>
                
                {pc.updatedAt !== pc.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-pc-blue mt-0.5" />
                    <div>
                      <h3 className="font-medium">Last Updated</h3>
                      <p>{formatDate(pc.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PCDetails;
