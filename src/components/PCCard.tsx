
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PC } from "@/lib/types";
import { Computer, Calendar } from "lucide-react";

interface PCCardProps {
  pc: PC;
}

const PCCard: React.FC<PCCardProps> = ({ pc }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/pc/${pc.id}`);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer card-hover-effect bg-white dark:bg-card"
      onClick={handleCardClick}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {pc.photo ? (
          <img
            src={pc.photo}
            alt={pc.name}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pc-blue to-pc-teal">
            <Computer className="h-16 w-16 text-white animate-pulse-subtle" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl truncate text-pc-dark-blue">{pc.name}</h3>
          <p className="text-muted-foreground truncate">{pc.owner}</p>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4 flex justify-between text-xs text-muted-foreground">
        <span>{pc.ipAddress}</span>
        <div className="flex items-center">
          <Calendar className="mr-1 h-3 w-3" />
          <span>{formatDate(pc.createdAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PCCard;
