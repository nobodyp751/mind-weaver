import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  MoreHorizontal, 
  Send,
  Flag,
  X,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function FeedTab() {
  const { 
    currentUser, 
    posts, 
    users, 
    likePost, 
    addComment, 
    addReport 
  } = useNexusStore();
  
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'friends'>('all');

  // Get visible posts (public or from friends)
  const visiblePosts = posts
    .filter(post => {
      if (post.userId === currentUser?.id) return true;
      if (post.visibility === 'public') return true;
      if (post.visibility === 'friends') {
        const postUser = users.find(u => u.id === post.userId);
        return postUser?.friends.includes(currentUser?.id || '');
      }
      return false;
    })
    .filter(post => {
      if (filter === 'friends') {
        return currentUser?.friends.includes(post.userId) || post.userId === currentUser?.id;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    likePost(postId, currentUser.id);
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim() || !currentUser) return;

    addComment(postId, {
      userId: currentUser.id,
      content: commentText,
      createdAt: new Date().toISOString(),
    });

    setCommentText('');
  };

  const handleReport = (userId: string) => {
    if (!currentUser || !reportReason.trim()) return;

    addReport({
      reporterId: currentUser.id,
      reportedUserId: userId,
      reason: reportReason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setShowReportModal(null);
    setReportReason('');
  };

  const getUser = (userId: string) => users.find(u => u.id === userId);

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-serif font-bold">Feed</h1>
        <p className="text-muted-foreground mt-1">Découvrez et partagez</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Tout
        </button>
        <button
          onClick={() => setFilter('friends')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            filter === 'friends'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Amis
        </button>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post, i) => {
            const author = getUser(post.userId);
            const isLiked = post.likes.includes(currentUser?.id || '');

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {author?.displayName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{author?.displayName || 'Utilisateur'}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {post.userId !== currentUser?.id && (
                    <button
                      onClick={() => setShowReportModal(post.userId)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-full rounded-xl object-cover max-h-96"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      isLiked ? 'text-mood-love' : 'text-muted-foreground hover:text-mood-love'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </button>
                  
                  <button
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>

                {/* Comments */}
                <AnimatePresence>
                  {selectedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-border/50 space-y-4"
                    >
                      {post.comments.map((comment) => {
                        const commentAuthor = getUser(comment.userId);
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                              {commentAuthor?.displayName?.[0] || '?'}
                            </div>
                            <div className="flex-1 bg-secondary/50 rounded-xl p-3">
                              <p className="text-sm font-medium">{commentAuthor?.displayName}</p>
                              <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                          {currentUser?.displayName?.[0] || '?'}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            className="flex-1 input-nexus bg-secondary/50 py-2"
                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText.trim()}
                            className="px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune publication pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Soyez le premier à partager!
            </p>
          </motion.div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReportModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                  <h3 className="text-lg font-semibold">Signaler un compte</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(null)}
                  className="p-2 rounded-lg hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Décrivez la raison du signalement..."
                className="w-full input-nexus bg-secondary/50 resize-none h-32"
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowReportModal(null)}
                  className="flex-1 btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleReport(showReportModal)}
                  disabled={!reportReason.trim()}
                  className="flex-1 btn-primary bg-warning text-warning-foreground"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Signaler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
