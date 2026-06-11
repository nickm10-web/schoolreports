// Standalone preview + hub for the End of Year Reports.
//
//   /eoy-preview.html                 -> clickable gallery of every school report
//   /eoy-preview.html?school=<slug>   -> that school's report
//
// Independent of src/main.tsx and its routes, so it works even while the app
// shell is mid-build.

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EndOfYearReport } from './EndOfYearReport';
import { loadSchoolReport, listSchoolSlugs } from './schools';
import type { ReportData } from './types';

const fill: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0D0B12',
  color: 'rgba(255,255,255,.6)',
  fontFamily: "'Barlow', system-ui, sans-serif",
};

type Item = { slug: string; name: string; logo: string };

function Hub() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    const slugs = listSchoolSlugs();
    Promise.all(
      slugs.map((slug) =>
        loadSchoolReport(slug).then((d) => ({
          slug,
          name: d?.program.name ?? slug,
          logo: d?.program.logoSrc ?? '',
        })),
      ),
    ).then((list) => {
      list.sort((a, b) => a.name.localeCompare(b.name));
      setItems(list);
    });
  }, []);

  if (!items) return <div style={fill}>Loading reports…</div>;

  return (
    <div className="hub-root">
      <style>{HUB_CSS}</style>
      <header className="hub-head">
        <div className="hub-bar">
          <span className="hub-bear">
            <img src="/JABA%20head%20trimmed.png" alt="JABA" />
          </span>
          <span className="hub-eyebrow">JABA · End of Year Reports</span>
        </div>
        <h1 className="hub-title">
          THE YEAR <span className="v">IN NIL</span>
        </h1>
        <p className="hub-sub">
          {items.length} programs. Click any school to open its report.
        </p>
      </header>

      <div className="hub-grid">
        {items.map((it) => (
          <a key={it.slug} className="hub-card" href={`?school=${it.slug}`}>
            <div className="hub-logo">
              {it.logo ? <img src={it.logo} alt={it.name} /> : <span>{it.name[0]}</span>}
            </div>
            <div className="hub-name">{it.name}</div>
            <div className="hub-cta">View report →</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ReportView({ slug }: { slug: string }) {
  const [state, setState] = useState<
    { s: 'load' } | { s: 'ok'; data: ReportData } | { s: 'miss' }
  >({ s: 'load' });
  useEffect(() => {
    loadSchoolReport(slug.toLowerCase()).then((d) =>
      setState(d ? { s: 'ok', data: d } : { s: 'miss' }),
    );
  }, [slug]);

  if (state.s === 'load') return <div style={fill}>Loading {slug}…</div>;
  if (state.s === 'miss') return <div style={fill}>No report for “{slug}”.</div>;
  // No navigation back to the directory — a school only ever sees its own report.
  return <EndOfYearReport data={state.data} />;
}

function App() {
  const slug = new URLSearchParams(window.location.search).get('school');
  return slug ? <ReportView slug={slug} /> : <Hub />;
}

// Reuse the root across Vite HMR re-executions (avoids duplicate-createRoot warnings).
const w = window as unknown as { __eoyRoot?: ReturnType<typeof createRoot> };
w.__eoyRoot ??= createRoot(document.getElementById('root')!);
w.__eoyRoot.render(<App />);

const HUB_CSS = `
.hub-root{min-height:100vh;background:#0D0B12;color:#fff;font-family:'Barlow',system-ui,sans-serif;
  --volt:#DFFF00;--card:#13111A;--line:rgba(255,255,255,.08);padding:0 0 80px;}
.hub-root *{box-sizing:border-box;}
.hub-head{max-width:1180px;margin:0 auto;padding:48px 28px 28px;}
.hub-bar{display:flex;align-items:center;gap:12px;margin-bottom:26px;}
.hub-bear{width:40px;height:40px;border-radius:999px;background:var(--volt);display:inline-flex;align-items:center;justify-content:center;flex:none;}
.hub-bear img{width:80%;height:80%;object-fit:contain;}
.hub-eyebrow{font-family:'Barlow Semi Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.28em;font-size:14px;color:var(--volt);}
.hub-title{font-family:'Bebas Neue',sans-serif;text-transform:uppercase;font-size:clamp(2.6rem,7vw,5rem);line-height:.9;letter-spacing:-.01em;margin:0;}
.hub-title .v{color:var(--volt);}
.hub-sub{color:rgba(255,255,255,.55);margin-top:14px;font-size:16px;}
.hub-grid{max-width:1180px;margin:8px auto 0;padding:0 28px;display:grid;gap:16px;
  grid-template-columns:repeat(auto-fill,minmax(210px,1fr));}
.hub-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px 20px;text-decoration:none;color:#fff;
  display:flex;flex-direction:column;align-items:center;text-align:center;transition:border-color .15s,transform .15s,box-shadow .15s;}
.hub-card:hover{border-color:var(--volt);transform:translateY(-3px);box-shadow:0 10px 40px rgba(223,255,0,.08);}
.hub-logo{width:84px;height:84px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;padding:12px;margin-bottom:16px;}
.hub-logo img{max-width:100%;max-height:100%;object-fit:contain;}
.hub-logo span{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#0D0B12;}
.hub-name{font-family:'Barlow Semi Condensed',sans-serif;font-weight:800;text-transform:uppercase;font-size:1.5rem;line-height:1;letter-spacing:.01em;}
.hub-cta{margin-top:12px;font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.1em;font-size:12.5px;color:var(--volt);opacity:0;transition:opacity .15s;}
.hub-card:hover .hub-cta{opacity:1;}
`;
