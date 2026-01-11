import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore, ResourceMember } from '@/lib/store';
import { Plus, Users, Trash2, UserPlus, X, Image, Edit3 } from 'lucide-react';

export function GroupsTab() {
  const { currentUser, resourceGroups, addResourceGroup, updateResourceGroup, deleteResourceGroup } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  
  // Member form
  const [showMemberForm, setShowMemberForm] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberNotes, setMemberNotes] = useState('');
  const [memberImage, setMemberImage] = useState('');

  const userGroups = resourceGroups.filter(g => g.userId === currentUser?.id);

  const handleCreate = () => {
    if (!name || !currentUser) return;
    
    if (editingGroupId) {
      updateResourceGroup(editingGroupId, { name, description, color });
    } else {
      addResourceGroup({
        userId: currentUser.id,
        name,
        description,
        color,
        members: [],
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#3b82f6');
    setEditingGroupId(null);
    setShowForm(false);
  };

  const handleEdit = (group: typeof resourceGroups[0]) => {
    setName(group.name);
    setDescription(group.description || '');
    setColor(group.color);
    setEditingGroupId(group.id);
    setShowForm(true);
  };

  const handleAddMember = (groupId: string) => {
    if (!memberName.trim()) return;

    const group = resourceGroups.find(g => g.id === groupId);
    if (!group) return;

    const newMember: ResourceMember = {
      id: Math.random().toString(36).substring(2, 15),
      name: memberName,
      notes: memberNotes,
      image: memberImage,
    };

    updateResourceGroup(groupId, {
      members: [...group.members, newMember]
    });

    setMemberName('');
    setMemberNotes('');
    setMemberImage('');
    setShowMemberForm(null);
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    const group = resourceGroups.find(g => g.id === groupId);
    if (!group) return;

    updateResourceGroup(groupId, {
      members: group.members.filter(m => m.id !== memberId)
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMemberImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold">Groupes</h1>
          <p className="text-muted-foreground mt-1">Vos cercles de ressources</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouveau
        </button>
      </motion.div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold">
              {editingGroupId ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h3>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nom du groupe (ex: Amis proches, Famille...)"
              className="w-full input-nexus bg-secondary/50"
            />

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="w-full input-nexus bg-secondary/50 resize-none h-20"
            />

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Couleur</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer"
                />
                <div className="flex gap-2">
                  {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'].map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-background' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={resetForm} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 btn-primary">
                {editingGroupId ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <div className="space-y-6">
        {userGroups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden"
          >
            {/* Group Header */}
            <div 
              className="p-5 flex items-center gap-4"
              style={{ borderLeft: `4px solid ${group.color}` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: group.color + '30' }}
              >
                <Users className="w-7 h-7" style={{ color: group.color }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {group.members.length} membre{group.members.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setShowMemberForm(group.id)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={() => deleteResourceGroup(group.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>

            {/* Add Member Form */}
            <AnimatePresence>
              {showMemberForm === group.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/50"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Ajouter un membre</h4>
                      <button onClick={() => setShowMemberForm(null)} className="p-1 rounded hover:bg-secondary">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {memberImage ? (
                        <div className="relative">
                          <img src={memberImage} alt="" className="w-20 h-20 rounded-xl object-cover" />
                          <button
                            onClick={() => setMemberImage('')}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors">
                          <Image className="w-6 h-6 text-muted-foreground" />
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}

                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={memberName}
                          onChange={e => setMemberName(e.target.value)}
                          placeholder="Nom de la personne"
                          className="w-full input-nexus bg-secondary/50"
                        />
                        <textarea
                          value={memberNotes}
                          onChange={e => setMemberNotes(e.target.value)}
                          placeholder="Notes, souvenirs, mots importants..."
                          className="w-full input-nexus bg-secondary/50 resize-none h-16 text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddMember(group.id)}
                      disabled={!memberName.trim()}
                      className="w-full btn-primary"
                    >
                      Ajouter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Members */}
            {group.members.length > 0 && (
              <div className="border-t border-border/50 p-5">
                <div className="grid gap-3">
                  {group.members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl"
                    >
                      {member.image ? (
                        <img src={member.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                          style={{ backgroundColor: group.color + '30', color: group.color }}
                        >
                          {member.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{member.name}</p>
                        {member.notes && (
                          <p className="text-sm text-muted-foreground truncate">{member.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveMember(group.id, member.id)}
                        className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {userGroups.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun groupe créé.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez des groupes pour organiser les personnes importantes dans votre vie.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
