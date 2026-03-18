// File: components/EngineerVaultApp.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LogIn, UserPlus, MoonStar, Sun, Search, BookOpen, Heart, X, Loader2,
  Grid3X3, List, ChevronRight, Star, Clock, BookMarked, Settings, LogOut,
  User, Trophy, Award, Target, Zap, BookText, ShoppingCart, Library,
  DollarSign, TrendingUp, Users, Calendar, Medal, Crown, Flame, Sparkles,
  Bell, Menu, Home, Bookmark, Upload, Sparkle, Lightbulb, FileText, Plus,
  Bot, RefreshCw, Trash2, Edit, ExternalLink, Download, Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { categories, resources } from '@/lib/data';

// Types
interface Book {
  key: string;
  title: string;
  author: string;
  year: number | string;
  coverId?: number;
  pdf?: string | null;
  link?: string | null;
  description?: string;
  subjects?: string[];
  pages?: number;
  publisher?: string;
  isbn?: string;
  // For uploaded books
  isUploaded?: boolean;
  fileUrl?: string;
  notes?: string;
  dateAdded?: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward: number;
  type: 'books' | 'points' | 'favorites' | 'searches' | 'uploads';
}

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'ebook' | 'subscription' | 'course';
}

interface DailySuggestion {
  title: string;
  author: string;
  reason: string;
  category: string;
}

// User Profile Data
interface UserProfile {
  displayName: string;
  avatarColor: string;
  bio: string;
  joinedDate: string;
  favoriteGenre: string;
  readingGoal: number;
  currentlyReading: Book[];
  completedBooks: Book[];
}

// AI Recommendation interface
interface AIRecommendation {
  title: string;
  author: string;
  reason: string;
  matchScore: number;
}

// Gamification data
const achievements: Achievement[] = [
  { id: 'first_book', name: 'First Read', description: 'Read your first book', requirement: 1, reward: 50, type: 'books' },
  { id: 'bookworm', name: 'Bookworm', description: 'Read 10 books', requirement: 10, reward: 200, type: 'books' },
  { id: 'scholar', name: 'Scholar', description: 'Read 50 books', requirement: 50, reward: 500, type: 'books' },
  { id: 'bibliophile', name: 'Bibliophile', description: 'Read 100 books', requirement: 100, reward: 1000, type: 'books' },
  { id: 'point_collector', name: 'Point Collector', description: 'Earn 100 points', requirement: 100, reward: 25, type: 'points' },
  { id: 'point_master', name: 'Point Master', description: 'Earn 500 points', requirement: 500, reward: 100, type: 'points' },
  { id: 'fav_starter', name: 'Favorites Starter', description: 'Save 5 favorites', requirement: 5, reward: 30, type: 'favorites' },
  { id: 'fav_collector', name: 'Favorites Collector', description: 'Save 25 favorites', requirement: 25, reward: 150, type: 'favorites' },
  { id: 'searcher', name: 'Searcher', description: 'Search 20 times', requirement: 20, reward: 40, type: 'searches' },
  { id: 'explorer', name: 'Explorer', description: 'Search 100 times', requirement: 100, reward: 200, type: 'searches' },
  { id: 'uploader', name: 'Contributor', description: 'Upload 1 book', requirement: 1, reward: 100, type: 'uploads' },
  { id: 'librarian', name: 'Librarian', description: 'Upload 10 books', requirement: 10, reward: 500, type: 'uploads' },
];

