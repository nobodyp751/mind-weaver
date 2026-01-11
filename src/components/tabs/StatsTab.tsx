import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Heart,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { format, subDays, startOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export function StatsTab() {
  const { currentUser, moodEntries, goals, achievements, habits } = useNexusStore();

  const userMoods = moodEntries.filter(m => m.userId === currentUser?.id);
  const userGoals = goals.filter(g => g.userId === currentUser?.id);
  const userAchievements = achievements.filter(a => a.userId === currentUser?.id);
  const userHabits = habits.filter(h => h.userId === currentUser?.id);

  // Calculate stats
  const avgMoodScore = userMoods.length > 0
    ? Math.round(userMoods.reduce((acc, m) => acc + m.moodScore, 0) / userMoods.length * 10) / 10
    : 0;

  const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'));
  const moodsLast30 = last30Days.map(date => userMoods.find(m => m.date === date));
  const filledDays = moodsLast30.filter(Boolean).length;

  const moodVariability = userMoods.length > 1
    ? Math.round(
        Math.sqrt(
          userMoods.reduce((acc, m) => acc + Math.pow(m.moodScore - avgMoodScore, 2), 0) / userMoods.length
        ) * 10
      ) / 10
    : 0;

  const activeGoals = userGoals.filter(g => g.status === 'active').length;
  const completedGoals = userGoals.filter(g => g.status === 'completed').length;
  const goalCompletionRate = userGoals.length > 0
    ? Math.round((completedGoals / userGoals.length) * 100)
    : 0;

  const totalHabitCompletions = userHabits.reduce((acc, h) => acc + h.completedDates.length, 0);

  // Mood distribution
  const moodDistribution = userMoods.reduce((acc, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodLabels: Record<string, { label: string; color: string; emoji: string }> = {
    joy: { label: 'Joie', color: 'bg-mood-joy', emoji: '😊' },
    calm: { label: 'Calme', color: 'bg-mood-calm', emoji: '😌' },
    energy: { label: 'Énergie', color: 'bg-mood-energy', emoji: '⚡' },
    love: { label: 'Amour', color: 'bg-mood-love', emoji: '❤️' },
    neutral: { label: 'Neutre', color: 'bg-mood-neutral', emoji: '😐' },
    sadness: { label: 'Tristesse', color: 'bg-mood-sadness', emoji: '😢' },
    anxiety: { label: 'Anxiété', color: 'bg-mood-anxiety', emoji: '😰' },
    anger: { label: 'Colère', color: 'bg-mood-anger', emoji: '😤' },
  };

  const topMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-serif font-bold">Analyse</h1>
        <p className="text-muted-foreground mt-1">Vos statistiques personnelles</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Mood moyen</span>
          </div>
          <p className="text-3xl font-bold">{avgMoodScore}/10</p>
          <p className="text-xs text-muted-foreground mt-1">
            Basé sur {userMoods.length} entrées
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Variabilité</span>
          </div>
          <p className="text-3xl font-bold">{moodVariability}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Écart-type émotionnel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Objectifs</span>
          </div>
          <p className="text-3xl font-bold">{goalCompletionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {completedGoals} complétés / {userGoals.length} total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Habitudes</span>
          </div>
          <p className="text-3xl font-bold">{totalHabitCompletions}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complétions totales
          </p>
        </motion.div>
      </div>

      {/* Mood Graph - Last 30 Days */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="font-medium mb-4">Évolution du mood (30 jours)</h3>
        <div className="h-32 flex items-end gap-1">
          {moodsLast30.map((mood, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-300"
              style={{
                height: mood ? `${mood.moodScore * 10}%` : '10%',
                backgroundColor: mood 
                  ? `hsl(var(--mood-${mood.mood}))` 
                  : 'hsl(var(--secondary))',
                minHeight: '4px',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Il y a 30 jours</span>
          <span>Aujourd'hui</span>
        </div>
      </motion.div>

      {/* Mood Distribution */}
      {Object.keys(moodDistribution).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h3 className="font-medium mb-4">Distribution des émotions</h3>
          <div className="space-y-3">
            {Object.entries(moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => {
                const info = moodLabels[mood];
                const percentage = Math.round((count / userMoods.length) * 100);
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{info?.emoji}</span>
                        <span>{info?.label || mood}</span>
                      </span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className={`h-full ${info?.color || 'bg-primary'}`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Top Mood */}
      {topMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Émotion dominante</p>
          <span className="text-5xl mb-3 block">
            {moodLabels[topMood[0]]?.emoji}
          </span>
          <p className="font-medium text-lg">{moodLabels[topMood[0]]?.label}</p>
          <p className="text-sm text-muted-foreground">
            {topMood[1]} fois enregistré
          </p>
        </motion.div>
      )}

      {/* Consistency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Consistance (30 jours)</h3>
          <span className="text-primary font-bold">{Math.round((filledDays / 30) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(filledDays / 30) * 100}%` }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="h-full bg-primary"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {filledDays} jours sur 30 complétés
        </p>
      </motion.div>
    </div>
  );
}
