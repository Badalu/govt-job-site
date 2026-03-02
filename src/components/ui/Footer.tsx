// src/components/ui/Footer.tsx
import Link from 'next/link';

const FOOTER_LINKS = {
  'Sarkari Naukri': [
    { href: '/jobs', label: 'All Govt Jobs 2026' },
    { href: '/category/ssc', label: 'SSC Recruitment 2026' },
    { href: '/category/railway', label: 'Railway Jobs 2026' },
    { href: '/category/banking', label: 'Bank Jobs 2026' },
    { href: '/category/police', label: 'Police Bharti 2026' },
    { href: '/category/upsc', label: 'UPSC 2026' },
    { href: '/category/defense', label: 'Defence Jobs 2026' },
    { href: '/category/teaching', label: 'Teacher Vacancy 2026' },
  ],
  'Results & Cards': [
    { href: '/result', label: 'Sarkari Result 2026' },
    { href: '/admit-card', label: 'Admit Card 2026' },
    { href: '/answer-key', label: 'Answer Key 2026' },
    { href: '/syllabus', label: 'Exam Syllabus 2026' },
  ],
  'By Qualification': [
    { href: '/tag/10th-pass', label: '10th Pass Jobs' },
    { href: '/tag/12th-pass', label: '12th Pass Jobs' },
    { href: '/tag/graduate', label: 'Graduate Level Jobs' },
    { href: '/tag/engineering', label: 'Engineering Jobs' },
    { href: '/tag/medical', label: 'Medical/Health Jobs' },
  ],
};

const TOP_STATES = [
  'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Maharashtra',
  'Haryana', 'Punjab', 'Gujarat', 'Delhi', 'Karnataka',
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-300 mt-8">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-600 text-white font-black text-sm px-2 py-0.5 rounded">SN</div>
              <div className="text-white font-bold text-base">SarkariNaukri.com</div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              India's trusted platform for latest Sarkari Naukri 2026 notifications. Free government job alerts, result, admit card updates.
            </p>
            <div className="flex gap-2">
              {['Twitter', 'Facebook', 'Telegram'].map(s => (
                <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded cursor-pointer hover:text-white transition">{s}</span>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-1.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-gray-400 hover:text-orange-400 transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* State links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">State Wise Jobs</h3>
            <ul className="space-y-1.5">
              {TOP_STATES.map(state => (
                <li key={state}>
                  <Link href={`/state/${state.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-xs text-gray-400 hover:text-orange-400 transition">
                    {state} Govt Jobs
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO text */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            SarkariNaukri.com — Your one-stop destination for <Link href="/jobs" className="text-gray-400 hover:text-orange-400">Sarkari Naukri 2026</Link>,{' '}
            <Link href="/result" className="text-gray-400 hover:text-orange-400">Sarkari Result</Link>,{' '}
            <Link href="/admit-card" className="text-gray-400 hover:text-orange-400">Admit Card</Link>, and{' '}
            <Link href="/answer-key" className="text-gray-400 hover:text-orange-400">Answer Key</Link> updates.
            We cover SSC, Railway, Bank, Police, UPSC, State PSC and all government recruitment notifications.
            All information is sourced from official government websites.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} SarkariNaukri.com. All rights reserved. For information purposes only.
          </p>
          <div className="flex gap-4">
            {[
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/privacy-policy', label: 'Privacy Policy' },
              { href: '/disclaimer', label: 'Disclaimer' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-xs text-gray-500 hover:text-orange-400 transition">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
