
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Camera, Upload, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Default avatar selection options
const defaultAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=farmer",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=gardener",
  "https://api.dicebear.com/7.x/bottts/svg?seed=farm",
  "https://api.dicebear.com/7.x/bottts/svg?seed=garden",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=green",
  "https://api.dicebear.com/7.x/initials/svg?seed=CC"
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  onSelect: (avatar: string) => void;
  onUpload?: (file: File) => Promise<void>;
}

const AvatarSelector = ({ currentAvatar, onSelect, onUpload }: AvatarSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    
    try {
      setUploadLoading(true);
      await onUpload(file);
      setOpen(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <Avatar className="h-24 w-24">
          {currentAvatar ? (
            <AvatarImage src={currentAvatar} alt="Profile" />
          ) : (
            <AvatarFallback>
              <User className="h-12 w-12 text-gray-400" />
            </AvatarFallback>
          )}
        </Avatar>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="absolute -bottom-2 -right-2 rounded-full p-1.5 h-auto" 
              variant="outline"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Choisir un avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-4">
              {defaultAvatars.map((avatar, index) => (
                <Avatar 
                  key={index} 
                  className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all"
                  onClick={() => {
                    onSelect(avatar);
                    setOpen(false);
                  }}
                >
                  <AvatarImage src={avatar} alt={`Avatar ${index+1}`} />
                </Avatar>
              ))}
            </div>
            
            {onUpload && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">Ou téléchargez votre propre image</p>
                <div className="flex items-center justify-center">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    onClick={triggerFileInput}
                    variant="outline"
                    disabled={uploadLoading}
                    className="w-full"
                  >
                    {uploadLoading ? 'Téléchargement...' : 'Télécharger une image'}
                    <Upload className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-gray-500 mb-4">Cliquez sur l'icône pour changer votre avatar</p>
    </div>
  );
};

export default AvatarSelector;
