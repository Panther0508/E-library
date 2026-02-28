'use client';

import { useState } from 'react';
import { LogIn, UserPlus, MoonStar, Sun, Search } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '@/lib/supabaseClient';

export default function EngineerVaultApp() {
  const [theme, setTheme] = useState<'dark' | 'darker'>('dark');
  const [entered, setEntered] = useState(false);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<any[]>([]);

  // ------------------------
  // Email Prompt
  // ------------------------
  function getEmail(): string | null {
    const input = window.prompt('Enter your email:');
    if (!input || !input.includes('@')) return null;
    return input;
  }

  // ------------------------
  // Login (Magic Link)
  // ------------------------
  async function handleLogin() {
    const email = getEmail();
    if (!email) return alert('Valid email required.');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;
      alert('Check your email for login link!');
    } catch (err: any) {
      alert('Login failed: ' + err.message);
    }
  }

  // ------------------------
  // Signup (Magic Link + Create User)
  // ------------------------
  async function handleSignup() {
    const email = getEmail();
    if (!email) return alert('Valid email required.');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      alert('Check your email to confirm your account!');
    } catch (err: any) {
      alert('Signup failed: ' + err.message);
    }
  }

  // ------------------------
  // Book Search (Open Library)
  // ------------------------
  async function searchBooks(q: string) {
    setQuery(q);

    if (!q) {
      setBooks([]);
      return;
    }

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`
      );

      const data = await res.json();

      const mapped = data.docs.slice(0, 9).map((doc: any) => ({
        title: doc.title,
        author: doc.author_name?.[0] || 'Unknown',
        year: doc.first_publish_year || 'N/A',
      }));

      setBooks(mapped);
    } catch {
      setBooks([]);
    }
  }

  return (
    <main
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-black' : 'bg-gray-900'
      } text-white`}
    >
      {/* Header */}
      <section className="px-6 py-20 text-center">
        <h1 className="text-5xl font-black mb-4 text-yellow-500">
          EngineerVault Library
        </h1>

        <p className="mb-6 text-gray-400">
          Search engineering books, PDFs and resources.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setEntered(true)}
            className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-md hover:bg-yellow-400 active:scale-95 transition"
          >
            Enter Library
          </button>

          <button
            onClick={handleLogin}
            className="border border-yellow-500 px-4 py-2 rounded-md hover:bg-yellow-500 hover:text-black transition"
          >
            <LogIn className="inline mr-1" size={16} /> Login
          </button>

          <button
            onClick={handleSignup}
            className="bg-yellow-500 px-4 py-2 rounded-md font-bold text-black hover:bg-yellow-400 active:scale-95 transition"
          >
            <UserPlus className="inline mr-1" size={16} /> Sign Up
          </button>

          <button
            onClick={() =>
              setTheme(theme === 'dark' ? 'darker' : 'dark')
            }
            className="border border-yellow-500 px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            {theme === 'dark' ? (
              <MoonStar size={16} />
            ) : (
              <Sun size={16} />
            )}
          </button>
        </div>
      </section>

      {/* Library Section */}
      {entered && (
        <section className="px-6 py-12 max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8 flex items-center gap-2">
            <Search className="text-yellow-500" />
            <input
              type="text"
              placeholder="Search books..."
              value={query}
              onChange={(e) => searchBooks(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-black border border-yellow-500 text-white focus:outline-none"
            />
          </div>

          {/* Books Grid */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {books.length === 0 && (
              <p className="text-gray-400">
                No books found. Try another search.
              </p>
            )}

            {books.map((book) => (
              <div
                key={book.title}
                className="p-5 rounded-md border border-yellow-500 bg-black hover:shadow-lg hover:shadow-yellow-500/20 transition"
              >
                <h3 className="font-bold text-yellow-500 text-lg">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {book.author} • {book.year}
                </p>
              </div>
            ))}
          </div>

          {/* Code Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">
              Code Snippet Example
            </h2>

            <SyntaxHighlighter
              language="cpp"
              style={oneDark}
              customStyle={{
                borderRadius: 8,
                backgroundColor: '#000',
              }}
            >
              {`#include <iostream>

int main() {
  std::cout << "EngineerVault Ready!" << std::endl;
}`}
            </SyntaxHighlighter>
          </section>
        </section>
      )}
    </main>
  );
}