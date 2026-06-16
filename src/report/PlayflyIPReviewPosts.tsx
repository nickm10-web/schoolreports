// PlayFly · School-IP manual verification.
//
// All 436 sponsored posts that were flagged as using school IP (logo or caption
// mention) but where no school reference could be auto-detected in the caption or
// the vision description / OCR. The list is split in half between two reviewers
// (Jordon / Nick) via the tab selector; each marks their own posts Keep (genuinely
// uses school IP) or Cut (false positive). Decisions persist per reviewer in
// localStorage and export to CSV.

import { useEffect, useMemo, useState } from 'react';
import { REVIEW_POSTS } from './playflyIPReviewData';
import type { ReviewPost } from './playflyIPReviewData';

type Decision = 'keep' | 'cut';
type Reviewer = 'jordon' | 'nick';

const REVIEWERS: { id: Reviewer; name: string }[] = [
  { id: 'jordon', name: 'Jordon' },
  { id: 'nick', name: 'Nick' },
];
const keyFor = (r: Reviewer) => `pfip_ipreview_${r}`;
// Stable split: even index -> Jordon, odd index -> Nick (interleaved so both
// halves have a comparable mix of high/low engagement posts).
const ownerOf = (i: number): Reviewer => (i % 2 === 0 ? 'jordon' : 'nick');

function load(r: Reviewer): Record<string, Decision> {
  try { return JSON.parse(localStorage.getItem(keyFor(r)) || '{}'); } catch { return {}; }
}
function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n);
}

export function PlayflyIPReviewPosts() {
  const [reviewer, setReviewer] = useState<Reviewer>('jordon');
  const [all, setAll] = useState<Record<Reviewer, Record<string, Decision>>>(() => ({
    jordon: load('jordon'), nick: load('nick'),
  }));
  const [filter, setFilter] = useState<'all' | 'todo' | 'keep' | 'cut'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    localStorage.setItem(keyFor('jordon'), JSON.stringify(all.jordon));
    localStorage.setItem(keyFor('nick'), JSON.stringify(all.nick));
  }, [all]);

  const dec = all[reviewer];
  const setD = (link: string, v: Decision) =>
    setAll((a) => {
      const cur = { ...a[reviewer] };
      if (cur[link] === v) delete cur[link]; else cur[link] = v;
      return { ...a, [reviewer]: cur };
    });

  // posts owned by each reviewer (memoized once)
  const owned = useMemo(() => {
    const m: Record<Reviewer, ReviewPost[]> = { jordon: [], nick: [] };
    REVIEW_POSTS.forEach((p, i) => m[ownerOf(i)].push(p));
    return m;
  }, []);
  const mine = owned[reviewer];

  const keepN = mine.filter((p) => dec[p.link] === 'keep').length;
  const cutN = mine.filter((p) => dec[p.link] === 'cut').length;

  const shown = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return mine.filter((p) => {
      const d = dec[p.link];
      if (filter === 'todo' && d) return false;
      if (filter === 'keep' && d !== 'keep') return false;
      if (filter === 'cut' && d !== 'cut') return false;
      if (ql && !(`${p.ath} ${p.brand} ${p.cap}`.toLowerCase().includes(ql))) return false;
      return true;
    });
  }, [mine, dec, filter, q]);

  const downloadCsv = () => {
    const name = REVIEWERS.find((r) => r.id === reviewer)!.name;
    const rows: string[][] = [['reviewer', 'athlete', 'brand', 'signals', 'decision', 'ig_link', 'caption']];
    mine.forEach((p) =>
      rows.push([
        name, p.ath, p.brand,
        [p.logo && 'logo', p.ment && 'mention'].filter(Boolean).join('+'),
        dec[p.link] || 'undecided', p.link, (p.cap || '').replace(/\s+/g, ' '),
      ]),
    );
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `PlayFly_IP_Review_${name}_decisions.csv`;
    a.click();
  };

  const chips: { k: typeof filter; label: string }[] = [
    { k: 'all', label: `All (${mine.length})` },
    { k: 'todo', label: 'Undecided' },
    { k: 'keep', label: 'Keep' },
    { k: 'cut', label: 'Cut' },
  ];

  return (
    <div className="pfir-root">
      <style>{CSS}</style>
      <header className="pfir-head">
        <div className="pfir-title">PLAYFLY · <b>SCHOOL-IP REVIEW</b></div>
        <div className="pfir-sub">
          436 sponsored posts flagged as using school IP but with no school reference auto-detected,
          split in half. Pick your tab and review your set: does each post actually show or name the
          school (logo on a jersey, helmet, shirt, or in the caption)? Mark <b>Keep</b> if real,
          <b> Cut</b> if not. Use “View on IG” when the thumbnail isn’t clear. Picks save automatically;
          hit <b>Download decisions</b> when done.
        </div>

        <div className="pfir-tabs">
          {REVIEWERS.map((r) => {
            const list = owned[r.id];
            const done = list.filter((p) => all[r.id][p.link]).length;
            return (
              <button key={r.id} className={`pfir-tab ${reviewer === r.id ? 'on' : ''}`}
                onClick={() => setReviewer(r.id)}>
                {r.name}<span className="pfir-tab-meta">{done}/{list.length}</span>
              </button>
            );
          })}
        </div>

        <div className="pfir-controls">
          <input className="pfir-in" placeholder="Search athlete, brand, caption…"
            value={q} onChange={(e) => setQ(e.target.value)} />
          {chips.map((c) => (
            <span key={c.k} className={`pfir-chip ${filter === c.k ? 'on' : ''}`}
              onClick={() => setFilter(c.k)}>{c.label}</span>
          ))}
          <div className="pfir-prog">
            <span className="pfir-stat">{keepN + cutN}/{mine.length} done · {keepN} keep · {cutN} cut</span>
            <button className="pfir-btn" onClick={downloadCsv}>Download decisions (CSV)</button>
          </div>
        </div>
      </header>

      <div className="pfir-grid">
        {shown.length === 0 && <div className="pfir-empty">Nothing here.</div>}
        {shown.map((p) => <Card key={p.link || p.ath + p.brand} p={p} d={dec[p.link]} setD={setD} />)}
      </div>
    </div>
  );
}