const availableBadges: Badge[] = [
  { id: 'newbie', name: 'New Member', description: 'Joined EngineerVault', icon: '🌱' },
  { id: 'reader', name: 'Avid Reader', description: 'Read 5 books', icon: '📖' },
  { id: 'collector', name: 'Collector', description: 'Saved 10 favorites', icon: '📚' },
  { id: 'explorer', name: 'Explorer', description: 'Searched 50 times', icon: '🔍' },
  { id: 'point_earner', name: 'Point Earner', description: 'Earned 200 points', icon: '⭐' },
  { id: 'streak_3', name: '3 Day Streak', description: 'Logged in 3 days in a row', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Logged in 7 days in a row', icon: '💪' },
  { id: 'contributor', name: 'Contributor', description: 'Contributed to the library', icon: '🤝' },
  { id: 'ai_user', name: 'AI Explorer', description: 'Used AI recommendations', icon: '🤖' },
  { id: 'uploader', name: 'Book Uploader', description: 'Uploaded a personal book', icon: '📤' },
];

const storeItems: StoreItem[] = [
  { id: '1', title: 'Premium Engineering Bundle', description: 'Access all premium engineering books', price: 99, type: 'subscription' },
  { id: '2', title: 'CAD Mastery Course', description: 'Complete SolidWorks training', price: 49, type: 'course' },
  { id: '3', title: 'Programming Essentials', description: 'C, C++, Python, MATLAB bundle', price: 39, type: 'ebook' },
  { id: '4', title: 'Robotics Fundamentals', description: 'Learn robotics from scratch', price: 29, type: 'course' },
  { id: '5', title: 'Embedded Systems Pro', description: 'STM32, Arduino, ESP32 training', price: 59, type: 'course' },
  { id: '6', title: 'Monthly Pro Access', description: 'Unlimited downloads for 30 days', price: 19, type: 'subscription' },
];

const libraryBooks: Book[] = [
  { key: '/works/OL12345W', title: 'Introduction to Mechanical Engineering', author: 'Dr. John Smith', year: 2023, coverId: 100, description: 'A comprehensive introduction to mechanical engineering principles.', subjects: ['Mechanical', 'Engineering'], pages: 450, publisher: 'Tech Press' },
  { key: '/works/OL12346W', title: 'Electrical Circuits Fundamentals', author: 'Prof. Sarah Johnson', year: 2022, coverId: 101, description: 'Learn the basics of electrical circuits and analysis.', subjects: ['Electrical', 'Circuits'], pages: 380, publisher: 'Electro Books' },
  { key: '/works/OL12347W', title: 'Python for Engineers', author: 'Michael Chen', year: 2024, coverId: 102, description: 'Master Python programming for engineering applications.', subjects: ['Programming', 'Python'], pages: 520, publisher: 'Code Publications' },
  { key: '/works/OL12348W', title: 'Robotics and Automation', author: 'Dr. Lisa Wang', year: 2023, coverId: 103, description: 'Complete guide to robotics and industrial automation.', subjects: ['Robotics', 'Automation'], pages: 410, publisher: 'RoboTech' },
  { key: '/works/OL12349W', title: 'SolidWorks Complete Guide', author: 'James Wilson', year: 2024, coverId: 104, description: 'From beginner to advanced SolidWorks modeling.', subjects: ['CAD', 'SolidWorks'], pages: 600, publisher: 'Design Pro' },
  { key: '/works/OL12350W', title: 'Microcontroller Programming', author: 'Dr. Ahmed Hassan', year: 2023, coverId: 105, description: 'STM32 and embedded systems programming.', subjects: ['Embedded', 'Microcontroller'], pages: 380, publisher: 'Embedded Press' },
  { key: '/works/OL12351W', title: 'MATLAB for Engineering', author: 'Emily Brown', year: 2024, coverId: 106, description: 'MATLAB applications in engineering problem solving.', subjects: ['MATLAB', 'Programming'], pages: 440, publisher: 'Math Works' },
  { key: '/works/OL12352W', title: 'Control Systems Theory', author: 'Dr. Robert Taylor', year: 2022, coverId: 107, description: 'Classical and modern control systems design.', subjects: ['Control', 'Systems'], pages: 520, publisher: 'Control Tech' },
];

// Daily suggestions based on categories
const dailySuggestions: DailySuggestion[] = [
  { title: 'Advanced Finite Element Analysis', author: 'Dr. James Anderson', reason: 'Based on your interest in Mechanical Engineering', category: 'Mechanical Engineering' },
  { title: 'Digital Signal Processing', author: 'Prof. Maria Garcia', reason: 'Trending in Electrical Engineering', category: 'Electrical & Electronics' },
  { title: 'Machine Learning with Python', author: 'Dr. David Kim', reason: 'Popular in Computer Science', category: 'Computer Science' },
  { title: 'Industrial Robotics', author: 'Prof. John Chen', reason: 'Based on your reading history', category: 'Robotics & Automation' },
  { title: 'Embedded Linux Systems', author: 'Dr. Sarah Williams', reason: 'Recommended for Embedded Systems', category: 'Embedded Systems' },
];

// Trending book with stats
interface TrendingBook extends Book {
  views: number;
  downloads: number;
  rating: number;
  ratingCount: number;
}

// Trending books data (simulated)
const trendingBooksData: TrendingBook[] = [
  { key: '/works/TR001', title: 'Fundamentals of Mechanics of Materials', author: 'Dr. William T. Thomson', year: 2023, coverId: 1001, views: 15420, downloads: 2840, rating: 4.8, ratingCount: 342, description: 'Comprehensive guide to mechanics of materials.', subjects: ['Mechanical', 'Materials'], pages: 680, publisher: 'Engineering Press' },
  { key: '/works/TR002', title: 'Electric Power Systems', author: 'Prof. John J. Grainger', year: 2022, coverId: 1002, views: 12850, downloads: 2150, rating: 4.7, ratingCount: 289, description: 'Power system analysis and design.', subjects: ['Electrical', 'Power'], pages: 750, publisher: 'McGraw Hill' },
  { key: '/works/TR003', title: 'Data Structures and Algorithms', author: 'Thomas H. Cormen', year: 2024, coverId: 1003, views: 18230, downloads: 3420, rating: 4.9, ratingCount: 567, description: 'Classic computer science textbook.', subjects: ['Computer Science', 'Algorithms'], pages: 1312, publisher: 'MIT Press' },
  { key: '/works/TR004', title: 'Modern Robotics', author: 'Kevin M. Lynch', year: 2023, coverId: 1004, views: 9870, downloads: 1680, rating: 4.6, ratingCount: 198, description: 'Mechanics, planning, and control of robots.', subjects: ['Robotics', 'Automation'], pages: 528, publisher: 'Cambridge' },
  { key: '/works/TR005', title: 'Microelectronic Circuits', author: 'Adel S. Sedra', year: 2022, coverId: 1005, views: 11240, downloads: 1920, rating: 4.7, ratingCount: 276, description: 'Analysis and design of electronic circuits.', subjects: ['Electronics', 'Circuits'], pages: 1248, publisher: 'Oxford' },
  { key: '/works/TR006', title: 'Introduction to Algorithms', author: 'Cormen et al.', year: 2023, coverId: 1006, views: 22150, downloads: 4520, rating: 4.9, ratingCount: 892, description: 'Comprehensive algorithms textbook.', subjects: ['Algorithms', 'Computer Science'], pages: 1312, publisher: 'MIT Press' },
  { key: '/works/TR007', title: 'Control Systems Engineering', author: 'Norman S. Nise', year: 2024, coverId: 1007, views: 8540, downloads: 1420, rating: 4.5, ratingCount: 167, description: 'Classical and modern control systems.', subjects: ['Control', 'Systems'], pages: 784, publisher: 'Wiley' },
  { key: '/works/TR008', title: 'Digital Design', author: 'M. Morris Mano', year: 2023, coverId: 1008, views: 10680, downloads: 1890, rating: 4.6, ratingCount: 234, description: 'Digital logic and computer design.', subjects: ['Digital', 'Electronics'], pages: 576, publisher: 'Pearson' },
];

// Curated recommendations based on categories
const curatedRecommendations: Book[] = [
  { key: '/works/REC001', title: 'Advanced Engineering Mathematics', author: 'Erwin Kreyszig', year: 2023, coverId: 2001, description: 'Comprehensive mathematics for engineers.', subjects: ['Mathematics', 'Engineering'], pages: 1152, publisher: 'Wiley' },
  { key: '/works/REC002', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus A. Cengel', year: 2024, coverId: 2002, description: 'Fundamentals of thermodynamics.', subjects: ['Thermodynamics', 'Mechanical'], pages: 896, publisher: 'McGraw Hill' },
  { key: '/works/REC003', title: 'Computer Networking', author: 'James Kurose', year: 2023, coverId: 2003, description: 'A top-down approach.', subjects: ['Networking', 'Computer Science'], pages: 704, publisher: 'Pearson' },
  { key: '/works/REC004', title: 'Machine Design', author: 'Robert L. Norton', year: 2024, coverId: 2004, description: 'Theory and applications.', subjects: ['Machine Design', 'Mechanical'], pages: 1120, publisher: 'Pearson' },
  { key: '/works/REC005', title: 'Signals and Systems', author: 'Alan V. Oppenheim', year: 2022, coverId: 2005, description: 'Discrete-time signal processing.', subjects: ['Signals', 'Electrical'], pages: 978, publisher: 'Prentice Hall' },
  { key: '/works/REC006', title: 'Structural Analysis', author: 'R.C. Hibbeler', year: 2023, coverId: 2006, description: 'Mechanics of materials.', subjects: ['Structural', 'Civil'], pages: 720, publisher: 'Pearson' },
];

// Avatar color options
const avatarColors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

type Theme = 'light' | 'dark';
type ViewMode = 'grid' | 'list';
type SearchCategory = 'all' | string;
type ActiveTab = 'search' | 'favorites' | 'dashboard' | 'store' | 'books' | 'profile' | 'mybooks' | 'ai' | 'trending' | 'recommendations';
type TrendingFilter = 'daily' | 'weekly' | 'monthly' | 'alltime';
type BookDetailTab = 'overview' | 'description' | 'details';

interface UserData {
  id: string;
  email: string;
  libraryNumber: string;
  points: number;
  level: number;
  badges: Badge[];
  booksRead: number;
  uploadsCount: number;
}

export default function EngineerVaultApp() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookDetailTab, setBookDetailTab] = useState<BookDetailTab>('overview');
  const [searchCount, setSearchCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [favorites, setFavorites] = useState<Book[]>([]);
  
  // New state for enhanced features
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingBook, setUploadingBook] = useState(false);
  const [dailySuggestion, setDailySuggestion] = useState<DailySuggestion | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [trendingFilter, setTrendingFilter] = useState<TrendingFilter>('weekly');
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    favoriteGenre: 'Mechanical Engineering',
    readingGoal: 12
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    description: '',
    category: 'Mechanical Engineering',
    fileUrl: ''
  });

  // Initialize theme and check auth
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const savedSearchCount = localStorage.getItem('searchCount');
    const savedStreak = localStorage.getItem('streak');
    const savedLastLogin = localStorage.getItem('lastLoginDate');
    const savedMyBooks = localStorage.getItem('myBooks');
    const savedFavorites = localStorage.getItem('favorites');
    const savedProfile = localStorage.getItem('userProfile');

    if (savedSearchCount) setSearchCount(parseInt(savedSearchCount));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastLogin) setLastLoginDate(savedLastLogin);
    if (savedMyBooks) setMyBooks(JSON.parse(savedMyBooks));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));

    // Set daily suggestion based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailySuggestion(dailySuggestions[dayOfYear % dailySuggestions.length]);

    checkAuth();
  }, []);

  // Save myBooks to local storage
  useEffect(() => {
    if (myBooks.length > 0) {
      localStorage.setItem('myBooks', JSON.stringify(myBooks));
    }
  }, [myBooks]);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save userProfile to local storage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user && lastLoginDate) {
      const today = new Date().toDateString();
      const lastLogin = new Date(lastLoginDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastLogin !== today) {
        if (lastLogin === yesterday) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('streak', newStreak.toString());
        } else {
          setStreak(1);
          localStorage.setItem('streak', '1');
        }
      }
      setLastLoginDate(today);
      localStorage.setItem('lastLoginDate', today);
    }
  }, [user]);

  function generateLibraryNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'EV-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  function checkAndAwardBadge(badgeId: string) {
    if (!user) return;
    const badge = availableBadges.find(b => b.id === badgeId);
    if (badge && !user.badges.some(b => b.id === badgeId)) {
      const earnedBadge = { ...badge, earnedAt: new Date().toISOString() };
      setUser({ ...user, badges: [...user.badges, earnedBadge] });
    }
  }

  function checkAchievements() {
    achievements.forEach(achievement => {
      let currentValue = 0;
      switch (achievement.type) {
        case 'books': currentValue = user?.booksRead || 0; break;
        case 'points': currentValue = user?.points || 0; break;
        case 'favorites': currentValue = favorites.length; break;
        case 'searches': currentValue = searchCount; break;
        case 'uploads': currentValue = myBooks.length; break;
      }

      if (currentValue >= achievement.requirement) {
        if (user) {
          const newPoints = user.points + achievement.reward;
          const newLevel = Math.floor(newPoints / 500) + 1;
          setUser({ ...user, points: newPoints, level: newLevel });
          setShowAchievement(achievement);
          setTimeout(() => setShowAchievement(null), 3000);
        }
      }
    });
  }

  async function checkAuth() {
    try {
      // First try Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const libraryNumber = generateLibraryNumber();
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          libraryNumber,
          points: 0,
          level: 1,
          badges: [],
          booksRead: 0,
          uploadsCount: 0
        });
        
        // Initialize user profile if not exists
        if (!userProfile) {
          const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
          const newProfile: UserProfile = {
            displayName: session.user.email?.split('@')[0] || 'User',
            avatarColor: randomColor,
            bio: 'Engineering enthusiast',
            joinedDate: new Date().toISOString(),
            favoriteGenre: 'Mechanical Engineering',
            readingGoal: 12,
            currentlyReading: [],
            completedBooks: []
          };
          setUserProfile(newProfile);
        }
        
        checkAndAwardBadge('newbie');
        return;
      }
      
      // Fallback: Check for backup auth token
      const backupToken = localStorage.getItem('auth_token');
      if (backupToken) {
        try {
          const response = await fetch('/api/auth', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${backupToken}` }
          });
          const data = await response.json();
          
          if (data.success && data.data?.authenticated && data.data.user) {
            const libraryNumber = generateLibraryNumber();
            setUser({
              id: data.data.user.id,
              email: data.data.user.email,
              libraryNumber,
              points: 0,
              level: 1,
              badges: [],
              booksRead: 0,
              uploadsCount: 0
            });
            
            const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
            const newProfile: UserProfile = {
              displayName: data.data.user.name,
              avatarColor: randomColor,
              bio: 'Engineering enthusiast',
              joinedDate: new Date().toISOString(),
              favoriteGenre: 'Mechanical Engineering',
              readingGoal: 12,
              currentlyReading: [],
              completedBooks: []
            };
            setUserProfile(newProfile);
            checkAndAwardBadge('newbie');
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token');
          }
        } catch (e) {
          console.error('Backup auth check failed:', e);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Try backup auth on error
      try {
        const backupToken = localStorage.getItem('auth_token');
        if (backupToken) {
          const response = await fetch('/api/auth', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${backupToken}` }
          });
          const data = await response.json();
          
          if (data.success && data.data?.authenticated && data.data.user) {
            const libraryNumber = generateLibraryNumber();
            setUser({
              id: data.data.user.id,
              email: data.data.user.email,
              libraryNumber,
              points: 0,
              level: 1,
              badges: [],
              booksRead: 0,
              uploadsCount: 0
            });
            
            const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
            const newProfile: UserProfile = {
              displayName: data.data.user.name,
              avatarColor: randomColor,
              bio: 'Engineering enthusiast',
              joinedDate: new Date().toISOString(),
              favoriteGenre: 'Mechanical Engineering',
              readingGoal: 12,
              currentlyReading: [],
              completedBooks: []
            };
            setUserProfile(newProfile);
            checkAndAwardBadge('newbie');
          }
        }
      } catch (backupError) {
        console.error('Backup auth also failed:', backupError);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    // Use backup auth directly (bypass Supabase)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: emailInput,
          password: passwordInput || 'dummy_password'
        })
      });
      const data = await response.json();
      
      if (data.success && data.data?.success) {
        // Store token
        if (data.data.token) {
          localStorage.setItem('auth_token', data.data.token);
        }
        const libraryNumber = generateLibraryNumber();
        setUser({
          id: data.data.user.id,
          email: data.data.user.email,
          libraryNumber,
          points: 0,
          level: 1,
          badges: [],
          booksRead: 0,
          uploadsCount: 0
        });
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
        const newProfile: UserProfile = {
          displayName: data.data.user.name,
          avatarColor: randomColor,
          bio: 'Engineering enthusiast',
          joinedDate: new Date().toISOString(),
          favoriteGenre: 'Mechanical Engineering',
          readingGoal: 12,
          currentlyReading: [],
          completedBooks: []
        };
        setUserProfile(newProfile);
        checkAndAwardBadge('newbie');
        setShowAuthModal(false);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setAuthError(data.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    // Use backup auth directly (bypass Supabase)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: emailInput,
          password: passwordInput,
          name: emailInput.split('@')[0]
        })
      });
      const data = await response.json();
      
      if (data.success && data.data?.success) {
        // Store token
        if (data.data.token) {
          localStorage.setItem('auth_token', data.data.token);
        }
        const libraryNumber = generateLibraryNumber();
        setUser({
          id: data.data.user.id,
          email: data.data.user.email,
          libraryNumber,
          points: 0,
          level: 1,
          badges: [],
          booksRead: 0,
          uploadsCount: 0
        });
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
        const newProfile: UserProfile = {
          displayName: data.data.user.name,
          avatarColor: randomColor,
          bio: 'New engineering student',
          joinedDate: new Date().toISOString(),
          favoriteGenre: 'Mechanical Engineering',
          readingGoal: 12,
          currentlyReading: [],
          completedBooks: []
        };
        setUserProfile(newProfile);
        checkAndAwardBadge('newbie');
        alert('Account created successfully!');
        setShowAuthModal(false);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setAuthError(data.data?.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setAuthError('Signup failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    // Try Supabase logout
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Supabase logout error (ignoring):', e);
    }
    
    // Also clear backup auth
    const backupToken = localStorage.getItem('auth_token');
    if (backupToken) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (e) {
        console.log('Backup logout error (ignoring):', e);
      }
      localStorage.removeItem('auth_token');
    }
    
    setUser(null);
    setFavorites([]);
    setActiveTab('search');
  }

  function toggleFavorite(book: Book) {
    const exists = favorites.some(f => f.key === book.key);
    if (exists) {
      setFavorites(favorites.filter(f => f.key !== book.key));
    } else {
      setFavorites([...favorites, book]);
    }
  }

  const isFavorite = useCallback((book: Book) => favorites.some(f => f.key === book.key), [favorites]);

  // Handle book upload
  function handleUploadBook(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.author) return;
    
    setUploadingBook(true);
    
    const newBook: Book = {
      key: `/uploaded/${Date.now()}`,
      title: uploadForm.title,
      author: uploadForm.author,
      year: uploadForm.year,
      description: uploadForm.description,
      subjects: [uploadForm.category],
      isUploaded: true,
      fileUrl: uploadForm.fileUrl || undefined,
      dateAdded: new Date().toISOString(),
      coverId: undefined
    };
    
    setTimeout(() => {
      setMyBooks([newBook, ...myBooks]);
      setUploadingBook(false);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        author: '',
        year: new Date().getFullYear(),
        description: '',
        category: 'Mechanical Engineering',
        fileUrl: ''
      });
      
      // Award points for uploading
      if (user) {
        const newPoints = user.points + 50;
        const newLevel = Math.floor(newPoints / 500) + 1;
        setUser({ ...user, points: newPoints, level: newLevel, uploadsCount: user.uploadsCount + 1 });
      }
      
      checkAndAwardBadge('uploader');
      checkAndAwardBadge('contributor');
      checkAchievements();
    }, 1000);
  }

  // Delete uploaded book
  function deleteBook(bookKey: string) {
    setMyBooks(myBooks.filter(b => b.key !== bookKey));
  }

  // Get AI-powered recommendations using Hugging Face Inference API
  async function getAIRecommendations() {
    setLoadingAI(true);
    
    // Simulate AI recommendations based on user preferences
    // In production, this would call the Hugging Face API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recommendations: AIRecommendation[] = [
      { title: 'Advanced Thermodynamics', author: 'Dr. Richard Feynman', reason: 'Based on your interest in Mechanical Engineering', matchScore: 95 },
      { title: 'Control System Design', author: 'Prof. Katherine Johnson', reason: 'Complements your reading on Control Systems', matchScore: 88 },
      { title: 'Finite Element Methods', author: 'Dr. Robert Cook', reason: 'Highly rated in your favorite category', matchScore: 82 },
      { title: 'Signal Processing Fundamentals', author: 'Alan V. Oppenheim', reason: 'Trending among users with similar interests', matchScore: 79 },
      { title: 'Computational Fluid Dynamics', author: 'Dr. John Anderson', reason: 'Advanced topic based on your level', matchScore: 75 },
    ];
    
    setAiRecommendations(recommendations);
    checkAndAwardBadge('ai_user');
    setLoadingAI(false);
  }

  // Save profile changes
  function saveProfile() {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      displayName: profileForm.displayName || userProfile.displayName,
      bio: profileForm.bio,
      favoriteGenre: profileForm.favoriteGenre,
      readingGoal: profileForm.readingGoal
    };
    
    setUserProfile(updatedProfile);
    setShowProfileEdit(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) searchBooks(query);
      else if (query.length === 0) setBooks([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  async function searchBooks(q: string) {
    setLoadingBooks(true);
    const newSearchCount = searchCount + 1;
    setSearchCount(newSearchCount);
    localStorage.setItem('searchCount', newSearchCount.toString());

    try {
      const categoryQuery = searchCategory === 'all' ? q : `${q} ${searchCategory}`;
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(categoryQuery)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,subject,ebook_access,number_of_pages_median,publisher_name`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const mapped: Book[] = data.docs.map((doc: any) => ({
        key: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] || 'Unknown Author',
        year: doc.first_publish_year || 'N/A',
        coverId: doc.cover_i,
        subjects: doc.subject?.slice(0, 5) || [],
        pdf: doc.ebook_access === 'public' ? `https://openlibrary.org${doc.key}.pdf` : null,
        link: `https://openlibrary.org${doc.key}`,
        pages: doc.number_of_pages_median,
        publisher: doc.publisher_name?.[0]
      }));
      setBooks(mapped);
      checkAchievements();
    } catch (error) {
      console.error('Search error:', error);
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }

  // Load trending books when tab changes or filter changes
  useEffect(() => {
    if (activeTab === 'trending' && user) {
      getTrendingBooks();
    }
  }, [activeTab, trendingFilter, user]);

  // Load recommendations when tab changes
  useEffect(() => {
    if (activeTab === 'recommendations' && user) {
      getRecommendations();
    }
  }, [activeTab, user, favorites, userProfile]);

  function getCoverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  // Get trending books with filter
  function getTrendingBooks() {
    setLoadingTrending(true);
    
    // Simulate API call with filter
    setTimeout(() => {
      let filtered = [...trendingBooksData];
      
      // Apply time filter multipliers
      switch (trendingFilter) {
        case 'daily':
          filtered = filtered.map(book => ({
            ...book,
            views: Math.floor(book.views * 0.1),
            downloads: Math.floor(book.downloads * 0.1)
          }));
          break;
        case 'weekly':
          filtered = filtered.map(book => ({
            ...book,
            views: Math.floor(book.views * 0.4),
            downloads: Math.floor(book.downloads * 0.4)
          }));
          break;
        case 'monthly':
          filtered = filtered.map(book => ({
            ...book,
            views: Math.floor(book.views * 0.8),
            downloads: Math.floor(book.downloads * 0.8)
          }));
          break;
        case 'alltime':
        default:
          // Use original data
          break;
      }
      
      // Sort by views by default
      filtered.sort((a, b) => b.views - a.views);
      
      setTrendingBooks(filtered);
      setLoadingTrending(false);
    }, 800);
  }

  // Get recommendations based on user preferences or curated list
  function getRecommendations() {
    setLoadingRecommendations(true);
    
    setTimeout(() => {
      // If user has favorites or profile with favorite genre, use personalized
      if (userProfile?.favoriteGenre && favorites.length > 0) {
        // Personalized recommendations based on user's favorite genre
        const personalized = curatedRecommendations.filter(
          book => book.subjects?.some(s => 
            s.toLowerCase().includes(userProfile.favoriteGenre.toLowerCase().split(' ')[0])
          )
        );
        
        if (personalized.length > 0) {
          setRecommendations(personalized);
        } else {
          setRecommendations(curatedRecommendations.slice(0, 4));
        }
      } else {
        // Return curated recommendations for new users
        setRecommendations(curatedRecommendations);
      }
      setLoadingRecommendations(false);
    }, 600);
  }

  const levelInfo = useMemo(() => {
    if (!user) return { current: 1, next: 500, progress: 0 };
    const currentLevelPoints = (user.level - 1) * 500;
    const nextLevelPoints = user.level * 500;
    const progress = ((user.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return { current: user.level, next: nextLevelPoints, progress: Math.min(progress, 100) };
  }, [user?.points, user?.level]);

  function renderBookCard(book: Book) {
    const coverUrl = getCoverUrl(book.coverId);
    const favorite = isFavorite(book);
    return (
      <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-amber-400 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
        {coverUrl ? (
          <div className="aspect-[2/3] relative overflow-hidden">
            <img src={coverUrl} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
          </div>
        ) : (
          <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
            {book.isUploaded ? <FileText className="text-amber-500" size={48} /> : <BookOpen className="text-gray-600" size={48} />}
          </div>
        )}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-amber-500 transition">{book.title}</h3>
            {book.isUploaded && <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded shrink-0">My Book</span>}
          </div>
          <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
          <p className="text-xs text-gray-500 mt-1">{book.year}</p>
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`mt-2 flex items-center gap-1 text-xs transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-amber-500'}`}>
            <Heart size={14} fill={favorite ? 'currentColor' : 'none'} />
            {favorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  function renderBookRow(book: Book) {
    const coverUrl = getCoverUrl(book.coverId, 'S');
    const favorite = isFavorite(book);
    return (
      <div key={book.key} onClick={() => setSelectedBook(book)} className={`group flex gap-4 p-4 rounded-lg border transition hover:border-amber-400 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-md'}`}>
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded shrink-0" loading="lazy" />
        ) : (
          <div className={`w-16 h-24 flex items-center justify-center rounded shrink-0 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
            {book.isUploaded ? <FileText className="text-amber-500" size={24} /> : <BookOpen className="text-gray-600" size={24} />}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold group-hover:text-amber-500 transition truncate">{book.title}</h3>
            {book.isUploaded && <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">My Book</span>}
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
          <p className="text-xs text-gray-500 mt-1">Published: {book.year}</p>
          <div className="flex gap-2 mt-2">
            {book.pdf && <span className="text-xs text-amber-500">PDF Available</span>}
            <span className="text-xs text-gray-500">Open Library</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`p-2 rounded transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-amber-500'}`}>
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          {book.pdf && <a href={book.pdf} onClick={(e) => e.stopPropagation()} className="text-xs bg-amber-500 text-black px-3 py-1 rounded font-semibold hover:bg-yellow-400">Read</a>}
        </div>
      </div>
    );
  }

  function renderAuthModal() {
    if (!showAuthModal) return null;
    const isLogin = authMode === 'login';
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-amber-500/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-500">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" required />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" required minLength={6} />
              </div>
            )}
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading} className="w-full bg-amber-500 text-black font-bold py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {authLoading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="mt-4 text-center text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setAuthMode(isLogin ? 'signup' : 'login'); setAuthError(''); }} className="text-amber-500 hover:underline">{isLogin ? 'Sign Up' : 'Sign In'}</button>
          </div>
        </div>
      </div>
    );
  }

  function renderUploadModal() {
    if (!showUploadModal) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-amber-500/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
              <Upload size={24} /> Upload Book
            </h2>
            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <form onSubmit={handleUploadBook} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Book Title *</label>
              <input type="text" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Author *</label>
              <input type="text" value={uploadForm.author} onChange={(e) => setUploadForm({...uploadForm, author: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <input type="number" value={uploadForm.year} onChange={(e) => setUploadForm({...uploadForm, year: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={uploadForm.category} onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none h-24 resize-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Book URL (optional)</label>
              <input type="url" value={uploadForm.fileUrl} onChange={(e) => setUploadForm({...uploadForm, fileUrl: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={uploadingBook} className="w-full bg-amber-500 text-black font-bold py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {uploadingBook ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              {uploadingBook ? 'Uploading...' : 'Upload Book'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  function renderBookModal() {
    if (!selectedBook) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/30">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-amber-500 pr-4">{selectedBook.title}</h2>
              <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-white shrink-0"><X size={24} /></button>
            </div>
            <div className="flex border-b border-slate-700 mb-4">
              <button onClick={() => setBookDetailTab('overview')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'overview' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>Overview</button>
              <button onClick={() => setBookDetailTab('description')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'description' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>Description</button>
              <button onClick={() => setBookDetailTab('details')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'details' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400 hover:text-white'}`}>Details</button>
            </div>
            <div className="mb-4">
              {bookDetailTab === 'overview' && (
                <div>
                  <p className="text-lg text-gray-300 mb-2">{selectedBook.author}</p>
                  <p className="text-gray-500 mb-4">Published: {selectedBook.year}</p>
                  {selectedBook.subjects && selectedBook.subjects.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBook.subjects.map((subject, i) => (<span key={i} className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300">{subject}</span>))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {bookDetailTab === 'description' && (
                <div>
                  <p className="text-gray-300 leading-relaxed">{selectedBook.description || 'No description available for this book. This comprehensive resource covers essential topics in the field and provides valuable insights for engineering students and professionals.'}</p>
                  {selectedBook.isUploaded && (
                    <p className="text-amber-500 mt-4 text-sm">📚 This is a personal book you uploaded to your library.</p>
                  )}
                  <p className="text-gray-400 mt-4 text-sm">Use the Open Library link to read more about this book and access additional resources.</p>
                </div>
              )}
              {bookDetailTab === 'details' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Author</p><p className="font-medium">{selectedBook.author}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Year</p><p className="font-medium">{selectedBook.year}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Pages</p><p className="font-medium">{selectedBook.pages || 'N/A'}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Publisher</p><p className="font-medium">{selectedBook.publisher || 'N/A'}</p></div>
                  {selectedBook.isUploaded && (
                    <>
                      <div className="bg-slate-700/50 p-3 rounded col-span-2"><p className="text-gray-400 text-sm">Date Added</p><p className="font-medium">{selectedBook.dateAdded ? new Date(selectedBook.dateAdded).toLocaleDateString() : 'N/A'}</p></div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6 flex-wrap">
              {selectedBook.pdf && (<a href={selectedBook.pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"><BookOpen size={18} />Read PDF</a>)}
              {selectedBook.fileUrl && (<a href={selectedBook.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"><Download size={18} />Download</a>)}
              {selectedBook.link && (<a href={selectedBook.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-amber-500 text-amber-500 px-4 py-2 rounded hover:bg-amber-500 hover:text-black transition"><ChevronRight size={18} />Open Library</a>)}
              <button onClick={() => toggleFavorite(selectedBook)} className={`flex items-center gap-2 px-4 py-2 rounded border transition ${isFavorite(selectedBook) ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-gray-600 text-gray-400 hover:border-amber-500 hover:text-amber-500'}`}>
                <Heart size={18} fill={isFavorite(selectedBook) ? 'currentColor' : 'none'} />
                {isFavorite(selectedBook) ? 'Saved' : 'Save'}
              </button>
              {selectedBook.isUploaded && (
                <button onClick={() => { deleteBook(selectedBook.key); setSelectedBook(null); }} className="flex items-center gap-2 px-4 py-2 rounded border border-red-500/50 text-red-400 hover:bg-red-500/20 transition">
                  <Trash2 size={18} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDashboard() {
    if (!user) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg"><BookText className="text-amber-500" size={20} /></div>
              <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Books Read</p><p className="text-2xl font-bold">{user.booksRead}</p></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg"><Zap className="text-purple-400" size={20} /></div>
              <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Points</p><p className="text-2xl font-bold">{user.points}</p></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg"><Heart className="text-green-400" size={20} /></div>
              <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Favorites</p><p className="text-2xl font-bold">{favorites.length}</p></div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg"><Flame className="text-orange-400" size={20} /></div>
              <div><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Day Streak</p><p className="text-2xl font-bold">{streak}</p></div>
            </div>
          </div>
        </div>
        
        {/* My Books Stats */}
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Library className="text-amber-500" size={24} /><h3 className="font-bold text-lg">My Library</h3>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 text-sm bg-amber-500 text-black px-3 py-1.5 rounded font-medium hover:bg-yellow-400 transition">
              <Plus size={16} /> Add Book
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-500">{myBooks.length}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Uploaded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{user.uploadsCount}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Contributions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{searchCount}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Searches</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg"><Crown className="text-amber-500" size={24} /></div>
              <div><p className="font-bold text-lg">Level {levelInfo.current}</p><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.points} / {levelInfo.next} points</p></div>
            </div>
            <Trophy className="text-amber-500" size={32} />
          </div>
          <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Library className="text-amber-500" size={24} /><h3 className="font-bold text-lg">My Library Card</h3>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border-2 border-dashed border-amber-500/50`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Library Number</p>
            <p className="text-2xl font-mono font-bold text-amber-500 tracking-wider">{user.libraryNumber}</p>
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-amber-500" size={24} /><h3 className="font-bold text-lg">My Badges</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {availableBadges.map((badge) => {
              const earned = user.badges.some(b => b.id === badge.id);
              return (
                <div key={badge.id} className={`p-3 rounded-lg text-center transition ${earned ? 'bg-amber-500/20 border border-amber-500/50' : theme === 'dark' ? 'bg-slate-800 opacity-50' : 'bg-gray-100 opacity-50'}`} title={badge.description}>
                  <span className="text-2xl">{badge.icon}</span>
                  <p className={`text-xs mt-1 ${earned ? 'text-amber-500' : 'text-gray-500'}`}>{badge.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-amber-500" size={24} /><h3 className="font-bold text-lg">Achievements</h3>
          </div>
          <div className="space-y-3">
            {achievements.slice(0, 6).map((achievement) => {
              let currentValue = 0;
              switch (achievement.type) { 
                case 'books': currentValue = user.booksRead; break; 
                case 'points': currentValue = user.points; break; 
                case 'favorites': currentValue = favorites.length; break; 
                case 'searches': currentValue = searchCount; break;
                case 'uploads': currentValue = myBooks.length; break;
              }
              const progress = Math.min((currentValue / achievement.requirement) * 100, 100);
              const completed = currentValue >= achievement.requirement;
              return (
                <div key={achievement.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Medal className={completed ? 'text-amber-500' : 'text-gray-500'} size={16} /><span className={`font-medium ${completed ? 'text-amber-500' : ''}`}>{achievement.name}</span></div>
                    <span className={`text-sm ${completed ? 'text-green-400' : 'text-gray-500'}`}>{currentValue}/{achievement.requirement}</span>
                  </div>
                  <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all ${completed ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderProfile() {
    if (!user || !userProfile) return null;
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start gap-6">
            <div className={`w-24 h-24 rounded-full ${userProfile.avatarColor} flex items-center justify-center text-4xl font-bold text-white`}>
              {userProfile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{userProfile.displayName}</h2>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  <p className="mt-2">{userProfile.bio}</p>
                </div>
                <button onClick={() => {
                  setProfileForm({
                    displayName: userProfile.displayName,
                    bio: userProfile.bio,
                    favoriteGenre: userProfile.favoriteGenre,
                    readingGoal: userProfile.readingGoal
                  });
                  setShowProfileEdit(true);
                }} className="p-2 rounded border border-gray-600 hover:border-amber-500 transition">
                  <Edit size={20} className="text-gray-400 hover:text-amber-500" />
                </button>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Joined {new Date(userProfile.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Favorite: {userProfile.favoriteGenre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-gray-400" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Goal: {userProfile.readingGoal} books/year</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showProfileEdit && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-amber-500/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-500">Edit Profile</h2>
                <button onClick={() => setShowProfileEdit(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                  <input type="text" value={profileForm.displayName} onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bio</label>
                  <textarea value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none h-20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorite Genre</label>
                  <select value={profileForm.favoriteGenre} onChange={(e) => setProfileForm({...profileForm, favoriteGenre: e.target.value})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reading Goal (books/year)</label>
                  <input type="number" value={profileForm.readingGoal} onChange={(e) => setProfileForm({...profileForm, readingGoal: parseInt(e.target.value)})} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-amber-500 focus:outline-none" min={1} max={100} />
                </div>
                <button onClick={saveProfile} className="w-full bg-amber-500 text-black font-bold py-3 rounded hover:bg-yellow-400 transition">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Reading Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="text-amber-500" size={20} /> Reading Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Annual Goal</span>
                  <span className="text-amber-500">{user.booksRead} / {userProfile.readingGoal}</span>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((user.booksRead / userProfile.readingGoal) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mt-4">
                <div>
                  <p className="text-2xl font-bold text-green-400">{streak}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Day Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{favorites.length}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Favorites</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Trophy className="text-amber-500" size={20} /> Points & Level</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Level</span>
                <span className="font-bold text-amber-500">Level {user.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Points</span>
                <span className="font-bold text-purple-400">{user.points}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Points to Next Level</span>
                <span className="font-bold">{levelInfo.next - user.points}</span>
              </div>
              <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${levelInfo.progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Award className="text-amber-500" size={20} /> Earned Badges ({user.badges.length}/{availableBadges.length})</h3>
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {availableBadges.map((badge) => {
              const earned = user.badges.some(b => b.id === badge.id);
              return (
                <div key={badge.id} className={`p-4 rounded-lg text-center transition ${earned ? 'bg-amber-500/20 border border-amber-500/50' : theme === 'dark' ? 'bg-slate-800 opacity-40' : 'bg-gray-100 opacity-40'}`}>
                  <span className="text-3xl">{badge.icon}</span>
                  <p className={`text-sm font-medium mt-2 ${earned ? 'text-amber-500' : 'text-gray-500'}`}>{badge.name}</p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderMyBooks() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Library className="text-amber-500" size={28} />My Personal Library</h2>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">
            <Plus size={18} /> Upload Book
          </button>
        </div>
        
        {myBooks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {myBooks.map((book) => renderBookCard(book))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <Library className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">Your personal library is empty</p>
            <p className="text-gray-500 text-sm mb-4">Upload your own books to build your collection!</p>
            <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition">
              <Upload size={18} /> Upload Your First Book
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderAIRecommendations() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Bot className="text-amber-500" size={28} />AI Book Recommendations</h2>
          <button onClick={getAIRecommendations} disabled={loadingAI} className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition disabled:opacity-50">
            {loadingAI ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            {loadingAI ? 'Analyzing...' : 'Get Recommendations'}
          </button>
        </div>

        {/* Daily Suggestion */}
        {dailySuggestion && (
          <div className={`p-6 rounded-lg border bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkle className="text-amber-500" size={20} />
              <span className="text-amber-500 font-semibold">Daily Suggestion</span>
            </div>
            <h3 className="text-xl font-bold mb-1">{dailySuggestion.title}</h3>
            <p className="text-gray-400 mb-2">by {dailySuggestion.author}</p>
            <p className="text-sm text-gray-500">{dailySuggestion.reason}</p>
            <span className="inline-block mt-3 text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">{dailySuggestion.category}</span>
          </div>
        )}

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="text-purple-400" size={20} /> Personalized for You</h3>
            {aiRecommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border transition hover:border-amber-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">AI Match: {rec.matchScore}%</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">by {rec.author}</p>
                    <p className="text-sm text-gray-500 mt-2">{rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <Bot className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg mb-2">AI-Powered Recommendations</p>
            <p className="text-gray-500 text-sm mb-4">Click the button above to get personalized book recommendations based on your reading history and preferences using Hugging Face AI.</p>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Sparkle size={14} /> Personalized</span>
              <span className="flex items-center gap-1"><Sparkles size={14} /> Smart Matching</span>
              <span className="flex items-center gap-1"><Lightbulb size={14} /> Context-Aware</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderStore() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3"><ShoppingCart className="text-amber-500" size={28} />Book Store</h2>
          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><span className="text-amber-500 font-bold">{user?.points || 0}</span><span className="text-gray-400 ml-1">points</span></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeItems.map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border transition hover:border-amber-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'subscription' ? 'bg-purple-500/20 text-purple-400' : item.type === 'course' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{item.type === 'subscription' ? 'Subscription' : item.type === 'course' ? 'Course' : 'E-Book'}</span>
                <span className="text-amber-500 font-bold flex items-center gap-1"><DollarSign size={14} />{item.price}</span>
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>{item.description}</p>
              <button className="w-full bg-amber-500 text-black font-semibold py-2 rounded hover:bg-yellow-400 transition" onClick={() => alert('This is a demo. In production, this would process the purchase!')}>{user && user.points >= item.price ? 'Redeem' : 'Not Enough Points'}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderLibraryBooks() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3"><Library className="text-amber-500" size={28} />Library Collection</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {libraryBooks.map((book) => {
            const favorite = isFavorite(book);
            return (
              <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-amber-400 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                {book.coverId ? (
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img src={getCoverUrl(book.coverId) || ''} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
                  </div>
                ) : (
                  <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><BookOpen className="text-gray-600" size={48} /></div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-amber-500 transition">{book.title}</h3>
                  <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.year}</p>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`mt-2 flex items-center gap-1 text-xs transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-amber-500'}`}><Heart size={14} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Saved' : 'Save'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderTrendingBooks() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-3"><TrendingUp className="text-amber-500" size={28} />Trending Books</h2>
          <div className="flex gap-2">
            <button onClick={() => setTrendingFilter('daily')} className={`px-3 py-1.5 rounded text-sm font-medium transition ${trendingFilter === 'daily' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Daily</button>
            <button onClick={() => setTrendingFilter('weekly')} className={`px-3 py-1.5 rounded text-sm font-medium transition ${trendingFilter === 'weekly' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Weekly</button>
            <button onClick={() => setTrendingFilter('monthly')} className={`px-3 py-1.5 rounded text-sm font-medium transition ${trendingFilter === 'monthly' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Monthly</button>
            <button onClick={() => setTrendingFilter('alltime')} className={`px-3 py-1.5 rounded text-sm font-medium transition ${trendingFilter === 'alltime' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Time</button>
          </div>
        </div>

        {loadingTrending ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>
        ) : trendingBooks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingBooks.map((book) => (
              <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-amber-400 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                {book.coverId ? (
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img src={getCoverUrl(book.coverId) || ''} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
                  </div>
                ) : (
                  <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><BookOpen className="text-gray-600" size={48} /></div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-amber-500 transition">{book.title}</h3>
                  <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.year}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-amber-500"><Eye size={12} />{book.views.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-green-400"><Download size={12} />{book.downloads.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" />{book.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <TrendingUp className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No trending books available</p>
            <p className="text-gray-500 text-sm">Check back later for popular books</p>
          </div>
        )}
      </div>
    );
  }

  function renderRecommendations() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3"><Sparkles className="text-purple-400" size={28} />
            {userProfile?.favoriteGenre && favorites.length > 0 
              ? `Recommended for You` 
              : 'Curated Recommendations'}
          </h2>
          <button onClick={getRecommendations} disabled={loadingRecommendations} className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition">
            <RefreshCw size={16} className={loadingRecommendations ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {userProfile?.favoriteGenre && favorites.length > 0 && (
          <div className={`p-4 rounded-lg border bg-purple-500/10 border-purple-500/30 ${theme === 'dark' ? 'bg-slate-900' : 'bg-purple-50'}`}>
            <p className="text-sm">
              <span className="text-purple-400 font-medium">Personalized picks</span> based on your interest in <span className="text-amber-500">{userProfile.favoriteGenre}</span> and {favorites.length} saved books
            </p>
          </div>
        )}

        {loadingRecommendations ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-purple-400" size={40} /></div>
        ) : recommendations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((book, index) => (
              <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-purple-400 cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                {book.coverId ? (
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img src={getCoverUrl(book.coverId) || ''} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
                  </div>
                ) : (
                  <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><BookOpen className="text-gray-600" size={48} /></div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-purple-400 transition">{book.title}</h3>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded shrink-0">#{index + 1}</span>
                  </div>
                  <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.year}</p>
                  {book.subjects && book.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {book.subjects.slice(0, 2).map((subject, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded">{subject}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
            <Sparkles className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No recommendations available</p>
            <p className="text-gray-500 text-sm">Save some books to get personalized picks</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading EngineerVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookMarked className="text-amber-500" size={32} />
            <div>
              <h1 className="text-xl font-black text-amber-500">EngineerVault</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Engineering E-Library</p>
            </div>
          </div>
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => setActiveTab('search')} className={`px-3 py-2 rounded transition ${activeTab === 'search' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><Search size={18} /></button>
              <button onClick={() => setActiveTab('books')} className={`px-3 py-2 rounded transition ${activeTab === 'books' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><Library size={18} /></button>
              <button onClick={() => setActiveTab('mybooks')} className={`px-3 py-2 rounded transition ${activeTab === 'mybooks' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`} title="My Books"><BookText size={18} /></button>
              <button onClick={() => setActiveTab('trending')} className={`px-3 py-2 rounded transition ${activeTab === 'trending' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`} title="Trending"><TrendingUp size={18} /></button>
              <button onClick={() => setActiveTab('recommendations')} className={`px-3 py-2 rounded transition ${activeTab === 'recommendations' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`} title="Recommendations"><Sparkles size={18} /></button>
              <button onClick={() => setActiveTab('ai')} className={`px-3 py-2 rounded transition ${activeTab === 'ai' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`} title="AI Recommendations"><Bot size={18} /></button>
              <button onClick={() => setActiveTab('favorites')} className={`px-3 py-2 rounded transition ${activeTab === 'favorites' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><Heart size={18} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /></button>
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 rounded transition ${activeTab === 'dashboard' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><User size={18} /></button>
              <button onClick={() => setActiveTab('profile')} className={`px-3 py-2 rounded transition ${activeTab === 'profile' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><Settings size={18} /></button>
              <button onClick={() => setActiveTab('store')} className={`px-3 py-2 rounded transition ${activeTab === 'store' ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500'}`}><ShoppingCart size={18} /></button>
            </div>
          )}
          <div className="flex items-center gap-3">
            {user && <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full"><Zap className="text-amber-500" size={14} /><span className="text-sm font-bold text-amber-500">{user.points}</span><span className="text-xs text-gray-400">pts</span></div>}
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={handleLogout} className="p-2 rounded hover:text-red-400 transition" title="Logout"><LogOut size={20} /></button>
              </div>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black transition"><LogIn size={16} />Login</button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"><UserPlus size={16} />Sign Up</button>
              </>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded border transition ${theme === 'dark' ? 'border-slate-700 hover:border-amber-500' : 'border-gray-300 hover:border-amber-500'}`}>{theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}</button>
            {user && <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded"><Menu size={20} /></button>}
          </div>
        </div>
        {user && mobileMenuOpen && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} p-4`}>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'search' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Search size={20} /><span className="text-xs">Search</span></button>
              <button onClick={() => { setActiveTab('books'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'books' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Library size={20} /><span className="text-xs">Books</span></button>
              <button onClick={() => { setActiveTab('mybooks'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'mybooks' ? 'text-amber-500 bg-amber-500/10' : ''}`}><BookText size={20} /><span className="text-xs">My Books</span></button>
              <button onClick={() => { setActiveTab('trending'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'trending' ? 'text-amber-500 bg-amber-500/10' : ''}`}><TrendingUp size={20} /><span className="text-xs">Trending</span></button>
              <button onClick={() => { setActiveTab('recommendations'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'recommendations' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Sparkles size={20} /><span className="text-xs">For You</span></button>
              <button onClick={() => { setActiveTab('ai'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'ai' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Bot size={20} /><span className="text-xs">AI</span></button>
              <button onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'favorites' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Heart size={20} /><span className="text-xs">Favorites</span></button>
              <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'dashboard' ? 'text-amber-500 bg-amber-500/10' : ''}`}><User size={20} /><span className="text-xs">Dashboard</span></button>
              <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'profile' ? 'text-amber-500 bg-amber-500/10' : ''}`}><Settings size={20} /><span className="text-xs">Profile</span></button>
              <button onClick={() => { setActiveTab('store'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'store' ? 'text-amber-500 bg-amber-500/10' : ''}`}><ShoppingCart size={20} /><span className="text-xs">Store</span></button>
            </div>
          </div>
        )}
      </header>

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-6 py-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <Trophy size={24} />
              <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{showAchievement.name}</p>
                <p className="text-xs">+{showAchievement.reward} points</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {!entered && (
        <section className={`py-20 ${theme === 'dark' ? 'bg-gradient-to-b from-slate-900 to-black' : 'bg-gradient-to-b from-white to-gray-100'}`}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-amber-500">EngineerVault Library</h1>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Search engineering books, PDFs, and resources from around the world. Access thousands of free engineering documents.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.slice(0, 4).map((cat) => (<span key={cat} className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{cat}</span>))}
            </div>
            <button onClick={() => setEntered(true)} className="bg-amber-500 text-black text-lg font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 active:scale-95 transition shadow-lg shadow-amber-500/20">Enter Library</button>
          </div>
        </section>
      )}

      {/* Main Content */}
      {entered && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'dashboard' && user && renderDashboard()}
          {activeTab === 'profile' && user && renderProfile()}
          {activeTab === 'store' && user && renderStore()}
          {activeTab === 'books' && user && renderLibraryBooks()}
          {activeTab === 'mybooks' && user && renderMyBooks()}
          {activeTab === 'trending' && user && renderTrendingBooks()}
          {activeTab === 'recommendations' && user && renderRecommendations()}
          {activeTab === 'ai' && user && renderAIRecommendations()}
          {(activeTab === 'search' || activeTab === 'favorites') && (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search engineering books..." value={query} onChange={(e) => setQuery(e.target.value)} className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:border-amber-500 transition ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                  <div className="flex gap-2">
                    <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className={`px-4 py-3 rounded-lg border focus:outline-none focus:border-amber-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    <div className={`flex border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`}>
                      <button onClick={() => setViewMode('grid')} className={`p-3 transition ${viewMode === 'grid' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-900 text-gray-400' : 'bg-white text-gray-400'}`}><Grid3X3 size={20} /></button>
                      <button onClick={() => setViewMode('list')} className={`p-3 transition ${viewMode === 'list' ? 'bg-amber-500 text-black' : theme === 'dark' ? 'bg-slate-900 text-gray-400' : 'bg-white text-gray-400'}`}><List size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{activeTab === 'favorites' ? 'My Favorites' : 'Search Results'}</h2>
                <span className="text-gray-400">{loadingBooks ? 'Searching...' : `${activeTab === 'favorites' ? favorites.length : books.length} books found`}</span>
              </div>
              {loadingBooks && (<div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-500" size={40} /></div>)}
              {activeTab === 'favorites' && favorites.length > 0 && (<div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>{favorites.map((book) => (viewMode === 'grid' ? renderBookCard(book) : renderBookRow(book)))}</div>)}
              {activeTab === 'search' && books.length > 0 && (<div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>{books.map((book) => (viewMode === 'grid' ? renderBookCard(book) : renderBookRow(book)))}</div>)}
              {!loadingBooks && activeTab === 'search' && books.length === 0 && query.length >= 2 && (<div className="text-center py-12"><BookOpen className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-400 text-lg">No books found. Try a different search term.</p></div>)}
              {!loadingBooks && activeTab === 'search' && query.length < 2 && books.length === 0 && (<div className="text-center py-12"><Search className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-400 text-lg">Start typing to search for engineering books</p></div>)}
              {activeTab === 'favorites' && favorites.length === 0 && (<div className="text-center py-12"><Heart className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-400 text-lg">No favorites yet. Save some books!</p></div>)}
            </>
          )}
        </main>
      )}

      {/* Featured Resources */}
      {entered && activeTab === 'search' && books.length === 0 && query.length < 2 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.map((resource, index) => (
              <div key={index} className={`p-4 rounded-lg border transition hover:border-amber-400 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-500 uppercase">{resource.type}</span>
                  <span className="text-xs text-gray-500">{resource.year}</span>
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{resource.category}</p>
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, i) => (<span key={i} className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">{tag}</span>))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderAuthModal()}
      {renderUploadModal()}
      {renderBookModal()}
    </div>
  );
}
