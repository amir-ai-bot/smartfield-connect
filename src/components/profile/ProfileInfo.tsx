
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/types/auth';
import { uploadImage } from '@/services/storageService';
import { toast } from 'sonner';
import AvatarSelector from './AvatarSelector';

interface ProfileInfoProps {
  user: User;
  onUpdate: (userData: Partial<User>) => Promise<void>;
}

export default function ProfileInfo({ user, onUpdate }: ProfileInfoProps) {
  const [name, setName] = useState(user.display_name || '');
  const [bio, setBio] = useState(''); // Add bio state
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await onUpdate({
        display_name: name,
        // Add more fields as needed
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (file: File) => {
    try {
      const avatarUrl = await uploadImage(file, 'avatars');
      
      if (avatarUrl) {
        await onUpdate({ avatar: avatarUrl });
        toast.success('Avatar updated successfully');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AvatarSelector 
            currentAvatar={user.avatar} 
            onSelect={(avatarUrl) => onUpdate({ avatar: avatarUrl })}
            onUpload={handleAvatarUpload}
          />
          
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
          
          <CardFooter className="p-0">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
