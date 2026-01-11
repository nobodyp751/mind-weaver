import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { format, subDays, startOfYear, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const moods = [
  { id: 'joy', emoji: '😊', label: 'Joie', color: 'bg-mood-joy' },
  { id: 'calm', emoji: '😌', label: 'Calme', color: 'bg-mood-calm' },
  { id: 'energy', emoji: '⚡', label: 'Énergie', color: 'bg-mood-energy' },
  { id: 'love', emoji: '❤️', label: 'Amour', color: 'bg-mood-love' },
  { id: 'neutral', emoji: '😐', label: 'Neutre', color: 'bg-mood-neutral' },
  { id: 'sadness', emoji: '😢', label: 'Tristesse', color: 'bg-mood-sadness' },
  { id: 'anxiety', emoji: '😰', label: 'Anxiété', color: 'bg-mood-anxiety' },
  { id: 'anger', emoji: '😤', label: 'Colère', color: 'bg-mood-anger' },
];

const emotions = [
  'Reconnaissant', 'Motivé', 'Fatigué', 'Stressé', 'Créatif',
  'Confiant', 'Nostalgique', 'Inspiré', 'Frustré', 'Serein',
  'Excité', 'Mélancolique', 'Déterminé', 'Vulnérable', 'Paisible'
];

export function MoodTab() {
  const { currentUser, moodEntries, addMoodEntry, updateMoodEntry } = useNexusStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState(50);
  const [note, setNote] = useState('');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const existingEntry = moodEntries.find(
    m => m.userId === currentUser?.id && m.date === dateStr
  );

  // Generate heatmap data for the year
  const yearStart = startOfYear(new Date());
  const yearDays = eachDayOfInterval({ start: yearStart, end: new Date() });
  
  const getMoodColor = (date: Date) => {
    const entry = moodEntries.find(
      m => m.userId === currentUser?.id && m.date === format(date, 'yyyy-MM-dd')
    );
    if (!entry) return 'bg-secondary/30';
    const mood = moods.find(m => m.id === entry.mood);
    return mood?.color || 'bg-secondary/30';
  };

  const handleSave = () => {
    if (!selectedMood || !currentUser) return;

    const moodScore = moods.findIndex(m => m.id === selectedMood) < 5 
      ? 8 - moods.findIndex(m => m.id === selectedMood)
      : 4 - (moods.findIndex(m => m.id === selectedMood) - 4);

    if (existingEntry) {
      updateMoodEntry(existingEntry.id, {
        mood: selectedMood,
        emotions: selectedEmotions,
        intensity,
        note,
        moodScore,
      });
    } else {
      addMoodEntry({
        userId: currentUser.id,
        date: dateStr,
        mood: selectedMood,
        moodScore,
        emotions: selectedEmotions,
        intensity,
        note,
        isPrivate: true,
      });
    }

    setShowForm(false);
    setSelectedMood('');
    setSelectedEmotions([]);
    setIntensity(50);
    setNote('');
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-serif font-bold">Mood</h1>
        <p className="text-muted-foreground mt-1">Suivez vos émotions au quotidien</p>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between glass-card p-4"
      >
        <button
          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
          className="p-3 rounded-xl hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-medium">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </p>
          <p className="text-sm text-muted-foreground">
            {isSameDay(selectedDate, new Date()) ? "Aujourd'hui" : format(selectedDate, 'yyyy')}
          </p>
        </div>
        <button
          onClick={() => {
            if (!isSameDay(selectedDate, new Date())) {
              setSelectedDate(new Date(selectedDate.getTime() + 86400000));
            }
          }}
          disabled={isSameDay(selectedDate, new Date())}
          className="p-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Current Day Mood */}
      <AnimatePresence mode="wait">
        {existingEntry && !showForm ? (
          <motion.div
            key="existing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 text-center"
          >
            <span className="text-7xl mb-4 block mood-glow">
              {moods.find(m => m.id === existingEntry.mood)?.emoji}
            </span>
            <p className="text-xl font-medium capitalize mb-2">
              {moods.find(m => m.id === existingEntry.mood)?.label}
            </p>
            <p className="text-muted-foreground mb-4">
              Intensité: {existingEntry.intensity}%
            </p>
            {existingEntry.emotions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {existingEntry.emotions.map(emotion => (
                  <span key={emotion} className="mood-badge">
                    {emotion}
                  </span>
                ))}
              </div>
            )}
            {existingEntry.note && (
              <p className="text-sm text-muted-foreground italic">
                "{existingEntry.note}"
              </p>
            )}
            <button
              onClick={() => {
                setSelectedMood(existingEntry.mood);
                setSelectedEmotions(existingEntry.emotions);
                setIntensity(existingEntry.intensity);
                setNote(existingEntry.note || '');
                setShowForm(true);
              }}
              className="btn-secondary mt-6"
            >
              Modifier
            </button>
          </motion.div>
        ) : showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-6 space-y-6"
          >
            {/* Mood Selection */}
            <div>
              <h3 className="font-medium mb-4">Comment te sens-tu?</h3>
              <div className="grid grid-cols-4 gap-3">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                      selectedMood === mood.id
                        ? 'bg-primary/20 ring-2 ring-primary scale-105'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <span className="text-3xl block mb-1">{mood.emoji}</span>
                    <span className="text-xs text-muted-foreground">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">Intensité</h3>
                <span className="text-primary font-medium">{intensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Emotions */}
            <div>
              <h3 className="font-medium mb-3">Émotions secondaires</h3>
              <div className="flex flex-wrap gap-2">
                {emotions.map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    className={`mood-badge transition-all ${
                      selectedEmotions.includes(emotion)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <h3 className="font-medium mb-2">Note (optionnel)</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Comment s'est passée ta journée?"
                className="w-full input-nexus bg-secondary/50 resize-none h-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedMood}
                className="flex-1 btn-primary"
              >
                Sauvegarder
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="glass-card-hover p-8 w-full flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Ajouter le mood du jour</p>
              <p className="text-sm text-muted-foreground">
                Comment te sens-tu?
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Year Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="font-medium mb-4">Année en cours</h3>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex flex-wrap gap-1" style={{ maxWidth: '100%' }}>
            {yearDays.map((day, i) => (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.002 }}
                onClick={() => setSelectedDate(day)}
                className={`w-3 h-3 rounded-sm heatmap-cell ${getMoodColor(day)} ${
                  isSameDay(day, selectedDate) ? 'ring-2 ring-primary' : ''
                }`}
                title={format(day, 'd MMMM yyyy', { locale: fr })}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-secondary/30" />
            <span>Aucune entrée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-mood-joy" />
            <span>Joie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-mood-calm" />
            <span>Calme</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
