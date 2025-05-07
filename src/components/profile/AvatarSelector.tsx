
import { ChangeEvent, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";

export interface AvatarSelectorProps {
  currentAvatar?: string;
  initialName?: string;
  onChange: (file: File, preview: string) => void;
  onRemove?: () => void;
}

const AvatarSelector = ({ 
  currentAvatar, 
  initialName = '', 
  onChange, 
  onRemove 
}: AvatarSelectorProps) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePreview = reader.result as string;
        setPreview(imagePreview);
        onChange(file, imagePreview);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveAvatar = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || currentAvatar || ''} />
          <AvatarFallback className="text-lg bg-agri-terra-500 text-white">
            {getInitials(initialName)}
          </AvatarFallback>
        </Avatar>
        
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 bg-agri-green-500 p-1 rounded-full cursor-pointer hover:bg-agri-green-600 transition-colors"
        >
          <Camera className="h-4 w-4 text-white" />
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      
      {(preview || currentAvatar) && onRemove && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={handleRemoveAvatar}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer la photo
        </Button>
      )}
    </div>
  );
};

export default AvatarSelector;
