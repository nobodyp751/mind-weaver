import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Plus, Trophy, Trash2, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const achievementTypes = [
  { id: 'mental', label: 'Mental', emoji: '🧠' },
  { id: 'emotional', label: 'Émotionnel', emoji: '💖' },
  { id: 'professional', label: 'Professionnel', emoji: '💼' },
  { id: 'social', label: 'Social', emoji: '👥' },
];

export function AchievementsTab() {
  const { currentUser, achievements, addAchievement, updateAchievement, users } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'mental' | 'emotional' | 'professional' | 'social'>('mental');
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private');

  const userAchievements = achievements
    .filter(a => a.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSave = () => {
    if (!title || !currentUser) return;

    addAchievement({
      userId: currentUser.id,
      title,
      description,
      type,
      date: new Date().toISOString(),
      visibility,
      likes: [],
      comments: [],
    });

    setTitle('');
    setDescription('');
    setType('mental');
    setVisibility('private');
    setShowForm(false);
  };

  const handleLike = (achievementId: string) => {
    if (!currentUser) return;
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    const likes = achievement.likes.includes(currentUser.id)
      ? achievement.likes.filter(id => id !== currentUser.id)
      : [...achievement.likes, currentUser.id];

    updateAchievement(achievementId, { likes });
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold">Réussites</h1>
          <p className="text-muted-foreground mt-1">Célébrez vos victoires</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold">Nouvelle réussite</h3>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Titre de la réussite
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Qu'avez-vous accompli?"
                className="w-full input-nexus bg-secondary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez cette victoire..."
                className="w-full input-nexus bg-secondary/50 resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Type de réussite
              </label>
              <div className="grid grid-cols-2 gap-3">
                {achievementTypes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id as typeof type)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      type === t.id
                        ? 'bg-primary/20 ring-2 ring-primary'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{t.emoji}</span>
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Visibilité
              </label>
              <div className="flex gap-3">
                {(['private', 'friends', 'public'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      visibility === v
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {v === 'private' ? 'Privé' : v === 'friends' ? 'Amis' : 'Public'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-secondary">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title}
                className="flex-1 btn-primary"
              >
                Célébrer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Wall */}
      {userAchievements.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">Mur des victoires</h2>
          <div className="grid gap-4">
            {userAchievements.map((achievement, i) => {
              const typeInfo = achievementTypes.find(t => t.id === achievement.type);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="glass-card-hover p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center text-2xl">
                      {typeInfo?.emoji || '🏆'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>{format(new Date(achievement.date), 'd MMM yyyy', { locale: fr })}</span>
                        <span className="capitalize">{typeInfo?.label}</span>
                      </div>
                    </div>
                  </div>

                  {achievement.visibility !== 'private' && (
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50">
                      <button
                        onClick={() => handleLike(achievement.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          achievement.likes.includes(currentUser?.id || '')
                            ? 'text-mood-love'
                            : 'text-muted-foreground hover:text-mood-love'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${
                          achievement.likes.includes(currentUser?.id || '') ? 'fill-current' : ''
                        }`} />
                        <span>{achievement.likes.length}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{achievement.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : !showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-muted-foreground">
            Aucune réussite enregistrée.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Célébrez vos petites et grandes victoires!
          </p>
        </motion.div>
      )}
    </div>
  );
}
