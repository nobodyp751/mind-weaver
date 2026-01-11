import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { 
  Image, 
  FileText, 
  Target, 
  Trophy, 
  Heart,
  X,
  Send
} from 'lucide-react';

const postTypes = [
  { id: 'text', label: 'Texte', icon: FileText, color: 'text-primary' },
  { id: 'photo', label: 'Photo', icon: Image, color: 'text-mood-love' },
  { id: 'mood', label: 'Mood', icon: Heart, color: 'text-mood-joy' },
  { id: 'goal', label: 'Objectif', icon: Target, color: 'text-accent' },
  { id: 'achievement', label: 'Réussite', icon: Trophy, color: 'text-warning' },
];

interface PostTabProps {
  onTabChange: (tab: string) => void;
}

export function PostTab({ onTabChange }: PostTabProps) {
  const { currentUser, addPost } = useNexusStore();
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('friends');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!content.trim() && images.length === 0) return;
    if (!currentUser) return;

    addPost({
      userId: currentUser.id,
      content,
      images: images.length > 0 ? images : undefined,
      type: postType as any,
      visibility,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });

    setContent('');
    setImages([]);
    setPostType('text');
    onTabChange('feed');
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-serif font-bold">Nouvelle publication</h1>
        <p className="text-muted-foreground mt-1">Partagez avec votre cercle</p>
      </motion.div>

      {/* Post Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-5 gap-3"
      >
        {postTypes.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setPostType(type.id)}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                postType === type.id
                  ? 'bg-primary/20 ring-2 ring-primary'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              <Icon className={`w-6 h-6 ${type.color}`} />
              <span className="text-xs">{type.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Content Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
            {currentUser?.displayName?.[0] || '?'}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Qu'avez-vous en tête?"
              className="w-full bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground min-h-[120px]"
            />
          </div>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-40 object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <Image className="w-5 h-5 text-mood-love" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex gap-3">
            {(['private', 'friends', 'public'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  visibility === v
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {v === 'private' ? '🔒' : v === 'friends' ? '👥' : '🌍'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Post Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handlePost}
        disabled={!content.trim() && images.length === 0}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        Publier
      </motion.button>
    </div>
  );
}
