import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileInfo from '@/components/profile/ProfileInfo';
import { Switch } from '@/components/ui/switch';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row mb-8">
          <div className="md:w-1/3 lg:w-1/4 md:pr-8">
            <div className="bg-white rounded-xl shadow-card p-6 text-center mb-6 animate-slide-up">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={user.avatar || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"} />
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
                onClick={() => setActiveTab('profile')}
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
                        activeTab === item.value
                          ? 'bg-agri-green-50 text-agri-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab(item.value)}
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
            {activeTab === 'profile' && (
              <div className="animate-slide-up">
                <ProfileInfo user={user} />
                
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Informations agricoles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="firstName">
                            Prénom
                          </label>
                          <Input id="firstName" defaultValue="Mohamed" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                            Nom
                          </label>
                          <Input id="lastName" defaultValue="Karim" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="email">
                          Adresse e-mail
                        </label>
                        <Input id="email" type="email" defaultValue="mohamed.karim@example.com" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="phone">
                          Téléphone
                        </label>
                        <Input id="phone" defaultValue="+216 98 765 432" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="address">
                          Adresse
                        </label>
                        <Input id="address" defaultValue="Rue des Oliviers, Gafsa" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="bio">
                          Bio
                        </label>
                        <Textarea 
                          id="bio" 
                          rows={4}
                          defaultValue="Agriculteur avec 15 ans d'expérience dans la culture d'oliviers et de palmiers dattiers dans la région de Gafsa."
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Annuler
                    </Button>
                    <Button className="bg-agri-green-500 hover:bg-agri-green-600">
                      Enregistrer
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="animate-slide-up">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Paramètres de notification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Notifications par e-mail</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Alertes météo', defaultChecked: true },
                            { label: 'Rappels de tâches', defaultChecked: true },
                            { label: 'Recommandations agricoles', defaultChecked: true },
                            { label: 'Alertes d&apos;irrigation', defaultChecked: true },
                            { label: 'Bulletins d&apos;information', defaultChecked: false },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="text-sm">{item.label}</div>
                              <Switch defaultChecked={item.defaultChecked} />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Notifications sur l&apos;application</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Alertes météo', defaultChecked: true },
                            { label: 'Rappels de tâches', defaultChecked: true },
                            { label: 'Recommandations agricoles', defaultChecked: true },
                            { label: 'Alertes d&apos;irrigation', defaultChecked: true },
                            { label: 'Messages des fournisseurs', defaultChecked: true },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="text-sm">{item.label}</div>
                              <Switch defaultChecked={item.defaultChecked} />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Fréquence des notifications</h3>
                        <Tabs defaultValue="immediate">
                          <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="immediate">Immédiate</TabsTrigger>
                            <TabsTrigger value="daily">Quotidienne</TabsTrigger>
                            <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="animate-slide-up">
                <Card className="shadow-card mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Sécurité du compte</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">
                          Mot de passe actuel
                        </label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                          Nouveau mot de passe
                        </label>
                        <Input id="newPassword" type="password" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                          Confirmer le mot de passe
                        </label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-agri-green-500 hover:bg-agri-green-600">
                      Mettre à jour le mot de passe
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Paramètres de confidentialité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Profil public</h3>
                          <p className="text-sm text-gray-500">Autoriser les autres utilisateurs à voir votre profil</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Partage des données de culture</h3>
                          <p className="text-sm text-gray-500">Partager vos données agricoles de manière anonyme pour la recherche</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Localisation visible</h3>
                          <p className="text-sm text-gray-500">Permettre aux fournisseurs de voir votre localisation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button className="bg-agri-green-500 hover:bg-agri-green-600">
                      Enregistrer les préférences
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {(activeTab === 'language' || activeTab === 'settings' || activeTab === 'help') && (
              <div className="animate-slide-up">
                <Card className="shadow-card p-8 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {activeTab === 'language' && <Languages className="h-8 w-8 text-gray-500" />}
                    {activeTab === 'settings' && <Settings className="h-8 w-8 text-gray-500" />}
                    {activeTab === 'help' && <HelpCircle className="h-8 w-8 text-gray-500" />}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {activeTab === 'language' && "Paramètres de langue"}
                    {activeTab === 'settings' && "Paramètres du compte"}
                    {activeTab === 'help' && "Centre d&apos;aide"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'language' && "Cette fonctionnalité sera bientôt disponible."}
                    {activeTab === 'settings' && "Les paramètres avancés du compte seront disponibles prochainement."}
                    {activeTab === 'help' && "Notre centre d&apos;aide est en cours de construction."}
                  </p>
                  <Button>
                    {activeTab === 'language' && "Explorer les langues"}
                    {activeTab === 'settings' && "Voir les options de base"}
                    {activeTab === 'help' && "Contacter le support"}
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
