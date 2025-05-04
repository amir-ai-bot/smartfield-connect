import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateUserProfile } from '@/services/authService';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { User } from '@/types/auth';

const Profile: React.FC = () => {
  const { user, refreshUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    document.title = 'Profil | AgriSmart';
  }, []);

  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    
    try {
      setUpdating(true);
      const updatedUser = await updateUserProfile(user.id, updatedData);
      if (updatedUser) {
        toast.success('Profil mis à jour avec succès');
        refreshUser();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error('Profile update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Profil Utilisateur</h1>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <ProfileInfo user={user} onUpdate={handleUpdateProfile} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Paramètres</h2>
                  {/* Settings will be implemented here */}
                  <p className="text-gray-500">Paramètres à venir...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
