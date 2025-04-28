import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  Lock, 
  Languages, 
  Settings, 
  HelpCircle,
  FileText,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  EyeOff,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserPreferences } from '@/types/auth';
import { notificationService } from '@/services/notificationService';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ar'>(
    (user?.preferences?.language as 'fr' | 'en' | 'ar') || 'fr'
  );
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    weatherAlerts: notificationService.getPreference('weatherAlerts'),
    taskReminders: notificationService.getPreference('taskReminders'),
    agriculturalRecommendations: notificationService.getPreference('agriculturalRecommendations'),
    irrigationAlerts: notificationService.getPreference('irrigationAlerts'),
    supplierMessages: notificationService.getPreference('supplierMessages'),
  });

  const [notificationFrequency, setNotificationFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');

  useEffect(() => {
    if (user?.preferences?.language) {
      setSelectedLanguage(user.preferences.language as 'fr' | 'en' | 'ar');
    }
  }, [user]);

  const goBack = () => {
    setActiveDetail(null);
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Échec de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language: 'fr' | 'en' | 'ar') => {
    setSelectedLanguage(language);
    
    try {
      const updatedPreferences: UserPreferences = {
        ...user?.preferences,
        language: language
      };
      
      await updateProfile({ preferences: updatedPreferences });
      toast.success('Langue mise à jour avec succès');
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast.error('Échec de la mise à jour de la langue');
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    notificationService.setPreference(key, value);
  };

  const handleSavePreferences = () => {
    // Save frequency preference
    localStorage.setItem('notificationFrequency', notificationFrequency);
    
    // Show success notification
    notificationService.show(
      'Préférences de notification enregistrées',
      'Succès',
      { type: 'success' }
    );
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-card text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">Session expirée</h3>
          <p className="text-gray-600 mb-4">Veuillez vous connecter pour accéder à votre profil</p>
          <Button>Se connecter</Button>
        </div>
      </div>
    );
  }
  
  const renderDetailView = () => {
    switch (activeDetail) {
      case 'notifications':
        return (
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Paramètres de notification</CardTitle>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Notifications sur l'application</h3>
                <div className="space-y-3">
                  {[
                    { key: 'weatherAlerts', label: 'Alertes météo' },
                    { key: 'taskReminders', label: 'Rappels de tâches' },
                    { key: 'agriculturalRecommendations', label: 'Recommandations agricoles' },
                    { key: 'irrigationAlerts', label: 'Alertes d\'irrigation' },
                    { key: 'supplierMessages', label: 'Messages des fournisseurs' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="text-sm">{item.label}</div>
                      <Switch
                        checked={notificationPreferences[item.key as keyof typeof notificationPreferences]}
                        onCheckedChange={(checked) => handlePreferenceChange(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Fréquence des notifications</h3>
                <Tabs 
                  value={notificationFrequency} 
                  onValueChange={(value) => setNotificationFrequency(value as typeof notificationFrequency)}
                >
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="immediate">Immédiate</TabsTrigger>
                    <TabsTrigger value="daily">Quotidienne</TabsTrigger>
                    <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={goBack}>
                Annuler
              </Button>
              <Button 
                className="bg-agri-green-500 hover:bg-agri-green-600"
                onClick={handleSavePreferences}
              >
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 'security':
        return (
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Sécurité du compte</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={goBack}>
                Annuler
              </Button>
              <Button 
                className="bg-agri-green-500 hover:bg-agri-green-600"
                onClick={handleUpdatePassword}
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 'language':
        return (
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Paramètres de langue</CardTitle>
                <CardDescription>Modifiez la langue de l'application</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant={selectedLanguage === 'fr' ? 'default' : 'outline'}
                    className={`flex flex-col items-center justify-center h-24 hover:bg-gray-50 ${
                      selectedLanguage === 'fr' ? 'bg-agri-green-500 hover:bg-agri-green-600 text-white' : ''
                    }`}
                    onClick={() => handleLanguageChange('fr')}
                  >
                    <span className="text-lg">🇫🇷</span>
                    <span className="mt-2 font-medium">Français</span>
                    {selectedLanguage === 'fr' && (
                      <span className="text-xs mt-1">Active</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant={selectedLanguage === 'en' ? 'default' : 'outline'}
                    className={`flex flex-col items-center justify-center h-24 hover:bg-gray-50 ${
                      selectedLanguage === 'en' ? 'bg-agri-green-500 hover:bg-agri-green-600 text-white' : ''
                    }`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    <span className="text-lg">🇬🇧</span>
                    <span className="mt-2 font-medium">English</span>
                    {selectedLanguage === 'en' && (
                      <span className="text-xs mt-1">Active</span>
                    )}
                    {selectedLanguage !== 'en' && (
                      <span className="text-xs text-gray-500 mt-1">Bientôt disponible</span>
                    )}
                  </Button>
                  
                  <Button 
                    variant={selectedLanguage === 'ar' ? 'default' : 'outline'}
                    className={`flex flex-col items-center justify-center h-24 hover:bg-gray-50 ${
                      selectedLanguage === 'ar' ? 'bg-agri-green-500 hover:bg-agri-green-600 text-white' : ''
                    }`}
                    onClick={() => handleLanguageChange('ar')}
                  >
                    <span className="text-lg">🇹🇳</span>
                    <span className="mt-2 font-medium">العربية</span>
                    {selectedLanguage === 'ar' && (
                      <span className="text-xs mt-1">Active</span>
                    )}
                    {selectedLanguage !== 'ar' && (
                      <span className="text-xs text-gray-500 mt-1">Bientôt disponible</span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={goBack}>
                Annuler
              </Button>
              <Button 
                className="bg-agri-green-500 hover:bg-agri-green-600"
                onClick={goBack}
              >
                Fermer
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 'settings':
        return (
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Paramètres du compte</CardTitle>
                <CardDescription>Gérez les paramètres généraux de votre compte</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Thème de l'application</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4"
                    >
                      <Settings className="h-5 w-5 mb-2" />
                      <span className="text-sm font-medium">Système</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4 bg-gray-50"
                    >
                      <Sun className="h-5 w-5 mb-2 text-yellow-500" />
                      <span className="text-sm font-medium">Clair</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4"
                    >
                      <Moon className="h-5 w-5 mb-2 text-indigo-600" />
                      <span className="text-sm font-medium">Sombre</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Confidentialité</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profil public</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Partage des données</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Localisation visible</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Session</h3>
                  <Button variant="destructive" className="w-full">
                    Déconnecter tous les appareils
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={goBack}>
                Annuler
              </Button>
              <Button className="bg-agri-green-500 hover:bg-agri-green-600">
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        );
      
      case 'help':
        return (
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-display">Centre d'aide</CardTitle>
                <CardDescription>Obtenez de l'aide et consultez les informations sur l'application</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </CardHeader>
            <CardContent className="py-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
                  >
                    <BookOpen className="h-6 w-6 mb-2 text-agri-green-600" />
                    <span className="font-medium">Guide d'utilisation</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
                  >
                    <FileText className="h-6 w-6 mb-2 text-agri-green-600" />
                    <span className="font-medium">Tutoriels</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
                  >
                    <MessageSquare className="h-6 w-6 mb-2 text-agri-green-600" />
                    <span className="font-medium">Support technique</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 hover:bg-gray-50"
                  >
                    <Info className="h-6 w-6 mb-2 text-agri-green-600" />
                    <span className="font-medium">À propos</span>
                  </Button>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Besoin d'aide supplémentaire ?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Notre équipe de support est disponible pour vous aider avec toutes vos questions.
                  </p>
                  <Button className="w-full bg-agri-green-500 hover:bg-agri-green-600">
                    Contacter le support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return <ProfileInfo user={user} onBack={goBack} onUpdate={updateProfile} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row mb-8">
          <div className="md:w-1/3 lg:w-1/4 md:pr-8">
            <div className="bg-white rounded-xl shadow-card p-6 text-center mb-6 animate-slide-up">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </div>
              
              <h2 className="font-display text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600 mb-3">{user.role === 'admin' ? 'Administrateur' : user.role === 'fournisseur' ? 'Fournisseur' : 'Agriculteur'}</p>
              
              <div className="space-y-2 text-left mb-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{user.phone_number}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
              </div>
              
              <Button 
                className="w-full bg-agri-green-500 hover:bg-agri-green-600"
                onClick={() => {
                  setActiveDetail(null);
                  setActiveTab('profile');
                }}
              >
                Modifier le profil
              </Button>
            </div>
            
            <Card className="shadow-card mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div className="space-y-1">
                  {[
                    { icon: <User className="h-4 w-4 mr-3" />, label: 'Profil', value: 'profile' },
                    { icon: <Bell className="h-4 w-4 mr-3" />, label: 'Notifications', value: 'notifications' },
                    { icon: <Lock className="h-4 w-4 mr-3" />, label: 'Sécurité', value: 'security' },
                    { icon: <Languages className="h-4 w-4 mr-3" />, label: 'Langue', value: 'language' },
                    { icon: <Settings className="h-4 w-4 mr-3" />, label: 'Paramètres', value: 'settings' },
                    { icon: <HelpCircle className="h-4 w-4 mr-3" />, label: 'Aide', value: 'help' },
                  ].map((item) => (
                    <button
                      key={item.value}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                        activeTab === item.value && !activeDetail
                          ? 'bg-agri-green-50 text-agri-green-700'
                          : activeDetail === item.value
                          ? 'bg-agri-green-50 text-agri-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setActiveTab(item.value);
                        if (item.value !== 'profile') {
                          setActiveDetail(item.value);
                        } else {
                          setActiveDetail(null);
                        }
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Ressources</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div className="space-y-1">
                  {[
                    { icon: <FileText className="h-4 w-4 mr-3" />, label: 'Documents' },
                    { icon: <BookOpen className="h-4 w-4 mr-3" />, label: 'Guides agricoles' },
                    { icon: <MessageSquare className="h-4 w-4 mr-3" />, label: 'Support' },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:w-2/3 lg:w-3/4 mt-6 md:mt-0">
            {activeDetail ? (
              renderDetailView()
            ) : (
              <ProfileInfo user={user} onUpdate={updateProfile} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

// Missing imports
function Info(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

function Moon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  );
}

function Sun(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  );
}
