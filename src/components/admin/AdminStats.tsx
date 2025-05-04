
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Truck, MessageSquare, CalendarDays, BarChart } from "lucide-react";

interface AdminStatsProps {
  stats: {
    userCount: number;
    projectCount: number;
    supplierCount: number;
    activeProjects: number;
    newUsersThisMonth: number;
    messagesSentToday: number;
    usersByRole: {
      user: number;
      admin: number;
      fournisseur: number;
      pending_fournisseur: number;
    };
    projectsByStatus: {
      planning: number;
      active: number;
      completed: number;
    };
  } | null;
}

export function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-gray-200 rounded w-1/2"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2 w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats.userCount,
      description: `+${stats.newUsersThisMonth} ce mois-ci`,
      icon: <Users className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Projets",
      value: stats.projectCount,
      description: `${stats.activeProjects} projets actifs`,
      icon: <Briefcase className="h-4 w-4 text-green-500" />,
    },
    {
      title: "Fournisseurs",
      value: stats.supplierCount,
      description: `${stats.usersByRole.pending_fournisseur} en attente`,
      icon: <Truck className="h-4 w-4 text-amber-500" />,
    },
    {
      title: "Messages",
      value: stats.messagesSentToday,
      description: "messages aujourd'hui",
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
