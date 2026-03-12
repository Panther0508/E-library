'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { codeSnippets } from '@/lib/data';

type Language = 'c' | 'cpp' | 'python' | 'matlab';

interface CodeSnippetViewerProps {
    initialLanguage?: Language;
}

export default function CodeSnippetViewer({ initialLanguage = 'python' }: CodeSnippetViewerProps) {
    const [language, setLanguage] = useState<Language>(initialLanguage);
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const languages: { key: Language; label: string }[] = [
        { key: 'c', label: 'C' },
        { key: 'cpp', label: 'C++' },
        { key: 'python', label: 'Python' },
        { key: 'matlab', label: 'MATLAB' }
    ];

    const copyToClipboard = async () => {
        try {
            const snippet = codeSnippets[language];
            if (snippet) {
                await navigator.clipboard.writeText(snippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const currentSnippet = codeSnippets[language] || '';

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-gold transition"
                >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    Code Snippets
                </button>

                {expanded && (
                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-gray-300 focus:border-gold focus:outline-none"
                        >
                            {languages.map((lang) => (
                                <option key={lang.key} value={lang.key}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={copyToClipboard}
                            className="p-1.5 rounded hover:bg-slate-700 transition text-gray-400 hover:text-gold"
                            title="Copy code"
                        >
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Code Block */}
            {expanded && (
                <div className="relative">
                    <pre className="p-4 overflow-x-auto text-sm">
                        <code className="text-gray-300 font-mono">
                            {currentSnippet}
                        </code>
                    </pre>

                    {/* Language Badge */}
                    <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 text-xs rounded bg-gold/20 text-gold border border-gold/30">
                            {languages.find(l => l.key === language)?.label}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
