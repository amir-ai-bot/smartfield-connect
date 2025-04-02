import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Sprout } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { getDefaultProjectImage } from '@/services/storageService';

export interface ProjectCardProps {
  id: string;
  title: string;
  crop: string;
  location: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'active' | 'planning' | 'completed';
  image?: string;
  user_name?: string;
  user_avatar?: string;
  onClick?: () => void;
}

const ProjectCard = ({ 
  id, 
  title, 
  crop, 
  location, 
  startDate, 
  endDate, 
  progress, 
  status, 
  image,
  user_name,
  user_avatar,
  onClick
}: ProjectCardProps) => {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  
  // Use the default project image from storageService
  const placeholderImage = getDefaultProjectImage();
  
  // Status badge color
  const statusColor = {
    active: "bg-green-500 hover:bg-green-600",
    planning: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-gray-500 hover:bg-gray-600"
  };
  
  // Debug image loading
  useEffect(() => {
    if (image) {
      console.log('Project image URL:', image);
      // Check if image is accessible
      fetch(image, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.warn('Image not accessible:', image);
            setImageError(true);
          }
        })
        .catch(error => {
          console.error('Error checking image accessibility:', error);
          setImageError(true);
        });
    }
  }, [image]);
  
  // Status label translation
  const getStatusLabel = (status: string) => {
    const statusMapping: Record<string, Record<string, string>> = {
      en: {
        active: "Active",
        planning: "Planning",
        completed: "Completed"
      },
      fr: {
        active: "Actif",
        planning: "Planification",
        completed: "Complété"
      },
      ar: {
        active: "نشط",
        planning: "تخطيط",
        completed: "مكتمل"
      }
    };
    
    return statusMapping[language]?.[status] || status;
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            onError={() => {
              console.error('Image failed to load:', image);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <img
              src={placeholderImage}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => {
                console.error('Placeholder image failed to load:', placeholderImage);
                // If even the placeholder fails, show a simple div
                return (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                );
              }}
            />
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${statusColor[status]}`}>
          {getStatusLabel(status)}
        </Badge>
        
        {user_name && (
          <div className="absolute bottom-3 left-3 bg-white bg-opacity-80 rounded-full px-2 py-1 flex items-center">
            {user_avatar ? (
              <img 
                src={user_avatar} 
                alt={user_name} 
                className="w-6 h-6 rounded-full mr-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user_name || '');
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center text-xs">
                {user_name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{user_name}</span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="mr-1 h-4 w-4 text-gray-500" />
          {location}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <Sprout className="mr-1 h-4 w-4 text-green-500" />
            <span>{crop}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-1 h-4 w-4 text-blue-500" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t('progress')}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
