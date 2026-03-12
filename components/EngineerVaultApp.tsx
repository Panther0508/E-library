// File: components/EngineerVaultApp.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LogIn, UserPlus, MoonStar, Sun, Search, BookOpen, Heart, X, Loader2,
  Grid3X3, List, ChevronRight, Star, Clock, BookMarked, Settings, LogOut,
  User, Trophy, Award, Target, Zap, BookText, ShoppingCart, Library,
  DollarSign, TrendingUp, Users, Calendar, Medal, Crown, Flame, Sparkles,
  Bell, Menu, Home, Bookmark
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
  type: 'books' | 'points' | 'favorites' | 'searches';
}

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'ebook' | 'subscription' | 'course';
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

type Theme = 'light' | 'dark';
type ViewMode = 'grid' | 'list';
type SearchCategory = 'all' | string;
type ActiveTab = 'search' | 'favorites' | 'dashboard' | 'store' | 'books';
type BookDetailTab = 'overview' | 'description' | 'details';

interface UserData {
  id: string;
  email: string;
  libraryNumber: string;
  points: number;
  level: number;
  badges: Badge[];
  booksRead: number;
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

  // Initialize theme and check auth
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    const savedSearchCount = localStorage.getItem('searchCount');
    const savedStreak = localStorage.getItem('streak');
    const savedLastLogin = localStorage.getItem('lastLoginDate');

