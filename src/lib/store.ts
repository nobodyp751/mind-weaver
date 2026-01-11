// NEXUS Data Store - localStorage based
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  password: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  values?: string[];
  isAdmin: boolean;
  isPrivate: boolean;
  createdAt: string;
  friends: string[];
  pendingInvites: string[];
  blockedUsers: string[];
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  mood: string;
  moodScore: number;
  emotions: string[];
  intensity: number;
  note?: string;
  isPrivate: boolean;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  motivation: string;
  fear?: string;
  difficulty: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  visibility: 'private' | 'friends' | 'public';
  linkedHabits: string[];
  createdAt: string;
  targetDate?: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'mental' | 'emotional' | 'professional' | 'social';
  date: string;
  visibility: 'private' | 'friends' | 'public';
  likes: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  type: 'text' | 'mood' | 'achievement' | 'goal' | 'photo';
  visibility: 'private' | 'friends' | 'public';
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  mood?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  streak: number;
  completedDates: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface ResourceGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  members: ResourceMember[];
  createdAt: string;
}

export interface ResourceMember {
  id: string;
  name: string;
  image?: string;
  notes?: string;
  tags?: string[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  adminNote?: string;
}

export interface AdminSettings {
  primaryColor: string;
  accentColor: string;
  appName: string;
  welcomeMessage: string;
  maintenanceMode: boolean;
}

interface NexusState {
  // Auth
  currentUser: User | null;
  users: User[];
  
  // Data
  moodEntries: MoodEntry[];
  goals: Goal[];
  achievements: Achievement[];
  posts: Post[];
  journalEntries: JournalEntry[];
  habits: Habit[];
  resourceGroups: ResourceGroup[];
  reports: Report[];
  
  // Admin
  adminSettings: AdminSettings;
  
  // Actions
  login: (username: string, password: string) => User | null;
  logout: () => void;
  register: (username: string, password: string, displayName: string) => User | null;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  // Mood
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => void;
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Achievements
  addAchievement: (achievement: Omit<Achievement, 'id'>) => void;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  
  // Posts
  addPost: (post: Omit<Post, 'id'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id'>) => void;
  
  // Journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  
  // Habits
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string, date: string) => void;
  
  // Resource Groups
  addResourceGroup: (group: Omit<ResourceGroup, 'id'>) => void;
  updateResourceGroup: (id: string, updates: Partial<ResourceGroup>) => void;
  deleteResourceGroup: (id: string) => void;
  
  // Social
  sendFriendInvite: (fromUserId: string, toUserId: string) => void;
  acceptFriendInvite: (userId: string, fromUserId: string) => void;
  declineFriendInvite: (userId: string, fromUserId: string) => void;
  removeFriend: (userId: string, friendId: string) => void;
  
  // Reports
  addReport: (report: Omit<Report, 'id'>) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  
  // Admin
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  createUserAsAdmin: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultAdminSettings: AdminSettings = {
  primaryColor: '174 72% 56%',
  accentColor: '262 60% 60%',
  appName: 'NEXUS',
  welcomeMessage: 'Bienvenue dans votre espace personnel',
  maintenanceMode: false,
};

// Create admin user by default
const adminUser: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'aaddmiinee',
  displayName: 'Administrateur',
  isAdmin: true,
  isPrivate: true,
  createdAt: new Date().toISOString(),
  friends: [],
  pendingInvites: [],
  blockedUsers: [],
};

export const useNexusStore = create<NexusState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [adminUser],
      moodEntries: [],
      goals: [],
      achievements: [],
      posts: [],
      journalEntries: [],
      habits: [],
      resourceGroups: [],
      reports: [],
      adminSettings: defaultAdminSettings,

