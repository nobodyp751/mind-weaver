import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { User, Edit3, UserPlus, UserMinus, Search, Shield, Lock } from 'lucide-react';

export function ProfileTab() {
  const { currentUser, users, updateUser, sendFriendInvite, acceptFriendInvite, declineFriendInvite, removeFriend } = useNexusStore();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [searchQuery, setSearchQuery] = useState('');

  const friends = users.filter(u => currentUser?.friends.includes(u.id));
  const pendingInvites = users.filter(u => currentUser?.pendingInvites.includes(u.id));
  const searchResults = searchQuery ? users.filter(u => 
    u.id !== currentUser?.id && 
    !currentUser?.friends.includes(u.id) &&
    (u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const handleSave = () => {
    if (!currentUser) return;
    updateUser(currentUser.id, { displayName, bio });
    setEditing(false);
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif font-bold">Profil</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-primary-foreground">
          {currentUser?.displayName?.[0]}
        </div>
        {editing ? (
          <div className="space-y-4">
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full input-nexus bg-secondary/50 text-center" />
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio..." className="w-full input-nexus bg-secondary/50 resize-none h-20" />
            <div className="flex gap-4">
              <button onClick={() => setEditing(false)} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={handleSave} className="flex-1 btn-primary">Sauvegarder</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{currentUser?.displayName}</h2>
            <p className="text-muted-foreground">@{currentUser?.username}</p>
            {currentUser?.bio && <p className="mt-3 text-sm">{currentUser.bio}</p>}
            <div className="flex items-center justify-center gap-2 mt-3">
              {currentUser?.isPrivate && <span className="mood-badge"><Lock className="w-3 h-3" /> Privé</span>}
              {currentUser?.isAdmin && <span className="mood-badge text-warning"><Shield className="w-3 h-3" /> Admin</span>}
            </div>
            <button onClick={() => setEditing(true)} className="btn-secondary mt-4"><Edit3 className="w-4 h-4 mr-2" />Modifier</button>
          </>
        )}
      </motion.div>

      {/* Search Users */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-medium">Inviter des amis</h3>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="w-full input-nexus bg-secondary/50 pl-12" />
        </div>
        {searchResults.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span>{user.displayName}</span>
            <button onClick={() => currentUser && sendFriendInvite(currentUser.id, user.id)} className="p-2 rounded-lg bg-primary/20 text-primary">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-medium">Invitations reçues</h3>
          {pendingInvites.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span>{user.displayName}</span>
              <div className="flex gap-2">
                <button onClick={() => currentUser && acceptFriendInvite(currentUser.id, user.id)} className="btn-primary py-2 px-4 text-sm">Accepter</button>
                <button onClick={() => currentUser && declineFriendInvite(currentUser.id, user.id)} className="btn-secondary py-2 px-4 text-sm">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-medium">Amis ({friends.length})</h3>
        {friends.map(friend => (
          <div key={friend.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <span>{friend.displayName}</span>
            <button onClick={() => currentUser && removeFriend(currentUser.id, friend.id)} className="p-2 rounded-lg hover:bg-destructive/20">
              <UserMinus className="w-4 h-4 text-destructive" />
            </button>
          </div>
        ))}
        {friends.length === 0 && <p className="text-muted-foreground text-center py-4">Aucun ami pour le moment</p>}
      </div>
    </div>
  );
}
