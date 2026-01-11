import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Plus, Repeat, Trash2, Check, Flame, Calendar } from 'lucide-react';
import { format, isToday, subDays, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export function HabitsTab() {
  const { currentUser, habits, addHabit, updateHabit, deleteHabit, completeHabit } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isPublic, setIsPublic] = useState(false);

  const userHabits = habits.filter(h => h.userId === currentUser?.id);
  const today = format(new Date(), 'yyyy-MM-dd');

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const handleCreate = () => {
    if (!title.trim() || !currentUser) return;

    addHabit({
      userId: currentUser.id,
      title,
      description,
      frequency,
      streak: 0,
      completedDates: [],
      isPublic,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setFrequency('daily');
    setIsPublic(false);
    setShowForm(false);
  };

  const toggleComplete = (habitId: string) => {
    completeHabit(habitId, today);
  };

  const isCompletedToday = (habit: typeof habits[0]) => {
    return habit.completedDates.includes(today);
  };

  const getStreak = (habit: typeof habits[0]) => {
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else if (!isToday(checkDate)) {
        break;
      } else {
        checkDate = subDays(checkDate, 1);
      }
    }
    
    return streak;
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold">Habitudes</h1>
          <p className="text-muted-foreground mt-1">Cultivez vos routines</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Aujourd'hui</h3>
          <span className="text-primary font-bold">
            {userHabits.filter(h => isCompletedToday(h)).length}/{userHabits.length}
          </span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: userHabits.length > 0 
                ? `${(userHabits.filter(h => isCompletedToday(h)).length / userHabits.length) * 100}%` 
                : '0%' 
            }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold">Nouvelle habitude</h3>

            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nom de l'habitude"
              className="w-full input-nexus bg-secondary/50"
            />

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="w-full input-nexus bg-secondary/50 resize-none h-20"
            />

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Fréquence</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFrequency('daily')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    frequency === 'daily' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  Quotidien
                </button>
                <button
                  onClick={() => setFrequency('weekly')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    frequency === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  Hebdomadaire
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <span>Visible sur le feed</span>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-foreground transition-transform ${isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={handleCreate} disabled={!title.trim()} className="flex-1 btn-primary">Créer</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-4">
        {userHabits.map((habit, i) => {
          const completed = isCompletedToday(habit);
          const streak = getStreak(habit);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 transition-all ${completed ? 'border-success/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(habit.id)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    completed 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {completed ? <Check className="w-6 h-6" /> : <Repeat className="w-6 h-6 text-muted-foreground" />}
                </button>

                <div className="flex-1">
                  <h3 className={`font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                  )}
                  
                  {/* Streak */}
                  {streak > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <Flame className="w-4 h-4 text-warning" />
                      <span className="text-warning font-medium">{streak} jours</span>
                    </div>
                  )}

                  {/* Week view */}
                  <div className="flex gap-1 mt-3">
                    {last7Days.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isDone = habit.completedDates.includes(dateStr);
                      return (
                        <div
                          key={dateStr}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                            isDone ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
                          }`}
                          title={format(day, 'd MMM', { locale: fr })}
                        >
                          {format(day, 'E', { locale: fr })[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {userHabits.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <Repeat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune habitude créée.</p>
            <p className="text-sm text-muted-foreground mt-1">Commencez à cultiver vos routines.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
