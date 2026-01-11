import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Heart, 
  Target, 
  Trophy, 
  MessageCircle, 
  BarChart3, 
  BookOpen, 
  Repeat, 
  Users, 
  User, 
  Settings,
  PlusCircle,
  Shield
} from 'lucide-react';
import { useNexusStore } from '@/lib/store';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'mood', label: 'Mood', icon: Heart },
  { id: 'goals', label: 'Objectifs', icon: Target },
  { id: 'achievements', label: 'Réussites', icon: Trophy },
  { id: 'post', label: 'Poster', icon: PlusCircle },
  { id: 'feed', label: 'Feed', icon: MessageCircle },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'habits', label: 'Habitudes', icon: Repeat },
  { id: 'groups', label: 'Groupes', icon: Users },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { currentUser } = useNexusStore();
  
  const items = currentUser?.isAdmin 
    ? [...navItems, { id: 'admin', label: 'Admin', icon: Shield }]
    : navItems;

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50"
    >
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-start gap-1 py-2 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'nav-item flex-shrink-0 min-w-[70px]',
                  isActive && 'active'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                <span className="text-xs font-medium truncate">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
