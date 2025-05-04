
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { useLanguage } from '@/contexts/LanguageContext';

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // User preferences state
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.notifications?.email ?? true
  );
  const [appNotifications, setAppNotifications] = useState(
    user?.preferences?.notifications?.app ?? true
  );
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferences?.language || 'fr');
  const [selectedTheme, setSelectedTheme] = useState(user?.preferences?.theme || 'light');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    if (user.preferences) {
      setEmailNotifications(user.preferences.notifications?.email ?? true);
      setAppNotifications(user.preferences.notifications?.app ?? true);
      setSelectedLanguage(user.preferences.language || 'fr');
      setSelectedTheme(user.preferences.theme || 'light');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };
  
  const handleLanguageChange = (language: 'fr' | 'en' | 'ar') => {
    setSelectedLanguage(language);
    setLanguage(language);
  };
  
  const savePreferences = async () => {
    try {
      setLoading(true);
      
      const updatedPreferences = {
        language: selectedLanguage as 'fr' | 'en' | 'ar',
        notifications: {
          email: emailNotifications,
          app: appNotifications
        },
        theme: selectedTheme as 'light' | 'dark' | 'system'
      };
      
      await updateProfile({
        preferences: updatedPreferences
      });
      
      toast.success('Préférences mises à jour avec succès');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      <Tabs defaultValue="informations" className="w-full">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>
        <TabsContent value="informations">
          <Card className="shadow-card mb-6">
            <CardContent>
              {user && <ProfileInfo user={user} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preferences">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>Gérez vos préférences de langue et de notifications</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Notifications par Email</Label>
                <Switch 
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => setEmailNotifications(checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="app-notifications">Notifications dans l'App</Label>
                <Switch
                  id="app-notifications"
                  checked={appNotifications}
                  onCheckedChange={(checked) => setAppNotifications(checked)}
                />
              </div>
              <div>
                <Label htmlFor="language">Langue</Label>
                <div className="grid gap-2 mt-2">
                  <Button 
                    variant={selectedLanguage === 'fr' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('fr')}
                  >
                    Français
                  </Button>
                  <Button
                    variant={selectedLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                  >
                    Anglais
                  </Button>
                  <Button
                    variant={selectedLanguage === 'ar' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('ar')}
                  >
                    Arabe
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="theme">Thème</Label>
                <div className="grid gap-2 mt-2">
                  <Button
                    variant={selectedTheme === 'light' ? 'default' : 'outline'}
                    onClick={() => setSelectedTheme('light')}
                  >
                    Clair
                  </Button>
                  <Button
                    variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setSelectedTheme('dark')}
                  >
                    Sombre
                  </Button>
                  <Button
                    variant={selectedTheme === 'system' ? 'default' : 'outline'}
                    onClick={() => setSelectedTheme('system')}
                  >
                    Système
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={savePreferences} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Button variant="destructive" onClick={handleLogout} className="mt-6">
        Déconnexion
      </Button>
    </div>
  );
};

export default Profile;
