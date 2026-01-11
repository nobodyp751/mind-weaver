import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNexusStore } from '@/lib/store';
import { Shield, Users, Flag, Trash2, UserPlus, Check, X, AlertTriangle } from 'lucide-react';

export function AdminTab() {
  const { currentUser, users, reports, updateReport, deleteUser, createUserAsAdmin, adminSettings, updateAdminSettings } = useNexusStore();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [primaryColor, setPrimaryColor] = useState(adminSettings.primaryColor);

  if (!currentUser?.isAdmin) return <div className="p-8 text-center text-destructive">Accès refusé</div>;

  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleCreateUser = () => {
    if (!newUsername || !newPassword || !newDisplayName) return;
    createUserAsAdmin({ username: newUsername, password: newPassword, displayName: newDisplayName, isAdmin: false, isPrivate: true, friends: [], pendingInvites: [], blockedUsers: [] });
    setNewUsername(''); setNewPassword(''); setNewDisplayName('');
  };

  const handleResolveReport = (reportId: string, action: 'resolved' | 'reviewed', deleteAccount?: boolean) => {
    const report = reports.find(r => r.id === reportId);
    if (deleteAccount && report) deleteUser(report.reportedUserId);
    updateReport(reportId, { status: action });
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-serif font-bold flex items-center gap-3"><Shield className="w-8 h-8 text-warning" />Admin</h1>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card"><p className="text-3xl font-bold">{users.length}</p><p className="text-sm text-muted-foreground">Utilisateurs</p></div>
        <div className="stat-card"><p className="text-3xl font-bold text-warning">{pendingReports.length}</p><p className="text-sm text-muted-foreground">Signalements</p></div>
      </div>

      {/* Reports */}
      {pendingReports.length > 0 && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-medium flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />Signalements</h3>
          {pendingReports.map(report => {
            const reported = users.find(u => u.id === report.reportedUserId);
            return (
              <div key={report.id} className="bg-secondary/30 rounded-xl p-4 space-y-3">
                <p><strong>{reported?.displayName}</strong> signalé</p>
                <p className="text-sm text-muted-foreground">{report.reason}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleResolveReport(report.id, 'reviewed')} className="btn-secondary py-2 px-4 text-sm">Ignorer</button>
                  <button onClick={() => handleResolveReport(report.id, 'resolved', true)} className="btn-primary py-2 px-4 text-sm bg-destructive">Supprimer compte</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create User */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2"><UserPlus className="w-5 h-5" />Créer un compte</h3>
        <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username" className="w-full input-nexus bg-secondary/50" />
        <input value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} placeholder="Nom d'affichage" className="w-full input-nexus bg-secondary/50" />
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mot de passe" className="w-full input-nexus bg-secondary/50" />
        <button onClick={handleCreateUser} className="w-full btn-primary">Créer</button>
      </div>

      {/* Users List */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2"><Users className="w-5 h-5" />Utilisateurs</h3>
        {users.filter(u => u.id !== currentUser.id).map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
