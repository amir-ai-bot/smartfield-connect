
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileBox, Store, TrendingUp } from 'lucide-react';

import { getAdminStats } from '@/services/adminService';

const AdminStats = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    projectCount: 0,
    supplierCount: 0,
    activeProjects: 0,
    newUsersThisMonth: 0,
    usersByRole: {
      user: 0,
      admin: 0,
      fournisseur: 0,
      pending_fournisseur: 0,
    },
    projectsByStatus: {
      planning: 0,
      active: 0,
      completed: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        if (data) {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Utilisateurs</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats.userCount}</p>
            )}
            {!loading && stats.newUsersThisMonth > 0 && (
              <p className="text-xs text-green-600 mt-1">
                +{stats.newUsersThisMonth} ce mois
              </p>
            )}
          </div>
          <div className="rounded-full p-3 bg-blue-100">
            <Users className="h-6 w-6 text-blue-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Projets</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats.projectCount}</p>
            )}
            {!loading && (
              <p className="text-xs text-blue-600 mt-1">
                {stats.activeProjects} projets actifs
              </p>
            )}
          </div>
          <div className="rounded-full p-3 bg-green-100">
            <FileBox className="h-6 w-6 text-green-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Fournisseurs</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats.supplierCount}</p>
            )}
            {!loading && stats.usersByRole.pending_fournisseur > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {stats.usersByRole.pending_fournisseur} en attente
              </p>
            )}
          </div>
          <div className="rounded-full p-3 bg-purple-100">
            <Store className="h-6 w-6 text-purple-700" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Projets Actifs</p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats.activeProjects}</p>
            )}
            {!loading && (
              <p className="text-xs text-gray-600 mt-1">
                sur {stats.projectCount} projets
              </p>
            )}
          </div>
          <div className="rounded-full p-3 bg-amber-100">
            <TrendingUp className="h-6 w-6 text-amber-700" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