    if (savedSearchCount) setSearchCount(parseInt(savedSearchCount));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastLogin) setLastLoginDate(savedLastLogin);

    checkAuth();
  }, []);

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
          booksRead: 0
        });
        checkAndAwardBadge('newbie');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailInput,
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
      });
      if (error) throw error;
      alert('Check your email for the login link!');
      setShowAuthModal(false);
      setEmailInput('');
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
      });
      if (error) throw error;
      alert('Account created! Please check your email to verify.');
      setShowAuthModal(false);
      setEmailInput('');
      setPasswordInput('');
    } catch (error: any) {
      setAuthError(error.message || 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
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

  function getCoverUrl(coverId?: number, size: 'S' | 'M' | 'L' = 'M') {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
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
      <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-gold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
        {coverUrl ? (
          <div className="aspect-[2/3] relative overflow-hidden">
            <img src={coverUrl} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
          </div>
        ) : (
          <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <BookOpen className="text-gray-600" size={48} />
          </div>
        )}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-gold transition">{book.title}</h3>
          <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
          <p className="text-xs text-gray-500 mt-1">{book.year}</p>
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`mt-2 flex items-center gap-1 text-xs transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-gold'}`}>
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
      <div key={book.key} onClick={() => setSelectedBook(book)} className={`group flex gap-4 p-4 rounded-lg border transition hover:border-gold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-md'}`}>
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded shrink-0" loading="lazy" />
        ) : (
          <div className={`w-16 h-24 flex items-center justify-center rounded shrink-0 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
            <BookOpen className="text-gray-600" size={24} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold group-hover:text-gold transition truncate">{book.title}</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
          <p className="text-xs text-gray-500 mt-1">Published: {book.year}</p>
          <div className="flex gap-2 mt-2">
            {book.pdf && <span className="text-xs text-gold">PDF Available</span>}
            <span className="text-xs text-gray-500">Open Library</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`p-2 rounded transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-gold'}`}>
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>
          {book.pdf && <a href={book.pdf} onClick={(e) => e.stopPropagation()} className="text-xs bg-gold text-black px-3 py-1 rounded font-semibold hover:bg-yellow-400">Read</a>}
        </div>
      </div>
    );
  }

  function renderAuthModal() {
    if (!showAuthModal) return null;
    const isLogin = authMode === 'login';
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-gold-30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-gold focus:outline-none" required />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white focus:border-gold focus:outline-none" required minLength={6} />
              </div>
            )}
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" disabled={authLoading} className="w-full bg-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {authLoading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="mt-4 text-center text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setAuthMode(isLogin ? 'signup' : 'login'); setAuthError(''); }} className="text-gold hover:underline">{isLogin ? 'Sign Up' : 'Sign In'}</button>
          </div>
        </div>
      </div>
    );
  }

  function renderBookModal() {
    if (!selectedBook) return null;
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gold-30">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gold pr-4">{selectedBook.title}</h2>
              <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-white shrink-0"><X size={24} /></button>
            </div>
            <div className="flex border-b border-slate-700 mb-4">
              <button onClick={() => setBookDetailTab('overview')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'overview' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>Overview</button>
              <button onClick={() => setBookDetailTab('description')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'description' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>Description</button>
              <button onClick={() => setBookDetailTab('details')} className={`px-4 py-2 font-medium transition ${bookDetailTab === 'details' ? 'text-gold border-b-2 border-gold' : 'text-gray-400 hover:text-white'}`}>Details</button>
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
                  <p className="text-gray-400 mt-4 text-sm">Use the Open Library link to read more about this book and access additional resources.</p>
                </div>
              )}
              {bookDetailTab === 'details' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Author</p><p className="font-medium">{selectedBook.author}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Year</p><p className="font-medium">{selectedBook.year}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Pages</p><p className="font-medium">{selectedBook.pages || 'N/A'}</p></div>
                  <div className="bg-slate-700/50 p-3 rounded"><p className="text-gray-400 text-sm">Publisher</p><p className="font-medium">{selectedBook.publisher || 'N/A'}</p></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              {selectedBook.pdf && (<a href={selectedBook.pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"><BookOpen size={18} />Read PDF</a>)}
              {selectedBook.link && (<a href={selectedBook.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-gold text-gold px-4 py-2 rounded hover:bg-gold hover:text-black transition"><ChevronRight size={18} />Open Library</a>)}
              <button onClick={() => toggleFavorite(selectedBook)} className={`flex items-center gap-2 px-4 py-2 rounded border transition ${isFavorite(selectedBook) ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-gray-600 text-gray-400 hover:border-gold hover:text-gold'}`}>
                <Heart size={18} fill={isFavorite(selectedBook) ? 'currentColor' : 'none'} />
                {isFavorite(selectedBook) ? 'Saved' : 'Save'}
              </button>
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
              <div className="p-2 bg-gold-20 rounded-lg"><BookText className="text-gold" size={20} /></div>
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
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-20 rounded-lg"><Crown className="text-gold" size={24} /></div>
              <div><p className="font-bold text-lg">Level {levelInfo.current}</p><p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.points} / {levelInfo.next} points</p></div>
            </div>
            <Trophy className="text-gold" size={32} />
          </div>
          <div className={`h-3 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Library className="text-gold" size={24} /><h3 className="font-bold text-lg">My Library Card</h3>
          </div>
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'} border-2 border-dashed border-gold/50`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Library Number</p>
            <p className="text-2xl font-mono font-bold text-gold tracking-wider">{user.libraryNumber}</p>
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Award className="text-gold" size={24} /><h3 className="font-bold text-lg">My Badges</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {availableBadges.map((badge) => {
              const earned = user.badges.some(b => b.id === badge.id);
              return (
                <div key={badge.id} className={`p-3 rounded-lg text-center transition ${earned ? 'bg-gold-20 border border-gold/50' : theme === 'dark' ? 'bg-slate-800 opacity-50' : 'bg-gray-100 opacity-50'}`} title={badge.description}>
                  <span className="text-2xl">{badge.icon}</span>
                  <p className={`text-xs mt-1 ${earned ? 'text-gold' : 'text-gray-500'}`}>{badge.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-gold" size={24} /><h3 className="font-bold text-lg">Achievements</h3>
          </div>
          <div className="space-y-3">
            {achievements.slice(0, 6).map((achievement) => {
              let currentValue = 0;
              switch (achievement.type) { case 'books': currentValue = user.booksRead; break; case 'points': currentValue = user.points; break; case 'favorites': currentValue = favorites.length; break; case 'searches': currentValue = searchCount; break; }
              const progress = Math.min((currentValue / achievement.requirement) * 100, 100);
              const completed = currentValue >= achievement.requirement;
              return (
                <div key={achievement.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2"><Medal className={completed ? 'text-gold' : 'text-gray-500'} size={16} /><span className={`font-medium ${completed ? 'text-gold' : ''}`}>{achievement.name}</span></div>
                    <span className={`text-sm ${completed ? 'text-green-400' : 'text-gray-500'}`}>{currentValue}/{achievement.requirement}</span>
                  </div>
                  <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all ${completed ? 'bg-green-500' : 'bg-gold'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderStore() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-3"><ShoppingCart className="text-gold" size={28} />Book Store</h2>
          <div className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><span className="text-gold font-bold">{user?.points || 0}</span><span className="text-gray-400 ml-1">points</span></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeItems.map((item) => (
            <div key={item.id} className={`p-4 rounded-lg border transition hover:border-gold ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'subscription' ? 'bg-purple-500/20 text-purple-400' : item.type === 'course' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{item.type === 'subscription' ? 'Subscription' : item.type === 'course' ? 'Course' : 'E-Book'}</span>
                <span className="text-gold font-bold flex items-center gap-1"><DollarSign size={14} />{item.price}</span>
              </div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>{item.description}</p>
              <button className="w-full bg-gold text-black font-semibold py-2 rounded hover:bg-yellow-400 transition" onClick={() => alert('This is a demo. In production, this would process the purchase!')}>{user && user.points >= item.price ? 'Redeem' : 'Not Enough Points'}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderLibraryBooks() {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-3"><Library className="text-gold" size={28} />Library Collection</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {libraryBooks.map((book) => {
            const favorite = isFavorite(book);
            return (
              <div key={book.key} onClick={() => setSelectedBook(book)} className={`group rounded-lg border overflow-hidden transition hover:border-gold cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                {book.coverId ? (
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img src={getCoverUrl(book.coverId) || ''} alt={book.title} className="w-full h-full object-cover transition group-hover:scale-105" loading="lazy" />
                  </div>
                ) : (
                  <div className={`aspect-[2/3] flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}><BookOpen className="text-gray-600" size={48} /></div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-gold transition">{book.title}</h3>
                  <p className={`text-xs line-clamp-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{book.author}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.year}</p>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }} className={`mt-2 flex items-center gap-1 text-xs transition ${favorite ? 'text-red-400' : 'text-gray-500 hover:text-gold'}`}><Heart size={14} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Saved' : 'Save'}</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin text-gold mx-auto mb-4" size={48} />
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
            <BookMarked className="text-gold" size={32} />
            <div>
              <h1 className="text-xl font-black text-gold">EngineerVault</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Engineering E-Library</p>
            </div>
          </div>
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setActiveTab('search')} className={`px-3 py-2 rounded transition ${activeTab === 'search' ? 'text-gold bg-gold-10' : 'hover:text-gold'}`}><Search size={18} /></button>
              <button onClick={() => setActiveTab('books')} className={`px-3 py-2 rounded transition ${activeTab === 'books' ? 'text-gold bg-gold-10' : 'hover:text-gold'}`}><Library size={18} /></button>
              <button onClick={() => setActiveTab('favorites')} className={`px-3 py-2 rounded transition ${activeTab === 'favorites' ? 'text-gold bg-gold-10' : 'hover:text-gold'}`}><Heart size={18} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /></button>
              <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-2 rounded transition ${activeTab === 'dashboard' ? 'text-gold bg-gold-10' : 'hover:text-gold'}`}><User size={18} /></button>
              <button onClick={() => setActiveTab('store')} className={`px-3 py-2 rounded transition ${activeTab === 'store' ? 'text-gold bg-gold-10' : 'hover:text-gold'}`}><ShoppingCart size={18} /></button>
            </div>
          )}
          <div className="flex items-center gap-3">
            {user && <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gold-10 rounded-full"><Zap className="text-gold" size={14} /><span className="text-sm font-bold text-gold">{user.points}</span><span className="text-xs text-gray-400">pts</span></div>}
            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={handleLogout} className="p-2 rounded hover:text-red-400 transition" title="Logout"><LogOut size={20} /></button>
              </div>
            ) : (
              <>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded border border-gold text-gold hover:bg-gold hover:text-black transition"><LogIn size={16} />Login</button>
                <button onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }} className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded font-semibold hover:bg-yellow-400 transition"><UserPlus size={16} />Sign Up</button>
              </>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded border transition ${theme === 'dark' ? 'border-slate-700 hover:border-gold' : 'border-gray-300 hover:border-gold'}`}>{theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}</button>
            {user && <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded"><Menu size={20} /></button>}
          </div>
        </div>
        {user && mobileMenuOpen && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} p-4`}>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'search' ? 'text-gold bg-gold-10' : ''}`}><Search size={20} /><span className="text-xs">Search</span></button>
              <button onClick={() => { setActiveTab('books'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'books' ? 'text-gold bg-gold-10' : ''}`}><Library size={20} /><span className="text-xs">Books</span></button>
              <button onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'favorites' ? 'text-gold bg-gold-10' : ''}`}><Heart size={20} /><span className="text-xs">Favorites</span></button>
              <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'dashboard' ? 'text-gold bg-gold-10' : ''}`}><User size={20} /><span className="text-xs">Dashboard</span></button>
              <button onClick={() => { setActiveTab('store'); setMobileMenuOpen(false); }} className={`flex flex-col items-center gap-1 p-3 rounded ${activeTab === 'store' ? 'text-gold bg-gold-10' : ''}`}><ShoppingCart size={20} /><span className="text-xs">Store</span></button>
            </div>
          </div>
        )}
      </header>

      {/* Achievement Popup */}
      {showAchievement && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-gold to-yellow-400 text-black px-6 py-4 rounded-lg shadow-lg">
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
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-gold">EngineerVault Library</h1>
            <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Search engineering books, PDFs, and resources from around the world. Access thousands of free engineering documents.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.slice(0, 4).map((cat) => (<span key={cat} className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-slate-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{cat}</span>))}
            </div>
            <button onClick={() => setEntered(true)} className="bg-gold text-black text-lg font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 active:scale-95 transition shadow-lg shadow-gold/20">Enter Library</button>
          </div>
        </section>
      )}

      {/* Main Content */}
      {entered && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'dashboard' && user && renderDashboard()}
          {activeTab === 'store' && user && renderStore()}
          {activeTab === 'books' && user && renderLibraryBooks()}
          {(activeTab === 'search' || activeTab === 'favorites') && (
            <>
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search engineering books..." value={query} onChange={(e) => setQuery(e.target.value)} className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:border-gold transition ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                  <div className="flex gap-2">
                    <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} className={`px-4 py-3 rounded-lg border focus:outline-none focus:border-gold ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                    <div className={`flex border rounded-lg overflow-hidden ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`}>
                      <button onClick={() => setViewMode('grid')} className={`p-3 transition ${viewMode === 'grid' ? 'bg-gold text-black' : theme === 'dark' ? 'bg-slate-900 text-gray-400' : 'bg-white text-gray-400'}`}><Grid3X3 size={20} /></button>
                      <button onClick={() => setViewMode('list')} className={`p-3 transition ${viewMode === 'list' ? 'bg-gold text-black' : theme === 'dark' ? 'bg-slate-900 text-gray-400' : 'bg-white text-gray-400'}`}><List size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{activeTab === 'favorites' ? 'My Favorites' : 'Search Results'}</h2>
                <span className="text-gray-400">{loadingBooks ? 'Searching...' : `${activeTab === 'favorites' ? favorites.length : books.length} books found`}</span>
              </div>
              {loadingBooks && (<div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold" size={40} /></div>)}
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
              <div key={index} className={`p-4 rounded-lg border transition hover:border-gold ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-200 hover:shadow-lg'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gold uppercase">{resource.type}</span>
                  <span className="text-xs text-gray-500">{resource.year}</span>
                </div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{resource.category}</p>
                <div className="flex flex-wrap gap-1">
                  {resource.tags.map((tag, i) => (<span key={i} className="text-xs px-2 py-0.5 bg-gold-10 text-gold rounded">{tag}</span>))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderAuthModal()}
      {renderBookModal()}
    </div>
  );
}
