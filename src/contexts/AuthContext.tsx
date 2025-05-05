import React, { 
  createContext, 
  useState, 
  useEffect, 
  useContext, 
  ReactNode,
  useCallback 
} from 'react';
import { 
  supabase, 
  Session, 
  AuthChangeEvent, 
  SupabaseClient 
} from '@/integrations/supabase/client';
import { 
  User as SupabaseUser,
  User,
  Supplier
} from '@/types/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  supabaseClient: SupabaseClient | null;
  isLoading: boolean;
  signUp: (email: string, password?: string) => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  getProfile: () => Promise<void>;
  isFournisseurFavorite: (supplierId: string) => Promise<boolean>;
  toggleFavoriteFournisseur: (supplierId: string) => Promise<void>;
  favoriteSuppliers: Supplier[];
  isInitialized: boolean;
  isAdmin: boolean;
  isFournisseur: boolean;
  isPendingFournisseur: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<Supplier[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFournisseur, setIsFournisseur] = useState(false);
  const [isPendingFournisseur, setIsPendingFournisseur] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        await getProfile();
      });
    };

    loadSession();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      await getProfile();
      setIsInitialized(true);
    };

    if (session) {
      loadUser();
    } else {
      setUser(null);
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [session]);

  const getProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profile, error, status } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          display_name, 
          avatar, 
          role, 
          bio, 
          address, 
          phone_number, 
          created_at, 
          updated_at
        `)
        .eq('id', session?.user.id)
        .single();

      if (error && status !== 406) {
        console.error('Error fetching profile:', error);
        toast.error('Erreur lors du chargement du profil.');
      }

      if (profile) {
        const userProfile: User = {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
          avatar: profile.avatar,
          role: profile.role,
          bio: profile.bio,
          address: profile.address,
          phone_number: profile.phone_number,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
        setUser(userProfile);
        setIsAdmin(profile.role === 'admin');
        setIsFournisseur(profile.role === 'fournisseur');
        setIsPendingFournisseur(profile.role === 'pending_fournisseur');
        await loadFavoriteSuppliers(userProfile.id);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      toast.error('Erreur inattendue lors du chargement du profil.');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const loadFavoriteSuppliers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_favorite_suppliers', { p_user_id: userId });

      if (error) {
        console.error('Error fetching favorite suppliers:', error);
        toast.error('Failed to load favorite suppliers.');
      }

      setFavoriteSuppliers(data || []);
    } catch (error) {
      console.error('Error loading favorite suppliers:', error);
      toast.error('Unexpected error loading favorite suppliers.');
    }
  };

  const signUp = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password || generateRandomPassword(),
        options: {
          data: {
            display_name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/ лица/svg?seed=${email.split('@')[0]}`
          },
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error('Erreur lors de l\'inscription: ' + error.message);
      } else {
        toast.success('Inscription réussie! Veuillez vérifier votre email.');
        navigate('/auth/confirm-email');
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('Erreur inattendue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password || '',
      });

      if (error) {
        console.error('Signin error:', error);
        toast.error('Erreur lors de la connexion: ' + error.message);
      } else {
        toast.success('Connexion réussie!');
        await getProfile();
        navigate('/projects');
      }
    } catch (error) {
      console.error('Unexpected signin error:', error);
      toast.error('Erreur inattendue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
        toast.error('Erreur lors de la déconnexion.');
      } else {
        toast.success('Déconnexion réussie!');
        setUser(null);
        setSession(null);
        navigate('/login');
      }
    } catch (error) {
      console.error('Unexpected signout error:', error);
      toast.error('Erreur inattendue lors de la déconnexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);
  
      if (error) {
        console.error('Update user error:', error);
        toast.error('Erreur lors de la mise à jour du profil.');
      } else {
        toast.success('Profil mis à jour avec succès!');
        await getProfile();
      }
    } catch (error) {
      console.error('Unexpected update user error:', error);
      toast.error('Erreur inattendue lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavoriteFournisseur = async (supplierId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter un fournisseur aux favoris.');
      return;
    }

    try {
      const isCurrentlyFavorite = favoriteSuppliers.some(supplier => supplier.id === supplierId);
      const newFavoriteSuppliers = isCurrentlyFavorite
        ? favoriteSuppliers.filter(supplier => supplier.id !== supplierId)
        : [...favoriteSuppliers, { id: supplierId } as Supplier];

      setFavoriteSuppliers(newFavoriteSuppliers);

      const { data, error } = await supabase.rpc(
        isCurrentlyFavorite ? 'remove_favorite_supplier' : 'add_favorite_supplier',
        {
          p_user_id: user.id,
          p_supplier_id: supplierId,
        }
      );

      if (error) {
        console.error('Error toggling favorite supplier:', error);
        toast.error('Erreur lors de la mise à jour des favoris.');
        // Revert local state on failure
        setFavoriteSuppliers(favoriteSuppliers);
      } else {
        // Optimistically update the UI
        if (isCurrentlyFavorite) {
          setFavoriteSuppliers(favoriteSuppliers.filter(supplier => supplier.id !== supplierId));
        } else {
          // Fetch the supplier and add it to the list
          const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .select('*')
            .eq('id', supplierId)
            .single();

          if (supplierError) {
            console.error('Error fetching supplier:', supplierError);
            toast.error('Erreur lors de la récupération du fournisseur.');
          } else if (supplierData) {
            setFavoriteSuppliers([...favoriteSuppliers, supplierData]);
          }
        }
        toast.success('Favoris mis à jour!');
      }
    } catch (error) {
      console.error('Unexpected error toggling favorite supplier:', error);
      toast.error('Erreur inattendue lors de la mise à jour des favoris.');
      // Revert local state on error
      setFavoriteSuppliers(favoriteSuppliers);
    }
  };

  const isFournisseurFavorite = async (supplierId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_favorite_supplier', {
        p_user_id: user.id,
        p_supplier_id: supplierId
      });

      if (error) {
        console.error('Error checking favorite supplier:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error checking favorite supplier:', error);
      return false;
    }
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  };

  const value = {
    user,
    session,
    supabaseClient: supabase,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateUser,
    getProfile,
    isFournisseurFavorite,
    toggleFavoriteFournisseur,
    favoriteSuppliers,
    isInitialized,
    isAdmin,
    isFournisseur,
    isPendingFournisseur
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
