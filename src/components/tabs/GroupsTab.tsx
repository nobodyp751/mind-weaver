import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Plus, Users, Trash2, UserPlus, Image } from 'lucide-react';

export function GroupsTab() {
  const { currentUser, resourceGroups, addResourceGroup, updateResourceGroup, deleteResourceGroup } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const userGroups = resourceGroups.filter(g => g.userId === currentUser?.id);

  const handleCreate = () => {
    if (!name || !currentUser) return;
    addResourceGroup({
      userId: currentUser.id,
      name,
      color,
      members: [],
      createdAt: new Date().toISOString(),
    });
    setName('');
    setShowForm(false);
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Groupes</h1>
          <p className="text-muted-foreground mt-1">Vos cercles de ressources</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom du groupe" className="w-full input-nexus bg-secondary/50" />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-12 rounded-xl" />
          <div className="flex gap-4">
            <button onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Annuler</button>
            <button onClick={handleCreate} className="flex-1 btn-primary">Créer</button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        {userGroups.map(group => (
          <motion.div key={group.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: group.color + '30' }}>
                <Users className="w-6 h-6" style={{ color: group.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-muted-foreground">{group.members.length} membres</p>
              </div>
              <button onClick={() => deleteResourceGroup(group.id)} className="p-2 rounded-lg hover:bg-destructive/20">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {userGroups.length === 0 && !showForm && (
        <div className="glass-card p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Créez des groupes pour organiser vos proches</p>
        </div>
      )}
    </div>
  );
}
