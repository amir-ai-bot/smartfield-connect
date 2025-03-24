
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Clipboard, Settings, DatabaseZap } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Administration - AgriSmart';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8 mt-14 md:mt-20">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600">
          Bienvenue, {user?.name}. Gérez votre application depuis ce panneau d'administration.
        </p>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center justify-center">
              <Clipboard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Projets</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center justify-center">
              <DatabaseZap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Base de données</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Consultez et gérez les comptes utilisateurs de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Utilisateurs</div>
                      <Button size="sm">Ajouter un utilisateur</Button>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Liste des utilisateurs connectée à Supabase. 
                        Les statistiques et données réelles seront accessibles une fois l'intégration complétée.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des projets</CardTitle>
                <CardDescription>
                  Consultez et gérez tous les projets de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Projets</div>
                      <Button size="sm">Ajouter un projet</Button>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Gestion des projets connectée à Supabase.
                        Les statistiques et données réelles seront accessibles une fois l'intégration complétée.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Base de données</CardTitle>
                <CardDescription>
                  Consultez et gérez les données de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Tables</div>
                      <Button size="sm">Explorer les données</Button>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Base de données connectée à Supabase.
                        Les statistiques et données réelles seront accessibles une fois l'intégration complétée.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Configuration</div>
                      <Button size="sm">Sauvegarder</Button>
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Paramètres connectés à Supabase.
                        Les configurations réelles seront accessibles une fois l'intégration complétée.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
