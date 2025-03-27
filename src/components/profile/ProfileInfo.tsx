
import React from 'react';
import { User } from '@/types/auth';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AvatarSelector from './AvatarSelector';
import { uploadAvatar } from '@/services/storageService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileInfoProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
}

const ProfileInfo = ({ user, onUpdate }: ProfileInfoProps) => {
  const { updateProfile } = useAuth();
  const [name, setName] = React.useState(user.name || '');
  const [email, setEmail] = React.useState(user.email || '');
  const [phone, setPhone] = React.useState(user.phone_number || '');
  const [address, setAddress] = React.useState(user.address || '');
  const [bio, setBio] = React.useState(user.bio || '');
  const [avatar, setAvatar] = React.useState(user.avatar || '');
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Track changes
  React.useEffect(() => {
    const changes = 
      name !== user.name || 
      email !== user.email || 
      phone !== (user.phone_number || '') || 
      address !== (user.address || '') || 
      bio !== (user.bio || '') || 
      avatar !== (user.avatar || '');
    
    setHasChanges(changes);
  }, [name, email, phone, address, bio, avatar, user]);

  // Reset form when user changes
  React.useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone_number || '');
    setAddress(user.address || '');
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
  }, [user]);

  const handleSelectAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const avatarUrl = await uploadAvatar(file, user.id);
      setAvatar(avatarUrl);
      toast.success('Photo de profil téléchargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de la photo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await updateProfile({
        name,
        email,
        phone_number: phone,
        address,
        bio,
        avatar
      });
      
      toast.success('Profil mis à jour avec succès');
      
      // Call onUpdate if provided
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      
      setHasChanges(false);
    } catch (error) {
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone_number || '');
    setAddress(user.address || '');
    setBio(user.bio || '');
    setAvatar(user.avatar || '');
    setHasChanges(false);
  };

  return (
    <Card className="shadow-card mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-display">Informations personnelles</CardTitle>
        <CardDescription>Gérez vos informations personnelles et de contact</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AvatarSelector 
            currentAvatar={avatar} 
            onSelect={handleSelectAvatar} 
            onUpload={handleAvatarUpload} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Nom complet
              </label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Adresse e-mail
              </label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Téléphone
            </label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+216 XX XXX XXX"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="address">
              Adresse
            </label>
            <Input 
              id="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Votre adresse"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="bio">
              Bio
            </label>
            <Textarea 
              id="bio" 
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez-nous de vous..."
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          disabled={isLoading || !hasChanges}
        >
          Annuler
        </Button>
        <Button 
          className="bg-agri-green-500 hover:bg-agri-green-600"
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileInfo;
