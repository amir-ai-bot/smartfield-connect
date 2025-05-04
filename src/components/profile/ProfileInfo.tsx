
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types/auth';
import { Label } from '@/components/ui/label';
import { Edit, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';

export interface ProfileInfoProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || user.display_name || '',
    bio: user.bio || '',
    phone_number: user.phone_number || '',
    address: user.address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file, 'avatars');
      
      if (imageUrl) {
        await onUpdate({ avatar: imageUrl });
        toast.success('Photo de profil mise à jour');
      } else {
        toast.error('Erreur lors du téléchargement de l\'image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    await onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-2 border-white shadow-md">
            <AvatarImage src={user.avatar} alt={user.name || user.display_name || user.email} />
            <AvatarFallback className="text-2xl">
              {(user.name || user.display_name || user.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
            <label 
              htmlFor="avatar-upload" 
              className="cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full rounded-full"
            >
              <Edit className="h-6 w-6 text-white" />
              <span className="sr-only">Changer l'avatar</span>
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">
            {user.name || user.display_name || 'Utilisateur'}
          </h2>
          <div className="text-gray-500 flex items-center mt-1">
            <Mail className="h-4 w-4 mr-1" />
            <span>{user.email}</span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {user.role || 'Utilisateur'}
            </span>
          </div>
        </div>
        
        <div className="md:ml-auto">
          {isEditing ? (
            <div className="space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
            >
              Modifier le profil
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6 space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone_number"
                    name="phone_number"
                    className="pl-10"
                    placeholder="+216 00 000 000"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  className="pl-10"
                  placeholder="Votre adresse"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Parlez-nous de vous..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                <p className="mt-1">{user.phone_number || 'Non renseigné'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                <p className="mt-1">{user.address || 'Non renseignée'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bio</h3>
              <p className="mt-1 whitespace-pre-wrap">{user.bio || 'Aucune bio renseignée'}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