function Card({ p, d, setD }: { p: ReviewPost; d?: Decision; setD: (l: string, v: Decision) => void }) {
  const sig = [p.logo && 'logo', p.ment && 'mention'].filter(Boolean).join(' + ');
  return (
    <div className={`pfir-card ${d || ''}`}>
      <div className="pfir-thumb">
        {p.thumb && <img loading="lazy" src={p.thumb} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        <div className="pfir-badges">
          {p.logo && <span className="pfir-b logo">Logo</span>}
          {p.ment && <span className="pfir-b ment">Mention</span>}
        </div>
        {p.type && <span className="pfir-type">{p.type}</span>}
      </div>
      <div className="pfir-body">
        <div className="pfir-row1">
          {p.img
            ? <img className="pfir-av" src={p.img} alt="" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
            : <div className="pfir-av" />}
          <div>
            <div className="pfir-ath">{p.ath}</div>
            <div className="pfir-bnd">{p.brand}</div>
          </div>
        </div>
        <div className="pfir-cap">{p.cap || 'no caption'}</div>
        <div className="pfir-ev">
          <span className="pfir-ev-h">⚠ {sig} flagged · confirm the school</span>
          {p.desc ? `Vision: ${p.desc}` : 'No vision description — check the image.'}
          {p.ocr && <div className="pfir-ocr">OCR: {p.ocr}</div>}
        </div>
        <div className="pfir-met">
          <div><span className="pfir-n">{fmt(p.likes)}</span><span className="pfir-l">Likes</span></div>
          <div><span className="pfir-n">{fmt(p.cmts)}</span><span className="pfir-l">Comments</span></div>
          <div><span className="pfir-n">{p.er}%</span><span className="pfir-l">Eng</span></div>
        </div>
        <div className="pfir-foot">
          <span className="pfir-date">{p.date}</span>
          {p.link && <a className="pfir-lk" href={p.link} target="_blank" rel="noopener noreferrer">View on IG ↗</a>}
        </div>
        <div className="pfir-acts">
          <button className={`pfir-act k ${d === 'keep' ? 'sel' : ''}`} onClick={() => setD(p.link, 'keep')}>✓ Keep</button>
          <button className={`pfir-act c ${d === 'cut' ? 'sel' : ''}`} onClick={() => setD(p.link, 'cut')}>✕ Cut</button>
        </div>
      </div>
    </div>
  );
}

export default PlayflyIPReviewPosts;

const CSS = `
.pfir-root{--ink:#0D0B12;--card:#13111A;--line:rgba(255,255,255,.08);--volt:#E2F500;--keep:#4ADE80;--cut:#EF4444;
  --t1:#fff;--t2:rgba(255,255,255,.62);--t3:rgba(255,255,255,.4);
  background:var(--ink);color:var(--t1);min-height:100vh;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.pfir-root *{box-sizing:border-box;}
.pfir-head{position:sticky;top:0;z-index:10;background:rgba(13,11,18,.97);border-bottom:1px solid var(--line);padding:16px 20px;backdrop-filter:blur(8px);}
.pfir-title{font-weight:800;font-size:20px;}.pfir-title b{color:var(--volt);}
.pfir-sub{color:var(--t3);font-size:12.5px;margin-top:3px;max-width:820px;line-height:1.5;}
.pfir-sub b{color:var(--t2);}
.pfir-tabs{display:inline-flex;gap:4px;margin-top:12px;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:4px;}
.pfir-tab{display:flex;align-items:center;gap:8px;background:transparent;border:none;color:var(--t2);font-family:inherit;font-weight:800;font-size:14px;border-radius:8px;padding:9px 18px;cursor:pointer;}
.pfir-tab.on{background:var(--volt);color:var(--ink);}
.pfir-tab-meta{font-weight:700;font-size:11px;opacity:.7;}
.pfir-tab.on .pfir-tab-meta{opacity:.85;}
.pfir-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;}
.pfir-in{background:var(--card);border:1px solid var(--line);color:var(--t1);border-radius:9px;padding:8px 12px;font-size:13px;font-family:inherit;min-width:220px;}
.pfir-chip{background:var(--card);border:1px solid var(--line);color:var(--t2);border-radius:999px;padding:7px 13px;font-size:12.5px;cursor:pointer;user-select:none;}
.pfir-chip.on{background:var(--volt);color:var(--ink);border-color:var(--volt);font-weight:700;}
.pfir-prog{margin-left:auto;display:flex;gap:10px;align-items:center;}
.pfir-stat{color:var(--t3);font-size:12.5px;}
.pfir-btn{background:var(--volt);color:var(--ink);border:none;border-radius:9px;padding:9px 14px;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;}
.pfir-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;padding:18px 20px 80px;}
.pfir-card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .15s,opacity .15s;}
.pfir-card.keep{border-color:var(--keep);}
.pfir-card.cut{border-color:var(--cut);opacity:.55;}
.pfir-thumb{position:relative;aspect-ratio:1/1;background:#000;}
.pfir-thumb img{width:100%;height:100%;object-fit:cover;display:block;}
.pfir-badges{position:absolute;top:8px;left:8px;display:flex;gap:5px;}
.pfir-b{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:3px 7px;border-radius:6px;color:#fff;}
.pfir-b.logo{background:#3b82f6;}.pfir-b.ment{background:#a855f7;}
.pfir-type{position:absolute;top:8px;right:8px;font-size:10px;font-weight:700;background:rgba(0,0,0,.6);padding:3px 7px;border-radius:6px;color:#fff;}
.pfir-body{padding:13px;display:flex;flex-direction:column;gap:9px;flex:1;}
.pfir-row1{display:flex;align-items:center;gap:9px;}
.pfir-av{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#222;flex:none;}
.pfir-ath{font-weight:700;font-size:13.5px;line-height:1.1;}
.pfir-bnd{color:var(--volt);font-size:11.5px;}
.pfir-cap{color:var(--t2);font-size:12.5px;line-height:1.45;max-height:74px;overflow:hidden;}
.pfir-ev{font-size:11.5px;line-height:1.4;border-radius:8px;padding:8px 10px;background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.45);}
.pfir-ev-h{font-weight:800;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#f59e0b;display:block;margin-bottom:3px;}
.pfir-ocr{color:var(--t3);margin-top:4px;}
.pfir-met{display:flex;gap:14px;border-top:1px solid var(--line);padding-top:9px;}
.pfir-met div{display:flex;flex-direction:column;}
.pfir-n{font-weight:800;font-size:14px;}
.pfir-l{color:var(--t3);font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;}
.pfir-foot{display:flex;justify-content:space-between;align-items:center;}
.pfir-date{color:var(--t3);font-size:11px;}
.pfir-lk{color:var(--t3);font-size:11px;text-decoration:none;}
.pfir-lk:hover{color:var(--volt);}
.pfir-acts{display:flex;gap:8px;margin-top:auto;}
.pfir-act{flex:1;border:1px solid var(--line);background:transparent;color:var(--t2);border-radius:9px;padding:9px;font-weight:800;font-size:12px;cursor:pointer;font-family:inherit;}
.pfir-act.k.sel{background:var(--keep);color:var(--ink);border-color:var(--keep);}
.pfir-act.c.sel{background:var(--cut);color:#fff;border-color:var(--cut);}
.pfir-empty{padding:60px;text-align:center;color:var(--t3);grid-column:1/-1;}
`;
