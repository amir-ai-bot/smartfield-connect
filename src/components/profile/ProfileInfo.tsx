
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Pencil, Save, X, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { uploadAvatar } from '@/services/storageService';
import { toast } from 'sonner';

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const { updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || user.display_name || '',
    bio: user.bio || '',
    phone_number: user.phone_number || '',
    address: user.address || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewAvatar(fileUrl);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData: any = { ...profileData };
      
      // Handle avatar upload if selected
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(avatarFile, user.id);
        updateData.avatar = avatarUrl;
      }
      
      // Update profile in database
      await updateProfile(updateData);
      
      // Reset state
      setEditing(false);
      setAvatarFile(null);
      setPreviewAvatar(null);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    setProfileData({
      name: user.name || user.display_name || '',
      bio: user.bio || '',
      phone_number: user.phone_number || '',
      address: user.address || ''
    });
    setAvatarFile(null);
    setPreviewAvatar(null);
    setEditing(false);
  };

  const avatarUrl = previewAvatar || user.avatar;
  const displayName = user.name || user.display_name || user.email;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || ''} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          {editing && (
            <>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 rounded-full bg-background shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          )}
        </div>
        
        <div className="flex flex-col items-center sm:items-start">
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-gray-500 capitalize">{user.role}</p>
          
          {!editing && (
            <Button 
              onClick={() => setEditing(true)} 
              variant="outline" 
              className="mt-2"
              size="sm"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Modifier le profil
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4">
        {editing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bio</h3>
              <p>{user.bio || 'Aucune biographie'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
              <p>{user.phone_number || 'Non renseigné'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
              <p>{user.address || 'Non renseignée'}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfileInfo;
