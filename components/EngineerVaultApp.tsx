// File: components/EngineerVaultApp.tsx
'use client';

import { useState } from 'react';
import { LogIn, UserPlus, MoonStar, Sun, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function EngineerVaultApp() {
  const [theme, setTheme] = useState<'dark' | 'darker'>('dark');
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);

  const roles = ['Student', 'Researcher', 'Contributor', 'Admin'];
  const [role, setRole] = useState(roles[0]);

  // ------------------------
  // Email input safely
  // ------------------------
  function getEmail(): string | null {
    const input = window.prompt('Enter your email:');
    if (!input || !input.includes('@')) return null;
    return input;
  }

  // ------------------------
  // Supabase auth
  // ------------------------
  async function handleLogin() {
    const email = getEmail();
    if (!email) return alert('Valid email required!');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (err: any) {
      alert('Login failed: ' + err.message);
    }
  }

  async function handleSignup() {
    const email = getEmail();
    if (!email) return alert('Valid email required!');
    try {
      const { error } = await supabase.auth.signUp({ email, password: 'dummy-password-123!' });
      if (error) throw error;
      alert('Check your email to confirm your account!');
    } catch (err: any) {
      alert('Sign up failed: ' + err.message);
    }
  }

  // ------------------------
  // OpenLibrary search
  // ------------------------
  async function searchBooks(q: string) {
    setQuery(q);
    if (!q) return setBooks([]);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const mapped = data.docs.slice(0, 10).map((doc: any) => {
        const pdfLink = doc.ia && doc.ebook_access === 'public'
          ? `https://archive.org/download/${doc.ia}/${doc.ia}.pdf`
          : null;
        const onlineLink = doc.key ? `https://openlibrary.org${doc.key}` : null;
        return {
          title: doc.title,
          author: doc.author_name?.[0] || 'Unknown',
          year: doc.first_publish_year || 'N/A',
          pdf: pdfLink,
          link: onlineLink,
        };
      });
      setBooks(mapped);
    } catch {
      setBooks([]);
    }
  }

  // ------------------------
  // JSX
  // ------------------------
  return (
    <main className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-900'} text-white`}>
      {/* Header */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-5xl font-black mb-4 text-gold">EngineerVault Library</h1>
        <p className="mb-6 text-gray-400">Search engineering books, PDFs, and resources.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setEntered(true)}
            className="bg-gold text-black font-bold px-6 py-3 rounded-md hover:bg-yellow-400 active:scale-95 transition"
          >
            Enter Library
          </button>

          <button
            onClick={handleLogin}
            className="border border-gold px-4 py-2 rounded-md hover:bg-gold hover:text-black transition"
          >
            <LogIn className="inline mr-1" size={16} /> Login
          </button>

          <button
            onClick={handleSignup}
            className="bg-gold px-4 py-2 rounded-md font-bold text-black hover:bg-yellow-400 active:scale-95 transition"
          >
            <UserPlus className="inline mr-1" size={16} /> Sign Up
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'darker' : 'dark')}
            className="border border-gold px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            {theme === 'dark' ? <MoonStar size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </section>

      {/* Library */}
      {entered && (
        <section className="px-6 py-12 max-w-5xl mx-auto">
          <div className="mb-6 flex items-center gap-2">
            <Search className="text-gold" />
            <input
              type="text"
              placeholder="Search books..."
              value={query}
              onChange={(e) => searchBooks(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-black border border-gold text-white focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {books.length === 0 && <p className="text-gray-400">No books found. Try another search.</p>}
            {books.map((book) => (
              <div key={book.title} className="p-4 rounded-md border border-gold bg-black">
                <h3 className="font-bold text-gold">{book.title}</h3>
                <p className="text-sm text-gray-400">{book.author} · {book.year}</p>
                {book.pdf && (
                  <a href={book.pdf} target="_blank" className="text-gold underline mt-2 inline-block">
                    Download PDF
                  </a>
                )}
                {!book.pdf && book.link && (
                  <a href={book.link} target="_blank" className="text-gold underline mt-2 inline-block">
                    Read Online
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}