      login: (username, password) => {
        const user = get().users.find(
          u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => set({ currentUser: null }),

      register: (username, password, displayName) => {
        const exists = get().users.some(
          u => u.username.toLowerCase() === username.toLowerCase()
        );
        if (exists) return null;
        
        const newUser: User = {
          id: generateId(),
          username,
          password,
          displayName,
          isAdmin: false,
          isPrivate: true,
          createdAt: new Date().toISOString(),
          friends: [],
          pendingInvites: [],
          blockedUsers: [],
        };
        
        set(state => ({ 
          users: [...state.users, newUser],
          currentUser: newUser
        }));
        return newUser;
      },

      updateUser: (userId, updates) => {
        set(state => ({
          users: state.users.map(u => 
            u.id === userId ? { ...u, ...updates } : u
          ),
          currentUser: state.currentUser?.id === userId 
            ? { ...state.currentUser, ...updates }
            : state.currentUser
        }));
      },

      deleteUser: (userId) => {
        set(state => ({
          users: state.users.filter(u => u.id !== userId),
          posts: state.posts.filter(p => p.userId !== userId),
          moodEntries: state.moodEntries.filter(m => m.userId !== userId),
          goals: state.goals.filter(g => g.userId !== userId),
          achievements: state.achievements.filter(a => a.userId !== userId),
          journalEntries: state.journalEntries.filter(j => j.userId !== userId),
          habits: state.habits.filter(h => h.userId !== userId),
          resourceGroups: state.resourceGroups.filter(r => r.userId !== userId),
        }));
      },

      addMoodEntry: (entry) => {
        set(state => ({
          moodEntries: [...state.moodEntries, { ...entry, id: generateId() }]
        }));
      },

      updateMoodEntry: (id, updates) => {
        set(state => ({
          moodEntries: state.moodEntries.map(m => 
            m.id === id ? { ...m, ...updates } : m
          )
        }));
      },

      addGoal: (goal) => {
        set(state => ({
          goals: [...state.goals, { ...goal, id: generateId() }]
        }));
      },

      updateGoal: (id, updates) => {
        set(state => ({
          goals: state.goals.map(g => 
            g.id === id ? { ...g, ...updates } : g
          )
        }));
      },

      deleteGoal: (id) => {
        set(state => ({
          goals: state.goals.filter(g => g.id !== id)
        }));
      },

      addAchievement: (achievement) => {
        set(state => ({
          achievements: [...state.achievements, { ...achievement, id: generateId() }]
        }));
      },

      updateAchievement: (id, updates) => {
        set(state => ({
          achievements: state.achievements.map(a => 
            a.id === id ? { ...a, ...updates } : a
          )
        }));
      },

      addPost: (post) => {
        set(state => ({
          posts: [...state.posts, { ...post, id: generateId() }]
        }));
      },

      updatePost: (id, updates) => {
        set(state => ({
          posts: state.posts.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },

      deletePost: (id) => {
        set(state => ({
          posts: state.posts.filter(p => p.id !== id)
        }));
      },

      likePost: (postId, userId) => {
        set(state => ({
          posts: state.posts.map(p => {
            if (p.id === postId) {
              const likes = p.likes.includes(userId)
                ? p.likes.filter(id => id !== userId)
                : [...p.likes, userId];
              return { ...p, likes };
            }
            return p;
          })
        }));
      },

      addComment: (postId, comment) => {
        set(state => ({
          posts: state.posts.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                comments: [...p.comments, { ...comment, id: generateId() }]
              };
            }
            return p;
          })
        }));
      },

      addJournalEntry: (entry) => {
        set(state => ({
          journalEntries: [...state.journalEntries, { ...entry, id: generateId() }]
        }));
      },

      updateJournalEntry: (id, updates) => {
        set(state => ({
          journalEntries: state.journalEntries.map(j => 
            j.id === id ? { ...j, ...updates } : j
          )
        }));
      },

      deleteJournalEntry: (id) => {
        set(state => ({
          journalEntries: state.journalEntries.filter(j => j.id !== id)
        }));
      },

      addHabit: (habit) => {
        set(state => ({
          habits: [...state.habits, { ...habit, id: generateId() }]
        }));
      },

      updateHabit: (id, updates) => {
        set(state => ({
          habits: state.habits.map(h => 
            h.id === id ? { ...h, ...updates } : h
          )
        }));
      },

      deleteHabit: (id) => {
        set(state => ({
          habits: state.habits.filter(h => h.id !== id)
        }));
      },

      completeHabit: (id, date) => {
        set(state => ({
          habits: state.habits.map(h => {
            if (h.id === id) {
              const completedDates = h.completedDates.includes(date)
                ? h.completedDates.filter(d => d !== date)
                : [...h.completedDates, date];
              return { ...h, completedDates, streak: completedDates.length };
            }
            return h;
          })
        }));
      },

      addResourceGroup: (group) => {
        set(state => ({
          resourceGroups: [...state.resourceGroups, { ...group, id: generateId() }]
        }));
      },

      updateResourceGroup: (id, updates) => {
        set(state => ({
          resourceGroups: state.resourceGroups.map(g => 
            g.id === id ? { ...g, ...updates } : g
          )
        }));
      },

      deleteResourceGroup: (id) => {
        set(state => ({
          resourceGroups: state.resourceGroups.filter(g => g.id !== id)
        }));
      },

      sendFriendInvite: (fromUserId, toUserId) => {
        set(state => ({
          users: state.users.map(u => {
            if (u.id === toUserId && !u.pendingInvites.includes(fromUserId)) {
              return { ...u, pendingInvites: [...u.pendingInvites, fromUserId] };
            }
            return u;
          })
        }));
      },

      acceptFriendInvite: (userId, fromUserId) => {
        set(state => ({
          users: state.users.map(u => {
            if (u.id === userId) {
              return {
                ...u,
                friends: [...u.friends, fromUserId],
                pendingInvites: u.pendingInvites.filter(id => id !== fromUserId)
              };
            }
            if (u.id === fromUserId) {
              return { ...u, friends: [...u.friends, userId] };
            }
            return u;
          })
        }));
      },

      declineFriendInvite: (userId, fromUserId) => {
        set(state => ({
          users: state.users.map(u => {
            if (u.id === userId) {
              return {
                ...u,
                pendingInvites: u.pendingInvites.filter(id => id !== fromUserId)
              };
            }
            return u;
          })
        }));
      },

      removeFriend: (userId, friendId) => {
        set(state => ({
          users: state.users.map(u => {
            if (u.id === userId || u.id === friendId) {
              return {
                ...u,
                friends: u.friends.filter(id => id !== userId && id !== friendId)
              };
            }
            return u;
          })
        }));
      },

      addReport: (report) => {
        set(state => ({
          reports: [...state.reports, { ...report, id: generateId() }]
        }));
      },

      updateReport: (id, updates) => {
        set(state => ({
          reports: state.reports.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        }));
      },

      updateAdminSettings: (settings) => {
        set(state => ({
          adminSettings: { ...state.adminSettings, ...settings }
        }));
      },

      createUserAsAdmin: (userData) => {
        const newUser: User = {
          ...userData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          users: [...state.users, newUser]
        }));
      },
    }),
    {
      name: 'nexus-storage',
    }
  )
);
