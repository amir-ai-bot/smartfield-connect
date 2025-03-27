
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload } from 'lucide-react';

// Male avatar options
const maleAvatars = [
  '/avatars/male-1.png',
  '/avatars/male-2.png',
  '/avatars/male-3.png',
  '/avatars/male-4.png',
  '/avatars/male-5.png',
  '/avatars/male-6.png',
];

// Female avatar options
const femaleAvatars = [
  '/avatars/female-1.png',
  '/avatars/female-2.png',
  '/avatars/female-3.png',
  '/avatars/female-4.png',
  '/avatars/female-5.png',
  '/avatars/female-6.png',
];

interface AvatarSelectorProps {
  currentAvatar?: string;
  onSelect: (avatar: string) => void;
  onUpload: (file: File) => void;
}

const AvatarSelector = ({ currentAvatar, onSelect, onUpload }: AvatarSelectorProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const isCustomAvatar = currentAvatar && 
    !maleAvatars.includes(currentAvatar) && 
    !femaleAvatars.includes(currentAvatar);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatar} />
          <AvatarFallback>
            {currentAvatar ? currentAvatar.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex justify-center">
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Télécharger Photo
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*"
          className="hidden" 
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Avatars Homme</h3>
        <ScrollArea className="h-20 w-full">
          <div className="flex gap-2 p-1">
            {maleAvatars.map((avatar, index) => (
              <Avatar 
                key={index} 
                className={`h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary ${
                  currentAvatar === avatar ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect(avatar)}
              >
                <AvatarImage src={avatar} />
                <AvatarFallback>M{index + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Avatars Femme</h3>
        <ScrollArea className="h-20 w-full">
          <div className="flex gap-2 p-1">
            {femaleAvatars.map((avatar, index) => (
              <Avatar 
                key={index} 
                className={`h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary ${
                  currentAvatar === avatar ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelect(avatar)}
              >
                <AvatarImage src={avatar} />
                <AvatarFallback>F{index + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AvatarSelector;
