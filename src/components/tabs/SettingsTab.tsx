import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Moon, Lock, Bell, Download, Trash2, LogOut } from 'lucide-react';

export function SettingsTab() {
  const { currentUser, updateUser, logout } = useNexusStore();

  const togglePrivacy = () => {
    if (!currentUser) return;
    updateUser(currentUser.id, { isPrivate: !currentUser.isPrivate });
  };

  const exportData = () => {
    const data = JSON.stringify(useNexusStore.getState(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-export.json';
    a.click();
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif font-bold">Paramètres</h1>
      </motion.div>

      <div className="space-y-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Profil privé</p>
              <p className="text-sm text-muted-foreground">Seuls vos amis peuvent voir votre profil</p>
            </div>
          </div>
          <button onClick={togglePrivacy} className={`w-14 h-8 rounded-full transition-colors ${currentUser?.isPrivate ? 'bg-primary' : 'bg-secondary'}`}>
            <div className={`w-6 h-6 rounded-full bg-foreground transition-transform ${currentUser?.isPrivate ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <button onClick={exportData} className="glass-card p-5 flex items-center gap-4 w-full text-left hover:border-primary/30 transition-colors">
          <Download className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium">Exporter mes données</p>
            <p className="text-sm text-muted-foreground">Télécharger toutes vos données en JSON</p>
          </div>
        </button>

        <button onClick={logout} className="glass-card p-5 flex items-center gap-4 w-full text-left hover:border-destructive/30 transition-colors">
          <LogOut className="w-5 h-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Déconnexion</p>
            <p className="text-sm text-muted-foreground">Se déconnecter de NEXUS</p>
          </div>
        </button>
      </div>
    </div>
  );
}
