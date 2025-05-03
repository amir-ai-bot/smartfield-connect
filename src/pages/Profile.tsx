
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from 'react';
import { UserPreferences } from "@/types/auth";
import { toast } from "sonner";
import { Upload, Lock, Bell, Globe, PenSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "@/services/uploadService";
import { useLanguage } from "@/contexts/LanguageContext";
// Rest of your imports

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  // State for profile fields
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [address, setAddress] = useState(user?.address || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  
  // State for avatarPreview
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for preferences
  const [selectedLanguage, setSelectedLanguage] = useState<'fr' | 'en' | 'ar'>(
    user?.preferences?.language || 'fr'
  );
  const [emailNotifications, setEmailNotifications] = useState<boolean>(
    user?.preferences?.notifications?.email ?? true
  );
  const [appNotifications, setAppNotifications] = useState<boolean>(
    user?.preferences?.notifications?.app ?? true
  );
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    user?.preferences?.theme || 'light'
  );

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setPhone(user.phone_number || "");
      setAddress(user.address || "");
      setAvatarUrl(user.avatar || "");
      
      // Set preferences
      if (user.preferences) {
        setSelectedLanguage(user.preferences.language || 'fr');
        setEmailNotifications(user.preferences.notifications?.email ?? true);
        setAppNotifications(user.preferences.notifications?.app ?? true);
        setSelectedTheme(user.preferences.theme || 'light');
      }
    }
  }, [user]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let newAvatarUrl = avatarUrl;
      
      // Upload avatar if changed
      if (avatarFile) {
        const uploadedUrl = await uploadImage(avatarFile, 'avatars');
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }
      
      // Update profile
      await updateProfile({
        name,
        avatar: newAvatarUrl,
        bio,
        phone_number: phone,
        address,
      });
      
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedPreferences: UserPreferences = {
        language: selectedLanguage,
        notifications: {
          email: emailNotifications,
          app: appNotifications
        },
        theme: selectedTheme
      };
      
      await updateProfile({ preferences: updatedPreferences });
      
      // Update language context if changed
      if (selectedLanguage !== language) {
        setLanguage(selectedLanguage);
      }
      
      toast.success("Préférences mises à jour avec succès");
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error("Erreur lors de la mise à jour des préférences");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Veuillez vous connecter pour accéder à votre profil.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et comment les autres vous voient.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitProfile}>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4 mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || avatarUrl} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="avatar" className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded text-sm flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Modifier
                    </Label>
                    <Input 
                      id="avatar" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input 
                      id="name" 
                      placeholder="Votre nom" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user.email} 
                      disabled 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Parlez-nous de vous..." 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+212 XXX XXX XXX" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input 
                      id="address" 
                      placeholder="Votre adresse" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <div>
                    <Badge variant="outline" className="bg-gray-100">
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'fournisseur' ? 'Fournisseur' :
                       user.role === 'pending_fournisseur' ? 'Fournisseur (en attente)' : 'Utilisateur'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handleLogout}>Déconnexion</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <PenSquare className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
              <CardDescription>
                Personnalisez votre expérience et vos notifications.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitPreferences}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={(value) => setSelectedLanguage(value as 'fr' | 'en' | 'ar')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex-1">
                      Email
                      <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                    </Label>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="app-notifications" className="flex-1">
                      Application
                      <p className="text-sm text-gray-500">Recevoir des notifications dans l'application</p>
                    </Label>
                    <Switch 
                      id="app-notifications" 
                      checked={appNotifications}
                      onCheckedChange={setAppNotifications}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Thème
                  </Label>
                  <Select 
                    value={selectedTheme} 
                    onValueChange={(value) => setSelectedTheme(value as 'light' | 'dark' | 'system')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les préférences'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Gérez votre mot de passe et la sécurité de votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Mot de passe
                    </h3>
                    <p className="text-sm text-gray-500">Dernière modification il y a plus de 6 mois</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Changer
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email vérifié</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Badge variant={user.email_verified ? "success" : "destructive"}>
                    {user.email_verified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
