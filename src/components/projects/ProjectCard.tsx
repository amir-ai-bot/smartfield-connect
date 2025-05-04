import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Sprout } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectData } from '@/types/dashboard';

// Create a Farm icon component since it's missing
const Farm = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9h18V5H3v4Z" />
    <path d="M13 18h4V9h-4v9Z" />
    <path d="M7 18h4V9H7v9Z" />
    <path d="M19 18h2v-4h-2v4Z" />
    <path d="M3 18h2v-4H3v4Z" />
    <path d="M3 20h18v2H3v-2Z" />
  </svg>
);

// Add formatRelativeDate utility function
const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Unknown date';
  }
};

const cropDefaultImages: Record<string, string> = {
  'Oliviers': 'https://cdn.pixabay.com/photo/2021/07/14/11/31/olive-tree-6465723_1280.jpg',
  'Palmiers': 'https://cdn.pixabay.com/photo/2019/03/11/23/51/palm-trees-4050731_1280.jpg',
  'Pistachiers': 'https://cdn.pixabay.com/photo/2017/01/05/13/04/pistachio-1955567_1280.jpg',
  'Amandiers': 'https://cdn.pixabay.com/photo/2018/02/25/22/06/almond-tree-3181703_1280.jpg',
  'Figuiers': 'https://cdn.pixabay.com/photo/2018/04/21/05/57/fig-3337612_1280.jpg',
  'Pommiers': 'https://cdn.pixabay.com/photo/2017/09/26/13/31/apple-2788616_1280.jpg',
  'Poiriers': 'https://cdn.pixabay.com/photo/2018/08/20/11/21/pears-3618951_1280.jpg',
  'Abricotiers': 'https://cdn.pixabay.com/photo/2017/05/19/07/50/apricots-2325656_1280.jpg',
  'Vignes': 'https://cdn.pixabay.com/photo/2018/09/04/10/27/grapes-3653504_1280.jpg',
  'Agrumes': 'https://cdn.pixabay.com/photo/2017/01/20/15/06/oranges-1995056_1280.jpg',
  'Blé': 'https://cdn.pixabay.com/photo/2018/11/29/20/01/wheat-3846267_1280.jpg',
  'Orge': 'https://cdn.pixabay.com/photo/2019/08/11/12/52/barley-field-4398758_1280.jpg',
  'Tomates': 'https://cdn.pixabay.com/photo/2016/08/01/17/08/tomatoes-1561565_1280.jpg',
  'Pommes de terre': 'https://cdn.pixabay.com/photo/2016/05/29/08/34/potato-1422580_1280.jpg',
  'Oignons': 'https://cdn.pixabay.com/photo/2016/03/05/22/09/onions-1239423_1280.jpg',
  'Poivrons': 'https://cdn.pixabay.com/photo/2018/06/14/13/13/bell-peppers-3474677_1280.jpg',
  'Carottes': 'https://cdn.pixabay.com/photo/2018/10/03/21/57/carrots-3722517_1280.jpg'
};

// Fallback image for general use
const defaultFallbackImage = 'https://cdn.pixabay.com/photo/2019/09/28/04/02/agriculture-4509751_1280.jpg';

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
  const [fallbackImage, setFallbackImage] = useState('');
  
  // Set fallback image on component mount
  useEffect(() => {
    // Get the appropriate image for the crop, or default if not found
    const defaultImage = crop && cropDefaultImages[crop] 
      ? cropDefaultImages[crop] 
      : defaultFallbackImage;
    
    setFallbackImage(defaultImage);
  }, [crop]);
  
  // Status badge color
  const statusColor = {
    active: "bg-green-500 hover:bg-green-600",
    planning: "bg-blue-500 hover:bg-blue-600",
    completed: "bg-gray-500 hover:bg-gray-600"
  };
  
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
          <img
            src={fallbackImage}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => {
              console.error('Fallback image failed to load:', fallbackImage);
              // If even the fallback fails, show a simple background color
              setFallbackImage(defaultFallbackImage);
            }}
          />
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
