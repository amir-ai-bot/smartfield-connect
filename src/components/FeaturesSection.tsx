
import { 
  LayoutDashboard, 
  CloudSun, 
  Sprout, 
  Users, 
  Bell, 
  BookOpen,
  BarChart3,
  RotateCcw
} from 'lucide-react';

const features = [
  {
    icon: <LayoutDashboard className="h-6 w-6" />,
    title: "Tableau de bord intelligent",
    description: "Visualisez tous vos projets agricoles et suivez leur évolution en temps réel.",
    color: "bg-gradient-to-br from-agri-green-400 to-agri-green-500"
  },
  {
    icon: <CloudSun className="h-6 w-6" />,
    title: "Prévisions météo précises",
    description: "Accédez aux prévisions météorologiques locales et recevez des alertes en cas de conditions extrêmes.",
    color: "bg-gradient-to-br from-agri-blue-400 to-agri-blue-500"
  },
  {
    icon: <Sprout className="h-6 w-6" />,
    title: "Gestion des cultures",
    description: "Planifiez vos cultures, suivez leur croissance et optimisez vos rendements.",
    color: "bg-gradient-to-br from-agri-green-500 to-agri-blue-400"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Connexion avec les fournisseurs",
    description: "Trouvez et contactez directement les fournisseurs de semences, d'engrais et d'équipements.",
    color: "bg-gradient-to-br from-agri-blue-500 to-agri-blue-600"
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Système d'alertes",
    description: "Recevez des notifications pour les tâches importantes et les événements critiques.",
    color: "bg-gradient-to-br from-agri-terra-400 to-agri-terra-500"
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Guides interactifs",
    description: "Accédez à des guides de formation et des conseils d'experts pour améliorer vos pratiques agricoles.",
    color: "bg-gradient-to-br from-agri-green-600 to-agri-green-700"
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analyses et rapports",
    description: "Générez des rapports détaillés sur vos activités agricoles et analysez vos performances.",
    color: "bg-gradient-to-br from-agri-blue-600 to-agri-blue-700"
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: "Ressources durables",
    description: "Optimisez l'utilisation des ressources naturelles pour une agriculture plus durable.",
    color: "bg-gradient-to-br from-agri-terra-500 to-agri-terra-600"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
          <div className="inline-block px-3 py-1 mb-4 rounded-full bg-agri-green-50 border border-agri-green-200">
            <p className="text-xs font-medium text-agri-green-600">Fonctionnalités</p>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Tout ce dont vous avez besoin pour gérer votre exploitation
          </h2>
          
          <p className="text-gray-600">
            AgriSmart offre une gamme complète d'outils pour vous aider à planifier, surveiller et optimiser vos activités agricoles.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center mb-5 text-white`}>
                {feature.icon}
              </div>
              
              <h3 className="font-display text-lg font-semibold mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
