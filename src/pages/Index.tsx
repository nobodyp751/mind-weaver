import { useState } from 'react';
import { useNexusStore } from '@/lib/store';
import { AuthScreen } from '@/components/AuthScreen';
import { BottomNav } from '@/components/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { MoodTab } from '@/components/tabs/MoodTab';
import { GoalsTab } from '@/components/tabs/GoalsTab';
import { AchievementsTab } from '@/components/tabs/AchievementsTab';
import { FeedTab } from '@/components/tabs/FeedTab';
import { PostTab } from '@/components/tabs/PostTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { JournalTab } from '@/components/tabs/JournalTab';
import { HabitsTab } from '@/components/tabs/HabitsTab';
import { GroupsTab } from '@/components/tabs/GroupsTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { AdminTab } from '@/components/tabs/AdminTab';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { currentUser } = useNexusStore();
  const [activeTab, setActiveTab] = useState('home');

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab onTabChange={setActiveTab} />;
      case 'mood': return <MoodTab />;
      case 'goals': return <GoalsTab />;
      case 'achievements': return <AchievementsTab />;
      case 'feed': return <FeedTab />;
      case 'post': return <PostTab onTabChange={setActiveTab} />;
      case 'stats': return <StatsTab />;
      case 'journal': return <JournalTab />;
      case 'habits': return <HabitsTab />;
      case 'groups': return <GroupsTab />;
      case 'profile': return <ProfileTab />;
      case 'settings': return <SettingsTab />;
      case 'admin': return <AdminTab />;
      default: return <HomeTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
