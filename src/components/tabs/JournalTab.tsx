import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Plus, BookOpen, Search, Trash2, Tag, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function JournalTab() {
  const { currentUser, journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useNexusStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const userEntries = journalEntries
    .filter(j => j.userId === currentUser?.id)
    .filter(j => {
      if (!searchQuery) return true;
      return j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!content.trim() || !currentUser) return;

    if (editingId) {
      updateJournalEntry(editingId, { content, tags });
    } else {
      addJournalEntry({
        userId: currentUser.id,
        content,
        tags,
        createdAt: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setContent('');
    setTags([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (entry: typeof journalEntries[0]) => {
    setContent(entry.content);
    setTags(entry.tags);
    setEditingId(entry.id);
    setShowForm(true);
  };

  const exportJournal = () => {
    const markdown = userEntries.map(entry => 
      `# ${format(new Date(entry.createdAt), 'd MMMM yyyy - HH:mm', { locale: fr })}\n\n${entry.content}\n\nTags: ${entry.tags.join(', ')}\n\n---\n`
    ).join('\n');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal-nexus.md';
    a.click();
  };

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold">Journal</h1>
          <p className="text-muted-foreground mt-1">Vos pensées intimes</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportJournal} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher dans le journal..."
          className="w-full input-nexus bg-secondary/50 pl-12"
        />
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6 space-y-5"
          >
            <h3 className="text-lg font-semibold">
              {editingId ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
            </h3>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Écrivez vos pensées... (Markdown supporté)"
              className="w-full input-nexus bg-secondary/50 resize-none h-48 font-mono text-sm"
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(tag => (
                  <span key={tag} className="mood-badge flex items-center gap-2">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 input-nexus bg-secondary/50"
                />
                <button onClick={handleAddTag} className="btn-secondary">
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={resetForm} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={handleSave} disabled={!content.trim()} className="flex-1 btn-primary">
                {editingId ? 'Sauvegarder' : 'Publier'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="space-y-4">
        {userEntries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(entry.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(entry)} className="p-2 rounded-lg hover:bg-secondary">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => deleteJournalEntry(entry.id)} className="p-2 rounded-lg hover:bg-destructive/20">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-foreground/90">{entry.content}</p>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {entry.tags.map(tag => (
                  <span key={tag} className="text-xs text-primary">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {userEntries.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-8 text-center"
          >
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Votre journal est vide.</p>
            <p className="text-sm text-muted-foreground mt-1">Commencez à écrire vos pensées.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
