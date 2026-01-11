import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Plus, Target, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function GoalsTab() {
  const { currentUser, goals, addGoal, updateGoal, deleteGoal } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [motivation, setMotivation] = useState('');
  const [fear, setFear] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private');

  const userGoals = goals.filter(g => g.userId === currentUser?.id);
  const activeGoals = userGoals.filter(g => g.status === 'active');
  const completedGoals = userGoals.filter(g => g.status === 'completed');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMotivation('');
    setFear('');
    setDifficulty(5);
    setVisibility('private');
    setEditingGoal(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!title || !currentUser) return;

    if (editingGoal) {
      updateGoal(editingGoal, {
        title,
        description,
        motivation,
        fear,
        difficulty,
        visibility,
      });
    } else {
      addGoal({
        userId: currentUser.id,
        title,
        description,
        motivation,
        fear,
        difficulty,
        progress: 0,
        status: 'active',
        visibility,
        linkedHabits: [],
        createdAt: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const handleEdit = (goal: typeof goals[0]) => {
    setTitle(goal.title);
    setDescription(goal.description);
    setMotivation(goal.motivation);
    setFear(goal.fear || '');
    setDifficulty(goal.difficulty);
    setVisibility(goal.visibility);
    setEditingGoal(goal.id);
    setShowForm(true);
  };

  const handleProgressChange = (goalId: string, progress: number) => {
    updateGoal(goalId, { 
      progress,
      status: progress >= 100 ? 'completed' : 'active'
    });
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold">Objectifs</h1>
          <p className="text-muted-foreground mt-1">Vos aspirations profondes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau
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
            <h3 className="text-lg font-semibold">
              {editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </h3>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quel est votre objectif?"
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
                placeholder="Décrivez cet objectif en détail..."
                className="w-full input-nexus bg-secondary/50 resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Pourquoi cet objectif? (Motivation profonde)
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Qu'est-ce qui vous motive vraiment?"
                className="w-full input-nexus bg-secondary/50 resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Peur associée (optionnel)
              </label>
              <textarea
                value={fear}
                onChange={(e) => setFear(e.target.value)}
                placeholder="Qu'est-ce qui vous fait peur dans cet objectif?"
                className="w-full input-nexus bg-secondary/50 resize-none h-16"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Difficulté perçue
                </label>
                <span className="text-primary font-medium">{difficulty}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
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
              <button onClick={resetForm} className="flex-1 btn-secondary">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title}
                className="flex-1 btn-primary"
              >
                {editingGoal ? 'Sauvegarder' : 'Créer'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">Objectifs actifs</h2>
          <div className="space-y-4">
            {activeGoals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(goal.createdAt), 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="text-primary font-medium">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => handleProgressChange(goal.id, Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="mood-badge">
                    Difficulté: {goal.difficulty}/10
                  </span>
                  <span className="mood-badge capitalize">
                    {goal.visibility === 'private' ? '🔒 Privé' : goal.visibility === 'friends' ? '👥 Amis' : '🌍 Public'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-success">Objectifs atteints ✓</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <motion.div
                key={goal.id}
                className="glass-card p-4 flex items-center gap-4 opacity-75"
              >
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium line-through">{goal.title}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {userGoals.length === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Aucun objectif pour le moment.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Créez votre premier objectif pour commencer votre voyage.
          </p>
        </motion.div>
      )}
    </div>
  );
}
