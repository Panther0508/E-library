'use client';

import { useMemo, useState } from 'react';
import { Bot, Bookmark, FileUp, LogIn, MoonStar, Search, ShieldCheck, Sun, UserPlus } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { categories, codeSnippet, resources, Role } from '@/lib/data';

const roles: Role[] = ['Student', 'Researcher', 'Contributor', 'Admin'];

export function EngineerVaultApp() {
  const [theme, setTheme] = useState<'dark' | 'darker'>('dark');
  const [entered, setEntered] = useState(false);
  const [role, setRole] = useState<Role>('Student');
  const [query, setQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesField = fieldFilter === 'All' || item.category === fieldFilter;
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesLevel = levelFilter === 'All' || item.level === levelFilter;
      const matchesYear = yearFilter === 'All' || item.year.toString() === yearFilter;

      return matchesQuery && matchesField && matchesType && matchesLevel && matchesYear;
    });
  }, [fieldFilter, levelFilter, query, typeFilter, yearFilter]);

  const suggestions = useMemo(() => {
    if (!query) return ['robotics control', 'MATLAB simulation', 'embedded C optimization'];
    return resources
      .flatMap((resource) => resource.tags)
      .filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4);
  }, [query]);

  return (
    <main className={`${theme === 'dark' ? 'bg-slateDark' : 'bg-black'} min-h-screen` }>
      <section className="relative overflow-hidden border-b border-gold/30 px-6 py-20">
        <div className="absolute inset-0 animate-pulseGrid bg-blueprint bg-blueprint opacity-50" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <p className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gold">
              EngineerVault
            </p>
            <h1 className="text-4xl font-black uppercase leading-tight text-white md:text-6xl">Build. Design. Innovate.</h1>
            <p className="max-w-xl text-zinc-300">
              AI-powered digital engineering knowledge hub for research papers, project blueprints, simulation files, code snippets,
              and hands-on tutorials.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setEntered(true)}
                className="glow rounded-md bg-gold px-5 py-3 font-semibold text-black transition hover:-translate-y-0.5"
              >
                Enter Library
              </button>
              <button
                onClick={() => setTheme((current) => (current === 'dark' ? 'darker' : 'dark'))}
                className="rounded-md border border-gold/40 px-4 py-3 text-gold"
              >
                {theme === 'dark' ? <MoonStar size={18} /> : <Sun size={18} />}
              </button>
            </div>
          </div>
          <div className="w-full max-w-md rounded-xl border border-gold/30 bg-panel/85 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-gold">Authentication</h2>
            <div className="space-y-3">
              <label className="text-sm text-zinc-300">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button className="rounded-md border border-gold/40 px-3 py-2 text-sm text-zinc-100">
                  <LogIn className="mr-1 inline" size={14} /> Login
                </button>
                <button className="rounded-md bg-gold px-3 py-2 text-sm font-semibold text-black">
                  <UserPlus className="mr-1 inline" size={14} /> Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {entered && (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-xl border border-zinc-800 bg-panel p-5">
              <h3 className="text-lg font-semibold text-gold">Dashboard</h3>
              <p className="mt-2 text-sm text-zinc-300">Welcome back, {role}. Continue where you left off.</p>
              <div className="mt-4 space-y-2 text-sm text-zinc-200">
                <p>Recently viewed: High-Efficiency Motor Drive Blueprint</p>
                <p>Recommended: Autonomous Robot Control in Python</p>
                <p className="flex items-center gap-2 text-gold"><Bookmark size={15} /> 14 Bookmarks ready</p>
              </div>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-panel p-5 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gold">Advanced Search</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">AI Search</span>
                  <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-3">
                    <Search size={14} className="text-zinc-400" />
                    <input
                      className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                      placeholder="Search engineering topics"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>
                </label>
                <Filter value={fieldFilter} onChange={setFieldFilter} label="Field" options={['All', ...categories]} />
                <Filter value={typeFilter} onChange={setTypeFilter} label="File type" options={['All', 'PDF', 'Blueprint', 'Code', 'Video']} />
                <Filter value={levelFilter} onChange={setLevelFilter} label="Academic level" options={['All', 'Beginner', 'Intermediate', 'Undergraduate', 'Research']} />
                <Filter value={yearFilter} onChange={setYearFilter} label="Year" options={['All', '2025', '2024', '2023', '2022']} />
              </div>
              <p className="mt-3 text-xs text-zinc-400">AI suggestions: {suggestions.join(' · ')}</p>
            </article>
          </div>

          <section className="rounded-xl border border-zinc-800 bg-panel p-5">
            <h3 className="text-lg font-semibold text-gold">Engineering Categories</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <div key={category} className="rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-200">
                  {category}
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-zinc-800 bg-panel p-5">
              <h3 className="text-lg font-semibold text-gold">Resource Types</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                <li>📄 PDF viewer integration</li>
                <li>🧪 Research papers and journals</li>
                <li>🧭 Project blueprints and circuit diagrams</li>
                <li>🧩 Code snippets with syntax highlighting</li>
                <li>🎥 Embedded video lectures</li>
                <li>💾 Save for offline access</li>
              </ul>
              <div className="mt-4 overflow-hidden rounded-md border border-zinc-700">
                <SyntaxHighlighter language="cpp" style={oneDark} customStyle={{ margin: 0, background: '#0b0b0b' }}>
                  {codeSnippet}
                </SyntaxHighlighter>
              </div>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-panel p-5">
              <h3 className="text-lg font-semibold text-gold">Contributor Upload & Admin Approval</h3>
              <div className="mt-3 space-y-3 text-sm text-zinc-300">
                <p className="flex items-center gap-2"><FileUp size={15} className="text-gold" /> Upload files with tags and descriptions</p>
                <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-gold" /> Admin validation queue for quality assurance</p>
                <p>Sample status: <span className="text-gold">3 pending</span> · <span className="text-emerald-400">18 approved</span></p>
                <div className="rounded-md border border-zinc-700 bg-zinc-900 p-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Pending submissions</p>
                  <p className="mt-1">Hydraulic Arm CAD Assembly • Contributor • Awaiting admin review</p>
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-xl border border-zinc-800 bg-panel p-5">
              <h3 className="text-lg font-semibold text-gold">AI Study Assistant</h3>
              <div className="mt-3 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm">
                <p className="text-zinc-300"><Bot size={14} className="mr-1 inline text-gold" />Ask: “Explain PID tuning for robotic arms.”</p>
                <p className="mt-2 text-zinc-400">Assistant: Start with Ziegler-Nichols baseline, then optimize rise-time vs overshoot using simulation.</p>
              </div>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-panel p-5">
              <h3 className="text-lg font-semibold text-gold">Matching Resources</h3>
              <div className="mt-3 space-y-2 text-sm">
                {filteredResources.map((resource) => (
                  <div key={resource.title} className="rounded-md border border-zinc-700 bg-zinc-900 p-3">
                    <p className="font-medium text-zinc-100">{resource.title}</p>
                    <p className="text-xs text-zinc-400">
                      {resource.category} · {resource.type} · {resource.level} · {resource.year}
                    </p>
                  </div>
                ))}
                {filteredResources.length === 0 && <p className="text-zinc-500">No resources matched. Try different filters.</p>}
              </div>
            </article>
          </section>
        </section>
      )}
    </main>
  );
}

type FilterProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function Filter({ label, value, onChange, options }: FilterProps) {
  return (
    <label>
      <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-sm"
      >
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
