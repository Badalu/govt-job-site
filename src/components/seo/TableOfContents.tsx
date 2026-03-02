// src/components/seo/TableOfContents.tsx
'use client';
import { useState } from 'react';

interface TOCItem { id: string; text: string; level: number; }

export default function TableOfContents({ items }: { items: TOCItem[] }) {
  const [open, setOpen] = useState(true);
  if (!items.length) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl mb-5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-orange-100 transition"
      >
        <span className="font-bold text-sm text-orange-800 flex items-center gap-2">
          📑 Table of Contents
        </span>
        <span className={`text-orange-600 text-lg transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <nav className="px-4 pb-3">
          <ol className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className={item.level === 3 ? 'pl-4' : ''}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-blue-700 hover:text-orange-600 hover:underline flex items-start gap-2 py-0.5 leading-snug"
                >
                  <span className="shrink-0 text-orange-400 font-mono text-xs mt-0.5">
                    {item.level === 2 ? (i + 1) + '.' : '›'}
                  </span>
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
