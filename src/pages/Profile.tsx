import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserPreferences } from '@/types/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, User as UserIcon, Settings, Mail, Key, Shield, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Import missing services and types if needed
import { becomeFournisseur } from '@/services/userService';

const ThemeSelector = ({ theme, onChange }: { theme: string, onChange: (theme: 'light' | 'dark' | 'system') => void }) => {
  return (
    <RadioGroup
      defaultValue={theme}
      onValueChange={(value) => onChange(value as 'light' | 'dark' | 'system')}
      className="flex flex-col space-y-1"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="light" id="theme-light" />
        <Label htmlFor="theme-light">Clair</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dark" id="theme-dark" />
        <Label htmlFor="theme-dark">Sombre</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="system" id="theme-system" />
        <Label htmlFor="theme-system">Système</Label>
      </div>
    </RadioGroup>
  );
};

const LanguageSelector = ({ language, onChange }: { language: string, onChange: (lang: 'fr' | 'en' | 'ar') => void }) => {
  return (
    <RadioGroup 
      defaultValue={language}
      onValueChange={(value) => onChange(value as 'fr' | 'en' | 'ar')}
      className="flex flex-col space-y-1"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="fr" id="lang-fr" />
        <Label htmlFor="lang-fr">Français</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="en" id="lang-en" />
        <Label htmlFor="lang-en">English</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ar" id="lang-ar" />
        <Label htmlFor="lang-ar">العربية</Label>
      </div>
    </RadioGroup>
  );
};

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [profileData, setProfileData] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isBecomingFournisseur, setIsBecomingFournisseur] = useState(false);
  
  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'fr',
    notifications: {
      email: true,
      app: true
    },
    theme: 'light'
  });
  
  useEffect(() => {
    document.title = 'Profil | AgriSmart';
    if (!user) {
      navigate('/login');
    } else {
      setProfileData(user);
      // Initialize preferences from user data if available
      if (user.preferences) {
        // Ensure all required properties exist with defaults
        const userPrefs: UserPreferences = {
          language: user.preferences.language || 'fr',
          notifications: {
            email: user.preferences.notifications?.email ?? true,
            app: user.preferences.notifications?.app ?? true
          },
          theme: user.preferences.theme || 'light'
        };
        setPreferences(userPrefs);
      }
    }
  }, [user, navigate]);

  const handleUpdateProfile = (updatedUser: User) => {
    setProfileData(updatedUser);
  };

  const handleUpdatePreferences = async () => {
    if (!user) return;
    
    try {
      setUpdating(true);
      await updateProfile({
        preferences
      });
      toast.success('Préférences mises à jour');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setUpdating(false);
    }
  };

  const handleBecomeFournisseur = async () => {
    if (!user) return;
    
    try {
      setIsBecomingFournisseur(true);
      const updatedUser = await becomeFournisseur(user.id);
      setProfileData(updatedUser);
      toast.success('Vous êtes maintenant un fournisseur!');
    } catch (error) {
      console.error('Error becoming supplier:', error);
      toast.error('Erreur lors du changement de rôle');
    } finally {
      setIsBecomingFournisseur(false);
    }
  };

  const handleLanguageChange = (lang: 'fr' | 'en' | 'ar') => {
    setPreferences({
      ...preferences,
      language: lang
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences({
      ...preferences,
      theme
    });
  };

  const handleNotificationChange = (type: 'email' | 'app', enabled: boolean) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [type]: enabled
      }
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green-500" />
      </div>
    );
  }

  // Ensure profileData has email_verified field for compatibility with auth.User type
  const authUser: User = {
    ...profileData,
    email_verified: profileData.email_verified ?? false
  };

  return (
    
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="info" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Préférences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Rôles</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <ProfileInfo user={authUser} onUpdate={handleUpdateProfile} />
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences d'affichage</CardTitle>
              <CardDescription>Personnalisez l'apparence et le comportement de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Thème</h3>
                <ThemeSelector 
                  theme={preferences.theme} 
                  onChange={handleThemeChange}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Langue</h3>
                <LanguageSelector 
                  language={preferences.language} 
                  onChange={handleLanguageChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdatePreferences}
                disabled={updating}
                className="ml-auto"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications par email</h3>
                  <p className="text-sm text-gray-500">Recevez des notifications par email</p>
                </div>
                <Switch 
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications dans l'application</h3>
                  <p className="text-sm text-gray-500">Recevez des notifications dans l'application</p>
                </div>
                <Switch 
                  checked={preferences.notifications.app}
                  onCheckedChange={(checked) => handleNotificationChange('app', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpdatePreferences}
                disabled={updating}
                className="ml-auto"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer les préférences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>Gérez la sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Statut du compte</h3>
                <div className="flex items-center">
                  {profileData.email_verified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Adresse email vérifiée</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Adresse email non vérifiée</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Modifier le mot de passe</h3>
                <div className="space-y-2">
                  <Input type="password" placeholder="Ancien mot de passe" />
                  <Input type="password" placeholder="Nouveau mot de passe" />
                  <Input type="password" placeholder="Confirmer le nouveau mot de passe" />
                  <Button className="w-full">Changer le mot de passe</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Sessions</h3>
                <Button variant="destructive" onClick={handleLogout}>
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rôles et permissions</CardTitle>
              <CardDescription>Gérez votre rôle sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Rôle actuel</h3>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-agri-green-500 mr-2" />
                    <span className="capitalize">{profileData.role}</span>
                  </div>
                </div>
                
                {profileData.role === 'user' && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Devenir fournisseur</h3>
                    <p className="text-gray-600 mb-4">
                      En tant que fournisseur, vous pouvez proposer vos produits et services aux agriculteurs sur la plateforme.
                    </p>
                    <Button 
                      onClick={handleBecomeFournisseur}
                      disabled={isBecomingFournisseur}
                    >
                      {isBecomingFournisseur ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <FileCheck className="mr-2 h-4 w-4" />
                          Devenir fournisseur
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
