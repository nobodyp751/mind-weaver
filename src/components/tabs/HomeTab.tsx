import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { 
  Smile, 
  Target, 
  Trophy, 
  TrendingUp, 
  Plus, 
  ChevronRight,
  Sun,
  Moon,
  Cloud
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const moodEmojis: Record<string, string> = {
  joy: '😊',
  calm: '😌',
  energy: '⚡',
  love: '❤️',
  sadness: '😢',
  anxiety: '😰',
  anger: '😤',
  neutral: '😐',
};

const moodColors: Record<string, string> = {
  joy: 'text-mood-joy',
  calm: 'text-mood-calm',
  energy: 'text-mood-energy',
  love: 'text-mood-love',
  sadness: 'text-mood-sadness',
  anxiety: 'text-mood-anxiety',
  anger: 'text-mood-anger',
  neutral: 'text-mood-neutral',
};

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

export function HomeTab({ onTabChange }: HomeTabProps) {
  const { currentUser, moodEntries, goals, achievements } = useNexusStore();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayMood = moodEntries.find(m => m.userId === currentUser?.id && m.date === today);
  
  const activeGoals = goals.filter(g => g.userId === currentUser?.id && g.status === 'active');
  const recentAchievements = achievements
    .filter(a => a.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Get last 7 days mood
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const mood = moodEntries.find(m => m.userId === currentUser?.id && m.date === date);
    return { date, mood };
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { icon: Sun, greeting: 'Bonjour' };
    if (hour < 18) return { icon: Cloud, greeting: 'Bon après-midi' };
    return { icon: Moon, greeting: 'Bonsoir' };
  };

  const timeOfDay = getTimeOfDay();
  const TimeIcon = timeOfDay.icon;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <TimeIcon className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">{timeOfDay.greeting}</span>
        </div>
        <h1 className="text-3xl font-serif font-bold">
          {currentUser?.displayName}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </motion.div>

      {/* Today's Mood Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-hover p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mood du jour</h2>
          <button 
            onClick={() => onTabChange('mood')}
            className="text-primary text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            {todayMood ? 'Modifier' : 'Ajouter'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {todayMood ? (
          <div className="flex items-center gap-4">
            <span className={`text-5xl ${moodColors[todayMood.mood]} mood-glow`}>
              {moodEmojis[todayMood.mood]}
            </span>
            <div>
              <p className="font-medium capitalize">{todayMood.mood}</p>
              <p className="text-sm text-muted-foreground">
                Intensité: {todayMood.intensity}%
              </p>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onTabChange('mood')}
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors w-full py-4"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Smile className="w-6 h-6" />
            </div>
            <span>Comment te sens-tu aujourd'hui?</span>
          </button>
        )}
      </motion.div>

      {/* Mini Mood Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">7 derniers jours</h2>
        <div className="flex items-end justify-between gap-2 h-24">
          {last7Days.map(({ date, mood }, i) => (
            <div key={date} className="flex flex-col items-center gap-2 flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: mood ? `${mood.moodScore * 10}%` : '20%' }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                className={`w-full rounded-t-lg ${
                  mood 
                    ? 'bg-primary' 
                    : 'bg-secondary'
                }`}
                style={{ minHeight: '8px' }}
              />
              <span className="text-xs text-muted-foreground">
                {format(new Date(date), 'EEE', { locale: fr })}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        <button 
          onClick={() => onTabChange('post')}
          className="glass-card-hover p-5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <p className="font-medium">Nouvelle entrée</p>
          <p className="text-sm text-muted-foreground">Poster quelque chose</p>
        </button>
        
        <button 
          onClick={() => onTabChange('achievements')}
          className="glass-card-hover p-5 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center mb-3 group-hover:bg-warning/30 transition-colors">
            <Trophy className="w-5 h-5 text-warning" />
          </div>
          <p className="font-medium">Victoire</p>
          <p className="text-sm text-muted-foreground">Marquer une réussite</p>
        </button>
      </motion.div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Objectifs actifs</h2>
            <button 
              onClick={() => onTabChange('goals')}
              className="text-primary text-sm flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {activeGoals.slice(0, 3).map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{goal.title}</p>
                  <div className="w-full h-2 bg-secondary rounded-full mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{goal.progress}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">Dernières réussites</h2>
          <div className="space-y-3">
            {recentAchievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{achievement.type}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Inspirational Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 text-center"
        style={{ background: 'var(--gradient-card)' }}
      >
        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-lg font-serif italic text-foreground/90">
          "Chaque jour est une nouvelle opportunité de grandir."
        </p>
        <p className="text-sm text-muted-foreground mt-2">— NEXUS</p>
      </motion.div>
    </div>
  );
}
