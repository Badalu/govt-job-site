// src/components/ui/Header.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/jobs', label: 'All Jobs' },
  { href: '/result', label: 'Result' },
  { href: '/admit-card', label: 'Admit Card' },
  { href: '/answer-key', label: 'Answer Key' },
  { href: '/syllabus', label: 'Syllabus' },
];

const CATEGORY_LINKS = [
  { href: '/category/ssc', icon: '📋', label: 'SSC' },
  { href: '/category/railway', icon: '🚂', label: 'Railway' },
  { href: '/category/banking', icon: '🏦', label: 'Banking' },
  { href: '/category/police', icon: '👮', label: 'Police' },
  { href: '/category/defense', icon: '🎖️', label: 'Defence' },
  { href: '/category/upsc', icon: '🏛️', label: 'UPSC' },
  { href: '/category/teaching', icon: '📚', label: 'Teaching' },
  { href: '/category/state-psc', icon: '🏢', label: 'State PSC' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar */}
      <div className="bg-gray-900 text-white py-1 px-4 text-[11px] flex items-center justify-between">
        <span className="hidden sm:block">📢 Free Job Alert — All Sarkari Naukri 2026 Notifications</span>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hover:text-orange-400 transition">Admin Panel</Link>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-red-700">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white text-red-700 font-black text-sm px-2 py-0.5 rounded">SN</div>
            <div>
              <div className="text-white font-black text-base leading-none">SarkariNaukri</div>
              <div className="text-orange-200 text-[10px] leading-none">.com — Govt Jobs 2026</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded transition ${
                  pathname === link.href ? 'bg-white text-red-700' : 'text-white hover:bg-red-600'
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu btn */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2 rounded hover:bg-red-600 transition">
            <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-orange-600 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-9 overflow-x-auto scrollbar-thin">
          {CATEGORY_LINKS.map(cat => (
            <Link key={cat.href} href={cat.href}
              className={`px-3 py-1 text-xs font-medium whitespace-nowrap rounded transition flex items-center gap-1 ${
                pathname.startsWith(cat.href) ? 'bg-white text-orange-700' : 'text-white hover:bg-orange-500'
              }`}>
              {cat.icon} {cat.label}
            </Link>
          ))}
          <Link href="/state/uttar-pradesh" className="px-3 py-1 text-xs font-medium whitespace-nowrap text-white hover:bg-orange-500 rounded transition">
            🗺️ State Jobs
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-orange-50 hover:text-orange-600 rounded-lg">
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {CATEGORY_LINKS.map(cat => (
              <Link key={cat.href} href={cat.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg flex items-center gap-2">
                {cat.icon} {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
