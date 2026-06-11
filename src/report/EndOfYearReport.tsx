// End of Year Report - pure presentational component.
//
// Renders a ReportData object as the full single-page "End of the Year Report"
// value piece (hero → year-in-review highlights → top brands → top content →
// footer). It fetches nothing and reads no services: hand it data, it renders.
// To make a new school, generate a new ReportData - this file never changes.
//
// Styling is self-contained, scoped under `.eoy-root`, so the report is portable
// and never collides with app styles. Accent is fixed JABA volt (#E2F500): this
// is a JABA-branded value piece; the school shows up via logo/name/roster, not
// by recoloring.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
// eslint-disable-next-line import/no-unresolved -- repo-root asset, same one the other reports use
const jabaHead = '/jaba-head.png';
import type {
  ApparelPartner,
  Brand,
  ContentPiece,
  Grower,
  Highlight,
  HighlightIcon,
  RunnerUp,
  Platform,
  ReportData,
  YearNumbers,
} from './types';

// ── helpers ──────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** <img> that falls back to a labeled striped placeholder on empty/error. */
function Img({
  src,
  alt,
  className,
  label,
}: {
  src: string;
  alt: string;
  className?: string;
  label: string;
}) {
  const [failed, setFailed] = useState(!src);
  if (failed || !src) {
    return (
      <div className={`eoy-ph ${className ?? ''}`} aria-label={alt}>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/** Fade + rise in on scroll; respects prefers-reduced-motion. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Hidden documents (background tab, headless capture) never fire
    // IntersectionObserver - show immediately rather than render a black page.
    if (reduced || document.hidden || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    // Failsafe: never leave content invisible if the observer misbehaves.
    const t = window.setTimeout(() => setShown(true), 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`eoy-reveal ${shown ? 'eoy-in' : ''} ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── icons (inline, no deps) ──────────────────────────────────────────────

function HighlightGlyph({ icon }: { icon: HighlightIcon }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (icon === 'ribbon') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="6" />
        <path d="M8.5 13 6 22l6-3 6 3-2.5-9" />
      </svg>
    );
  }
  if (icon === 'trend') {
    return (
      <svg {...common}>
        <path d="M3 17 9 11l4 4 8-8" />
        <path d="M16 4h5v5" />
      </svg>
    );
  }
  // eyes
  return (
    <svg {...common}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function PlatformIcon({ platform }: { platform: Platform }) {
  const c = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'currentColor' };
  if (platform === 'TikTok') {
    return (
      <svg {...c}>
        <path d="M16 3c.3 2.3 1.7 3.9 4 4.2v2.7c-1.5.1-2.9-.4-4-1.2v5.8c0 3.6-2.9 5.9-5.9 5.5C7.3 19.6 5.6 17 6 14.2c.3-2.3 2.3-4 4.6-4 .3 0 .6 0 .9.1v2.9c-.3-.1-.6-.2-.9-.2-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V3h3.4Z" />
      </svg>
    );
  }
  if (platform === 'YouTube Shorts') {
    return (
      <svg {...c}>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.7 1.8C5.7 19 12 19 12 19s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" />
      </svg>
    );
  }
  // Instagram (Reels + Post)
  return (
    <svg {...c} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="verified">
      <path
        fill="#E2F500"
        d="m12 1 2.6 1.9 3.2-.3 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.3L12 23l-2.6-1.9-3.2.3-1-3L2.6 14.5l1-3-1-3 2.6-1.9 1-3 3.2.3L12 1Z"
      />
      <path
        fill="#0D0B12"
        d="m10.6 14.6-2.2-2.2-1.3 1.3 3.5 3.5 6-6-1.3-1.3-4.7 4.7Z"
      />
    </svg>
  );
}

function HeadLogo({ size = 34, framed = false }: { size?: number; framed?: boolean }) {
  return (
    <span
      className={`eoy-head ${framed ? 'eoy-head-framed' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img src={jabaHead} alt="JABA" />
    </span>
  );
}

function SocialIcon({ kind }: { kind: 'ig' | 'x' | 'in' | 'yt' }) {
  const c = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' };
  if (kind === 'x')
    return (
      <svg {...c}>
        <path d="M18.2 3h3.3l-7.2 8.2L23 21h-6.6l-5.2-6.8L5.3 21H2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.2 3Zm-1.2 16h1.8L7.1 4.9H5.2L17 19Z" />
      </svg>
    );
  if (kind === 'in')
    return (
      <svg {...c}>
        <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9V9Z" />
      </svg>
    );
  if (kind === 'yt')
    return (
      <svg {...c}>
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.7 1.8C5.7 19 12 19 12 19s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" />
      </svg>
    );
  // instagram
  return (
    <svg {...c} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── sections ─────────────────────────────────────────────────────────────

function Hero({ data }: { data: ReportData }) {
  const { program } = data;
  return (
    <header className="eoy-hero">
      {data.heroImage ? (
        <img className="eoy-hero-img" src={data.heroImage} alt="" />
      ) : (
        <div className="eoy-hero-ph">
          <span>FULL-BLEED STADIUM PHOTO</span>
        </div>
      )}
      <div className="eoy-hero-scrim" />
      <img className="eoy-hero-bear" src={jabaHead} alt="" aria-hidden />
      <div className="eoy-hero-badge">
        <span className="eoy-hero-badge-logo">
          {program.logoSrc ? (
            <img src={program.logoSrc} alt={program.name} />
          ) : (
            <span className="eoy-hero-badge-mono">{program.monogram}</span>
          )}
        </span>
        <span className="eoy-hero-badge-name">{program.fullName ?? program.name}</span>
      </div>
      <div className="eoy-wrap eoy-hero-top">
        <h1 className="eoy-hero-copy">
          <img className="eoy-hero-title" src="/jaba-rewind-text.png" alt="JABA Rewind - 2025-26 School Year" />
        </h1>
      </div>
    </header>
  );
}

/** Editorial section header: numbered kicker + huge italic display title. */
function SecHead({
  index,
  kicker,
  title,
}: {
  index: string;
  kicker: string;
  title: string;
}) {
  return (
    <div className="eoy-sechead">
      <span className="eoy-sec-tag">
        <span>
          {index} <i>/</i> {kicker}
        </span>
      </span>
      <h2 className="eoy-sec-title" data-text={title}>
        <span>{title}</span>
      </h2>
    </div>
  );
}

/** "Tounde Yessoufou" -> "T. Yessoufou" for tight leaderboard rows. */
function shortName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return full;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function CatLabel({ icon, title, sm }: { icon: HighlightIcon; title: string; sm?: boolean }) {
  return (
    <div className={`eoy-cat ${sm ? 'eoy-cat-sm' : ''}`}>
      <span className="eoy-cat-ic">
        <HighlightGlyph icon={icon} />
      </span>
      <span>{title}</span>
    </div>
  );
}

function RankList({ rows }: { rows: RunnerUp[] }) {
  if (!rows.length) return null;
  return (
    <ul className="eoy-ranklist">
      {rows.map((r) => (
        <li key={r.rank} className="eoy-ranklist-row">
          <span className="eoy-ranklist-num">{r.rank}</span>
          <span className="eoy-ranklist-name">{shortName(r.athlete)}</span>
          <span className="eoy-ranklist-dots" aria-hidden />
          <span className="eoy-ranklist-stat">{r.stat}</span>
        </li>
      ))}
    </ul>
  );
}

function FeatureCard({ h }: { h: Highlight }) {
  return (
    <Reveal className="eoy-feat">
      <div className="eoy-feat-photo">
        <Img src={h.photo} alt={h.athlete} className="eoy-feat-img" label={initials(h.athlete)} />
      </div>
      <div className="eoy-feat-body">
        <CatLabel icon={h.icon} title={h.title} />
        <div className="eoy-feat-name">{h.athlete}</div>
        <div className="eoy-feat-sport">{h.sport}</div>
        <p className="eoy-feat-desc">{h.description}</p>
        <div className="eoy-statline">
          {h.subValue && (
            <>
              <span className="eoy-substat">
                <span className="eoy-substat-num">{h.subValue}</span>
                <span className="eoy-substat-lbl">{h.subLabel}</span>
              </span>
              <span className="eoy-statline-arrow" aria-hidden>→</span>
            </>
          )}
          <div className="eoy-plate eoy-plate-xl">
            <span className="eoy-plate-num">{h.statValue}</span>
            <span className="eoy-plate-unit">{h.statLabel}</span>
          </div>
        </div>
        {h.runnersUp && <RankList rows={h.runnersUp} />}
      </div>
    </Reveal>
  );
}

function MiniCard({ h, i }: { h: Highlight; i: number }) {
  return (
    <Reveal delay={120 + i * 90} className="eoy-mini">
      <div className="eoy-mini-photo">
        <Img src={h.photo} alt={h.athlete} className="eoy-mini-img" label={initials(h.athlete)} />
      </div>
      <div className="eoy-mini-body">
        <CatLabel icon={h.icon} title={h.title} sm />
        <div className="eoy-mini-name">{h.athlete}</div>
        <div className="eoy-mini-sport">{h.sport}</div>
        <div className="eoy-plate eoy-plate-sm">
          <span className="eoy-plate-num">{h.statValue}</span>
          <span className="eoy-plate-unit">{h.statLabel}</span>
        </div>
        {h.runnersUp && <RankList rows={h.runnersUp} />}
      </div>
    </Reveal>
  );
}

function YearInReview({ data }: { data: ReportData }) {
  // Overperformer leads as the hero card — it carries the richest story
  // (actual → performs-like) and fills the feature card best.
  const feature = data.highlights.find((h) => h.icon === 'trend') ?? data.highlights[0];
  const rest = data.highlights.filter((h) => h !== feature);
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index="01" kicker={`${data.program.name} athlete highlights`} title="Year in Review" />
        <div className="eoy-podium">
          {feature && <FeatureCard h={feature} />}
          <div className="eoy-podium-side">
            {rest.map((h, i) => (
              <MiniCard key={h.rank} h={h} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** "The Year in Numbers" band: program totals right under the period strip. */
function NumbersBand({ n }: { n: YearNumbers }) {
  const items = [
    { v: n.posts, l: 'Posts tracked', volt: false },
    { v: n.athletes, l: 'Athletes posting', volt: false },
    { v: n.likes, l: 'Total likes', volt: false },
    ...(n.views ? [{ v: n.views, l: 'Video views', volt: false }] : []),
    // the one actionable insight in the row gets the volt pop
    ...(n.bestDay ? [{ v: n.bestDay, l: 'Best day to post', volt: true }] : []),
  ];
  return (
    <div className="eoy-numbers">
      <div className="eoy-wrap eoy-numbers-row">
        <span className="eoy-numbers-kicker">The Year<br />in Numbers</span>
        {items.map((it) => (
          <span key={it.l} className="eoy-numbers-item">
            <span className={`eoy-numbers-val${it.volt ? ' eoy-numbers-val-volt' : ''}`}>{it.v}</span>
            <span className="eoy-numbers-lbl">{it.l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Inline-SVG sparkline (no JS, survives the static email export). */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 220;
  const h = 54;
  const pad = 4;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / span) * (h - pad * 2),
  ]);
  const d = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg className="eoy-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline points={d} fill="none" stroke="#E2F500" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="3.5" fill="#E2F500" />
    </svg>
  );
}

/** "Who Blew Up": ranked follower-growth rows with real before/after curves. */
function GrowerRow({ g, i }: { g: Grower; i: number }) {
  return (
    <Reveal delay={i * 90} className="eoy-grow-row">
      <span className="eoy-grow-rank" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
      <div className="eoy-grow-photo">
        <Img src={g.photo} alt={g.athlete} className="eoy-grow-img" label={initials(g.athlete)} />
      </div>
      <div className="eoy-grow-id">
        <div className="eoy-grow-name">{g.athlete}</div>
        <div className="eoy-grow-sport">{g.sport} · {g.platform}</div>
      </div>
      <div className="eoy-grow-curve"><Sparkline values={g.spark} /></div>
      <div className="eoy-grow-nums">
        <span className="eoy-grow-path">
          {g.start} <span aria-hidden>→</span> {g.end}
        </span>
        <span className="eoy-grow-pct">{g.pct}</span>
      </div>
    </Reveal>
  );
}

function WhoBlewUp({ data, index }: { data: ReportData; index: string }) {
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index={index} kicker="Follower growth" title="Who Blew Up" />
        <div className="eoy-grow">
          {(data.growth as Grower[]).map((g, i) => (
            <GrowerRow key={g.athlete} g={g} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** "Earned Media": big accounts posting ABOUT the school's athletes. */
function EarnedCard({ c, i }: { c: ContentPiece; i: number }) {
  return (
    <Reveal delay={i * 70} className="eoy-poster eoy-poster-earned">
      <Img src={c.thumb} alt={c.title} className="eoy-poster-img" label="THUMBNAIL" />
      <div className="eoy-poster-scrim" />
      <span className="eoy-poster-rank" aria-hidden>{c.rank}</span>
      <span className="eoy-poster-platform" title={c.platform}>
        <PlatformIcon platform={c.platform} />
      </span>
      <div className="eoy-poster-bottom">
        <div className="eoy-poster-title">{c.title}</div>
        <div className="eoy-poster-by">posted by @{c.handle}</div>
        <div className="eoy-poster-metrics">
          <span className="eoy-poster-likes">{c.likes}</span>
          <span className="eoy-poster-likes-lbl">likes</span>
          <span className="eoy-poster-rest">{c.comments} comments</span>
        </div>
      </div>
    </Reveal>
  );
}

function EarnedMedia({ data, index }: { data: ReportData; index: string }) {
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index={index} kicker="The internet noticed" title="Earned Media" />
        <p className="eoy-earned-lede">
          Coverage your athletes did not have to post themselves: major accounts
          putting {data.program.name} names in their feeds.
        </p>
        <div className="eoy-posters eoy-earned">
          {(data.earned as ContentPiece[]).map((c, i) => (
            <EarnedCard key={c.rank} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Apparel Partner Value: receipts the school can hand its gear sponsor.
 *  Poster band, not a stat grid: lede copy + one volt plate + dotted rows,
 *  ghost brand wordmark behind. */
function PartnerValue({ data, index }: { data: ReportData; index: string }) {
  const p = data.partner as ApparelPartner;
  const school = data.program.name;
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index={index} kicker="Apparel partner value" title={`What ${p.brand} Got`} />
        <Reveal>
          <div className="eoy-partner" data-brand={p.brand}>
            <div className="eoy-partner-main">
              <p className="eoy-partner-lede">
                Every time a {school} athlete posts in gear, the brand on the jersey gets
                seen. JABA&apos;s vision AI scanned this year&apos;s posts and counted every
                appearance, numbers to bring to your next {p.brand} conversation.
              </p>
              <div className="eoy-plate eoy-plate-xl">
                <span className="eoy-plate-num">{p.posts}</span>
                <span className="eoy-plate-unit">Posts with {p.brand} on screen</span>
              </div>
              <ul className="eoy-partner-rows">
                <li className="eoy-partner-row">
                  <span className="eoy-partner-row-lbl">Athletes wearing the brand</span>
                  <span className="eoy-ranklist-dots" aria-hidden />
                  <span className="eoy-partner-row-stat">{p.athletes}</span>
                </li>
                <li className="eoy-partner-row">
                  <span className="eoy-partner-row-lbl">Likes on those posts</span>
                  <span className="eoy-ranklist-dots" aria-hidden />
                  <span className="eoy-partner-row-stat">{p.likes}</span>
                </li>
                {p.views && (
                  <li className="eoy-partner-row">
                    <span className="eoy-partner-row-lbl">Video views</span>
                    <span className="eoy-ranklist-dots" aria-hidden />
                    <span className="eoy-partner-row-stat">{p.views}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className="eoy-partner-side">
              <div className="eoy-partner-side-kicker">Top carriers</div>
              <RankList rows={p.topCarriers} />
              <p className="eoy-partner-note">
                Counted on the share of posts already analyzed by vision AI (70%+
                detection confidence), August 2025 - May 2026. Real totals run higher.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BrandLogo({ src, name }: { src?: string; name: string }) {
  const [ok, setOk] = useState(!!src);
  if (!src || !ok) return <span className="eoy-fancard-mono">{initials(name)}</span>;
  return <img className="eoy-fancard-logo" src={src} alt={name} onError={() => setOk(false)} />;
}

/** Fanned hand-of-cards layout. Tone cycles volt -> cream -> dark like a dealt hand.
 *  Rotation/overlap kept shallow: contacts are always visible and there is no hover
 *  in email, so no card may cover another card's text. */
const FAN_TONES = ['volt', 'cream', 'dark', 'cream', 'dark'] as const;
const FAN_ROT = [-6, -2.5, 0, 2.5, 5];
const FAN_LIFT = [22, 6, 0, 6, 18];

/** "https://www.drinkspyre.com" -> "drinkspyre.com" for the visible link. */
function siteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function BrandFanCard({ b, i }: { b: Brand; i: number }) {
  const name = b.name.replace(/\n/g, ' ');
  const tone = FAN_TONES[i % FAN_TONES.length];
  const style = {
    '--rot': `${FAN_ROT[i % FAN_ROT.length]}deg`,
    '--lift': `${FAN_LIFT[i % FAN_LIFT.length]}px`,
    zIndex: i + 1,
  } as React.CSSProperties;
  return (
    <div className={`eoy-fancard eoy-fancard-${tone}`} style={style}>
      <div className="eoy-fancard-img">
        {b.image ? (
          <img className="eoy-fancard-photo" src={b.image} alt={name} loading="lazy" />
        ) : (
          <BrandLogo src={b.logo} name={name} />
        )}
      </div>
      <div className="eoy-fancard-num">{String(i + 1).padStart(2, '0')}.</div>
      <div className="eoy-fancard-name">{name}</div>
      <div className="eoy-fancard-tag">{b.why}</div>
      {(b.contactEmail || b.site) && (
        <div className="eoy-fancard-contact">
          {b.contactTeam && <span className="eoy-fancard-team">{b.contactTeam}</span>}
          {b.contactEmail && (
            <a className="eoy-fancard-email" href={`mailto:${b.contactEmail}`}>
              {b.contactEmail}
            </a>
          )}
          {b.site && (
            <a
              className="eoy-fancard-site"
              href={b.site}
              target="_blank"
              rel="noopener noreferrer"
            >
              {siteLabel(b.site)} <span aria-hidden>↗</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function TopBrands({ data, index }: { data: ReportData; index: string }) {
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index={index} kicker="Summer pitch list" title="Brands to Reach Out To" />
        <Reveal>
          <div className="eoy-fan">
            {data.brands.map((b, i) => (
              <BrandFanCard key={i} b={b} i={i} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PosterCard({ c, i }: { c: ContentPiece; i: number }) {
  return (
    <Reveal delay={i * 70} className="eoy-poster">
      <Img src={c.thumb} alt={c.title} className="eoy-poster-img" label="THUMBNAIL" />
      <div className="eoy-poster-scrim" />
      <span className="eoy-poster-rank" aria-hidden>{c.rank}</span>
      <span className="eoy-poster-platform" title={c.platform}>
        <PlatformIcon platform={c.platform} />
      </span>
      <div className="eoy-poster-bottom">
        <div className="eoy-poster-title">{c.title}</div>
        <div className="eoy-poster-metrics">
          <span className="eoy-poster-likes">{c.likes}</span>
          <span className="eoy-poster-likes-lbl">likes</span>
          <span className="eoy-poster-rest">{c.comments} comments</span>
        </div>
      </div>
    </Reveal>
  );
}

function TopContent({ data, index }: { data: ReportData; index: string }) {
  return (
    <section className="eoy-section">
      <div className="eoy-wrap">
        <SecHead index={index} kicker="Best Posts" title="Top Performing Content" />
        <div className="eoy-posters">
          {data.topContent.map((c, i) => (
            <PosterCard key={c.rank} c={c} i={i} />
          ))}
        </div>
        <div className="eoy-divider">
          {data.program.logoSrc ? (
            <img className="eoy-divider-logo" src={data.program.logoSrc} alt={data.program.name} />
          ) : (
            <span className="eoy-mono-mark eoy-mono-mark-sm">{data.program.monogram}</span>
          )}
        </div>
      </div>
    </section>
  );
}

function FooterBanner() {
  return (
    <footer className="eoy-footer">
      <div className="eoy-wrap eoy-footer-main">
        <div className="eoy-footer-brand">
          <HeadLogo size={56} framed />
          <span className="eoy-footer-wordmark">JABA</span>
        </div>
        <div className="eoy-footer-social">
          <a href="https://www.instagram.com/jaba/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><SocialIcon kind="ig" /></a>
          <a href="https://www.linkedin.com/company/jaba-ai/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><SocialIcon kind="in" /></a>
        </div>
      </div>
      <div className="eoy-wrap eoy-footer-base">
        <span>© 2026 JABA</span>
        <span>2025–26 School Year</span>
      </div>
    </footer>
  );
}

// ── root ─────────────────────────────────────────────────────────────────

export function EndOfYearReport({ data }: { data: ReportData }) {
  // Sections renumber around the optional ones (growth/partner/earned).
  const present = [
    'review',
    data.growth?.length ? 'growth' : '',
    data.partner ? 'partner' : '',
    'brands',
    'content',
    data.earned?.length ? 'earned' : '',
  ].filter(Boolean);
  const idx = (k: string) => String(present.indexOf(k) + 1).padStart(2, '0');
  return (
    <div className="eoy-root">
      {/* dangerouslySetInnerHTML keeps ">" selectors intact under renderToStaticMarkup (email export) */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Hero data={data} />
      <div className="eoy-period">
        <span className="eoy-period-label">Reporting Period</span>
        <span className="eoy-period-sep" />
        <span className="eoy-period-range">August 2025 – May 2026</span>
      </div>
      {data.numbers && <NumbersBand n={data.numbers} />}
      <YearInReview data={data} />
      {data.growth?.length ? <WhoBlewUp data={data} index={idx('growth')} /> : null}
      {data.partner && <PartnerValue data={data} index={idx('partner')} />}
      <TopBrands data={data} index={idx('brands')} />
      <TopContent data={data} index={idx('content')} />
      {data.earned?.length ? <EarnedMedia data={data} index={idx('earned')} /> : null}
      <FooterBanner />
    </div>
  );
}

export default EndOfYearReport;

// ── scoped styles ────────────────────────────────────────────────────────

const CSS = `
.eoy-root{
  --ink:#0D0B12; --card:#13111A; --line:rgba(255,255,255,.08);
  --volt:#E2F500; --pos:#4ADE80; --neg:#EF4444;
  --t1:#fff; --t2:rgba(255,255,255,.62); --t3:rgba(255,255,255,.40);
  --display:'Bebas Neue',Impact,sans-serif; --cond:'Barlow Semi Condensed',sans-serif;
  --body:'Barlow',system-ui,sans-serif;
  background:var(--ink); color:var(--t1); font-family:var(--body);
  line-height:1.55; -webkit-font-smoothing:antialiased; min-height:100vh;
}
.eoy-root *{box-sizing:border-box;}
.eoy-period{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 16px;padding:15px 28px;background:#0f0d15;border-bottom:1px solid var(--line);}
.eoy-period-label{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.24em;font-size:11.5px;color:var(--t3);}
.eoy-period-sep{width:5px;height:5px;border-radius:999px;background:var(--volt);flex:none;}
.eoy-period-range{font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.09em;font-size:14.5px;color:var(--volt);}
.eoy-root ::selection{background:var(--volt);color:var(--ink);}
.eoy-wrap{max-width:1180px;margin:0 auto;padding:0 28px;}

/* program mark */
.eoy-mono-mark{font-family:'Times New Roman',serif;font-weight:700;font-size:24px;letter-spacing:.04em;display:inline-flex;align-items:center;justify-content:center;}
.eoy-mono-mark img{height:34px;width:auto;display:block;}
.eoy-mono-mark-sm{font-size:18px;width:40px;height:40px;border:1px solid var(--line);border-radius:999px;}
.eoy-head{display:inline-flex;align-items:center;justify-content:center;flex:none;}
.eoy-head img{width:100%;height:100%;object-fit:contain;display:block;}
.eoy-head-framed{background:var(--volt);border-radius:999px;padding:5px;}

/* hero */
.eoy-hero{position:relative;min-height:clamp(340px,46vw,520px);display:flex;align-items:flex-start;overflow:hidden;border-bottom:1px solid var(--line);
  background:linear-gradient(135deg,#1a1726 0%,#0D0B12 55%,#15121d 100%);}
.eoy-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.eoy-hero-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.045) 0 1px,transparent 1px 26px);}
.eoy-hero-ph span{font-family:var(--cond);letter-spacing:.3em;text-transform:uppercase;font-size:12px;color:var(--t3);}
.eoy-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,11,18,.55) 0%,transparent 38%,rgba(13,11,18,.55) 100%),linear-gradient(90deg,rgba(13,11,18,.55) 0%,transparent 60%);}
.eoy-hero-bear{position:absolute;bottom:-8%;right:clamp(16px,12vw,180px);width:clamp(120px,20vw,230px);transform:rotate(-3deg);filter:drop-shadow(0 6px 24px rgba(0,0,0,.5));}
.eoy-hero-top{position:relative;width:100%;display:flex;justify-content:center;align-items:flex-start;padding-top:clamp(18px,3vw,34px);}
.eoy-hero-copy{position:relative;}
.eoy-hero-badge{position:absolute;top:clamp(16px,2.6vw,28px);left:clamp(18px,3vw,40px);display:inline-flex;align-items:center;gap:12px;max-width:min(46vw,300px);
  background:rgba(13,11,18,.42);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.16);border-radius:999px;padding:7px 22px 7px 7px;box-shadow:0 10px 30px rgba(0,0,0,.4);}
.eoy-hero-badge-logo{width:clamp(40px,5vw,50px);height:clamp(40px,5vw,50px);border-radius:999px;background:#fff;
  display:flex;align-items:center;justify-content:center;padding:7px;flex:none;}
.eoy-hero-badge-logo img{max-width:100%;max-height:100%;object-fit:contain;display:block;}
.eoy-hero-badge-mono{font-family:var(--display);font-size:1.3rem;color:#0D0B12;line-height:1;}
.eoy-hero-badge-name{font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.04em;
  font-size:clamp(15px,1.8vw,18px);color:#fff;line-height:1.05;}
.eoy-hero-copy{margin:0;}
.eoy-hero-title{display:block;width:clamp(340px,58vw,820px);height:auto;margin:0 auto;
  filter:drop-shadow(0 0 16px rgba(226,245,0,.55)) drop-shadow(0 0 44px rgba(226,245,0,.35))
         drop-shadow(0 18px 30px rgba(0,0,0,.6)) drop-shadow(0 5px 12px rgba(0,0,0,.45));}

/* sections */
.eoy-section{padding:74px 0 60px;position:relative;}
.eoy-section+.eoy-section{padding-top:30px;}

/* editorial section header — screen-printed, extruded */
.eoy-sechead{margin-bottom:40px;}
.eoy-sec-tag{display:inline-block;background:var(--volt);color:#16140f;font-family:var(--cond);font-weight:800;
  text-transform:uppercase;letter-spacing:.1em;font-size:13px;line-height:1;padding:6px 14px 7px;transform:skewX(-10deg);
  box-shadow:0 7px 20px rgba(226,245,0,.22);}
.eoy-sec-tag>span{display:inline-block;transform:skewX(10deg);}
.eoy-sec-tag i{font-style:normal;opacity:.5;margin:0 2px;}
.eoy-sec-title{margin:18px 0 0;line-height:.86;}
.eoy-sec-title>span{font-family:var(--display);text-transform:uppercase;
  font-size:clamp(2.5rem,6vw,4.4rem);letter-spacing:.03em;color:#fff;display:inline-block;
  text-shadow:0 10px 24px rgba(0,0,0,.55);}

/* reveal */
.eoy-reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease;}
.eoy-reveal.eoy-in{opacity:1;transform:none;}

/* placeholders */
.eoy-ph{display:flex;align-items:center;justify-content:center;
  background:repeating-linear-gradient(135deg,rgba(255,255,255,.05) 0 1px,rgba(255,255,255,.02) 1px 12px);}
.eoy-ph span{font-family:var(--cond);letter-spacing:.18em;text-transform:uppercase;font-size:11px;color:var(--t3);font-weight:700;}

/* year in review — podium */
.eoy-podium{display:grid;grid-template-columns:7fr 5fr;gap:18px;align-items:stretch;}
.eoy-podium-side{display:flex;flex-direction:column;justify-content:space-between;gap:18px;}

/* category kicker — magazine label, no chrome */
.eoy-cat{display:flex;align-items:center;gap:9px;color:var(--volt);font-family:var(--cond);font-weight:800;
  text-transform:uppercase;letter-spacing:.13em;font-size:14px;line-height:1;margin-bottom:14px;}
.eoy-cat-ic{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;
  background:rgba(226,245,0,.12);color:var(--volt);flex:none;}
.eoy-cat-ic svg{width:15px;height:15px;}
.eoy-cat-sm{font-size:12px;letter-spacing:.1em;margin-bottom:11px;gap:7px;}
.eoy-cat-sm .eoy-cat-ic{width:22px;height:22px;}
.eoy-cat-sm .eoy-cat-ic svg{width:13px;height:13px;}

.eoy-feat{position:relative;display:grid;grid-template-columns:42% 1fr;
  background:linear-gradient(160deg,#181522 0%,#13111A 62%);border:1px solid var(--line);border-radius:18px;overflow:hidden;}
.eoy-feat-photo{position:relative;clip-path:polygon(0 0,100% 0,calc(100% - 34px) 100%,0 100%);min-height:300px;}
.eoy-feat-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block;}
.eoy-feat-body{min-width:0;padding:26px 30px 28px;display:flex;flex-direction:column;align-items:flex-start;position:relative;z-index:1;}
.eoy-feat-name{font-family:var(--display);font-style:italic;text-transform:uppercase;font-size:clamp(1.9rem,3.6vw,3rem);line-height:.95;}
.eoy-feat-sport{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.18em;font-size:13px;color:var(--volt);margin-top:8px;}
.eoy-feat-desc{color:var(--t2);font-size:14px;line-height:1.6;margin:14px 0 18px;max-width:36ch;}

.eoy-mini{position:relative;display:grid;grid-template-columns:clamp(150px,30%,210px) 1fr;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;}
.eoy-mini-photo{position:relative;clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%);min-height:150px;}
.eoy-mini-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 16%;display:block;}
.eoy-mini-body{padding:16px 18px 20px;display:flex;flex-direction:column;align-items:flex-start;}
.eoy-mini-name{font-family:var(--display);font-style:italic;text-transform:uppercase;font-size:1.35rem;line-height:1;margin-top:10px;}
.eoy-mini-sport{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.14em;font-size:11.5px;color:var(--volt);margin-top:4px;}

/* mini-leaderboard (#2-5 under each category leader) */
.eoy-ranklist{list-style:none;margin:18px 0 0;padding:14px 0 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:9px;width:100%;}
.eoy-ranklist-row{display:flex;align-items:baseline;gap:10px;}
.eoy-ranklist-num{font-family:var(--display);font-style:italic;font-size:.95rem;line-height:1;color:rgba(255,255,255,.55);flex:none;min-width:22px;}
.eoy-ranklist-name{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.02em;font-size:1rem;line-height:1;white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis;}
.eoy-ranklist-dots{flex:1;border-bottom:1px dotted rgba(255,255,255,.2);transform:translateY(-3px);min-width:14px;}
.eoy-ranklist-stat{font-family:var(--display);font-size:1rem;line-height:1;color:var(--volt);flex:none;}
.eoy-mini .eoy-ranklist{margin-top:14px;padding-top:11px;gap:7px;}
.eoy-mini .eoy-ranklist-name{font-size:.9rem;}
.eoy-mini .eoy-ranklist-num,.eoy-mini .eoy-ranklist-stat{font-size:.85rem;}

/* volt stat plates */
.eoy-statline{display:flex;align-items:center;flex-wrap:wrap;gap:12px 14px;margin-top:20px;max-width:100%;}
.eoy-substat{display:flex;flex-direction:column;gap:3px;}
.eoy-substat-num{font-family:var(--display);font-size:2rem;line-height:.85;color:var(--t1);}
.eoy-substat-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:12px;color:var(--t2);}
.eoy-statline-arrow{font-family:var(--display);font-size:1.7rem;color:var(--volt);line-height:1;}
.eoy-statline .eoy-plate{margin-top:0;}
.eoy-plate{align-self:flex-start;margin-top:14px;background:var(--volt);color:var(--ink);transform:skewX(-11deg);padding:9px 20px;display:inline-flex;align-items:baseline;gap:9px;border-radius:3px;box-shadow:0 8px 26px rgba(226,245,0,.16);}
.eoy-plate>*{transform:skewX(11deg);}
.eoy-plate-num{font-family:var(--display);font-size:2.5rem;line-height:.85;}
.eoy-plate-unit{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px;}
.eoy-plate-xl .eoy-plate-num{font-size:2.7rem;}
.eoy-plate-sm{padding:6px 14px;margin-top:12px;}
.eoy-plate-sm .eoy-plate-num{font-size:1.7rem;}
.eoy-plate-sm .eoy-plate-unit{font-size:11px;}

/* brands — fanned card hand */
.eoy-fan{display:flex;justify-content:center;align-items:flex-start;padding:34px 0 26px;}
.eoy-fancard{width:222px;flex:none;border-radius:20px;padding:13px 17px 18px;margin-left:-10px;text-decoration:none;display:block;
  transform:rotate(var(--rot)) translateY(var(--lift));transform-origin:50% 90%;position:relative;
  box-shadow:0 18px 44px rgba(0,0,0,.5);transition:transform .28s cubic-bezier(.2,.8,.25,1),box-shadow .28s;
  font-family:Georgia,'Times New Roman',serif;}
.eoy-fancard:first-child{margin-left:0;}
.eoy-fancard:hover{transform:rotate(0deg) translateY(calc(var(--lift) - 22px)) scale(1.05);z-index:30!important;box-shadow:0 30px 70px rgba(0,0,0,.6);}
.eoy-fancard-volt{background:var(--volt);color:#16140f;}
.eoy-fancard-cream{background:#F4F2EB;color:#16131c;}
.eoy-fancard-dark{background:#191621;color:#fff;border:1px solid rgba(255,255,255,.1);}
.eoy-fancard-img{height:148px;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(0,0,0,.07);}
.eoy-fancard-dark .eoy-fancard-img{background:#fff;}
.eoy-fancard-logo{width:64px;height:64px;object-fit:contain;}
.eoy-fancard-photo{width:100%;height:100%;object-fit:cover;display:block;}
.eoy-fancard-mono{font-family:var(--cond);font-weight:800;font-size:30px;color:#16140f;}
.eoy-fancard-num{font-size:1.05rem;margin-top:16px;opacity:.85;}
.eoy-fancard-name{font-size:1.62rem;line-height:1.04;margin-top:2px;letter-spacing:-.01em;}
.eoy-fancard-tag{font-size:12.5px;line-height:1.45;margin-top:8px;opacity:.72;font-family:var(--body);}
/* contact block — always visible (reports ship as static HTML in email, no hover) */
.eoy-fancard-contact{display:flex;flex-direction:column;gap:2px;margin-top:13px;padding-top:11px;border-top:1px solid rgba(128,128,128,.28);
  font-family:var(--body);}
.eoy-fancard-team{font-size:10.5px;font-weight:600;opacity:.6;text-transform:uppercase;letter-spacing:.04em;}
.eoy-fancard-email{font-size:12.5px;font-weight:700;word-break:break-word;color:inherit;text-decoration:none;}
.eoy-fancard-email:hover{text-decoration:underline;}
.eoy-fancard-site{font-size:11.5px;font-weight:600;margin-top:4px;color:inherit;text-decoration:none;opacity:.72;}
.eoy-fancard-site:hover{text-decoration:underline;opacity:1;}

/* top content — poster cards */
.eoy-posters{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
.eoy-poster{position:relative;aspect-ratio:3/4.3;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:var(--card);}
.eoy-poster-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s ease;}
.eoy-poster:hover .eoy-poster-img{transform:scale(1.045);}
.eoy-poster-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(13,11,18,.22) 0%,transparent 32%,rgba(13,11,18,.94) 80%);}
.eoy-poster-rank{position:absolute;top:6px;left:12px;font-family:var(--display);font-style:italic;font-size:2.5rem;line-height:1;color:var(--volt);text-shadow:0 2px 16px rgba(0,0,0,.7);}
.eoy-poster-platform{position:absolute;top:12px;right:12px;width:30px;height:30px;border-radius:9px;background:rgba(13,11,18,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;color:#fff;border:1px solid rgba(255,255,255,.14);}
.eoy-poster-bottom{position:absolute;left:0;right:0;bottom:0;padding:14px;}
.eoy-poster-title{font-family:var(--cond);font-weight:800;text-transform:uppercase;font-size:1.05rem;line-height:1.05;}
.eoy-poster-metrics{display:flex;align-items:baseline;gap:6px;margin-top:9px;flex-wrap:wrap;}
.eoy-poster-likes{font-family:var(--display);font-style:italic;color:var(--volt);font-size:1.5rem;line-height:1;}
.eoy-poster-likes-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.1em;font-size:10.5px;color:var(--volt);}
.eoy-poster-rest{color:var(--t3);font-size:11px;width:100%;}
.eoy-poster-handle{display:flex;align-items:center;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.14);font-weight:600;font-size:12px;color:var(--t2);}

/* divider */
.eoy-divider{display:flex;align-items:center;justify-content:center;margin-top:40px;}
.eoy-divider:before,.eoy-divider:after{content:"";height:1px;flex:1;background:var(--line);}
.eoy-divider .eoy-mono-mark{margin:0 18px;}
.eoy-divider-logo{height:40px;width:auto;margin:0 18px;display:block;}

/* footer */
.eoy-footer{background:radial-gradient(120% 140% at 0% 0%,#16131d 0%,#0b0910 60%);border-top:1px solid var(--line);}
.eoy-footer-main{display:flex;align-items:center;justify-content:space-between;gap:32px;padding:48px 28px 36px;flex-wrap:wrap;}
.eoy-footer-brand{display:flex;align-items:center;gap:20px;min-width:0;}
.eoy-footer-wordmark{font-family:var(--display);text-transform:uppercase;letter-spacing:.05em;line-height:1;font-size:clamp(1.9rem,3.6vw,2.6rem);}
.eoy-footer-sub{color:var(--t2);font-size:13.5px;line-height:1.55;margin:11px 0 0;max-width:44ch;}
.eoy-footer-actions{display:flex;flex-direction:column;align-items:flex-end;gap:16px;}
.eoy-footer-cta{display:inline-flex;align-items:center;gap:9px;background:var(--volt);color:#16140f;font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.06em;font-size:15px;padding:13px 24px;border-radius:11px;text-decoration:none;box-shadow:0 12px 34px rgba(226,245,0,.2);transition:transform .15s ease,box-shadow .15s ease;white-space:nowrap;}
.eoy-footer-cta:hover{transform:translateY(-2px);box-shadow:0 16px 44px rgba(226,245,0,.3);}
.eoy-footer-social{display:flex;gap:10px;}
.eoy-footer-social a{width:38px;height:38px;border-radius:999px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--t2);transition:color .15s,background .15s,border-color .15s;}
.eoy-footer-social a:hover{color:var(--ink);background:var(--volt);border-color:var(--volt);}
.eoy-footer-base{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 28px;border-top:1px solid var(--line);font-family:var(--cond);font-weight:600;text-transform:uppercase;letter-spacing:.13em;font-size:11.5px;color:var(--t3);}
.eoy-footer-base-mid{color:var(--volt);}

/* the year in numbers — scoreboard band: volt tag, big numerals, dividers */
.eoy-numbers{background:#0f0d15;border-bottom:1px solid var(--line);}
.eoy-numbers-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px 28px;padding-top:22px;padding-bottom:22px;}
.eoy-numbers-kicker{font-family:var(--display);text-transform:uppercase;font-size:1.5rem;line-height:.92;letter-spacing:.04em;color:var(--ink);background:var(--volt);transform:skewX(-11deg);padding:8px 16px;border-radius:3px;}
.eoy-numbers-item{display:flex;flex-direction:column;gap:4px;}
.eoy-numbers-item+.eoy-numbers-item{border-left:1px solid rgba(255,255,255,.08);padding-left:30px;}
.eoy-numbers-val{font-family:var(--display);font-size:2.6rem;line-height:1;color:#fff;}
.eoy-numbers-val-volt{color:var(--volt);}
.eoy-numbers-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.09em;font-size:11.5px;color:var(--t3);}

/* who blew up — ranked growth rows with sparklines */
.eoy-grow{display:flex;flex-direction:column;}
.eoy-grow-row{display:grid;grid-template-columns:54px 72px minmax(150px,1.1fr) minmax(170px,1.5fr) auto;align-items:center;gap:22px;padding:20px 4px;border-top:1px solid var(--line);}
.eoy-grow-row:last-child{border-bottom:1px solid var(--line);}
.eoy-grow-rank{font-family:var(--display);font-style:italic;font-size:2.4rem;line-height:1;color:rgba(255,255,255,.16);}
.eoy-grow-photo{width:72px;height:72px;border-radius:14px;overflow:hidden;background:#1a1822;}
.eoy-grow-img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block;}
.eoy-grow-name{font-family:var(--display);font-style:italic;font-size:1.45rem;line-height:1.05;letter-spacing:.01em;}
.eoy-grow-sport{margin-top:5px;font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.09em;font-size:12px;color:var(--volt);}
.eoy-grow-curve{min-width:0;}
.eoy-spark{display:block;width:100%;height:54px;filter:drop-shadow(0 0 6px rgba(226,245,0,.35));}
.eoy-grow-nums{display:flex;flex-direction:column;align-items:flex-end;gap:7px;}
.eoy-grow-path{font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.05em;font-size:1.05rem;color:var(--t2);white-space:nowrap;}
.eoy-grow-pct{font-family:var(--display);font-size:1.5rem;line-height:1;background:var(--volt);color:var(--ink);transform:skewX(-11deg);padding:5px 12px;border-radius:3px;}

/* earned media — poster trio with author line */
.eoy-earned{grid-template-columns:repeat(3,1fr);}
.eoy-earned-lede{margin:-14px 0 26px;font-size:1rem;line-height:1.6;color:var(--t2);max-width:60ch;}
.eoy-poster-by{margin-top:2px;font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:var(--volt);}

/* apparel partner value — poster band with ghost wordmark */
.eoy-partner{position:relative;display:grid;grid-template-columns:1.5fr 1fr;gap:44px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:40px 44px 44px;overflow:hidden;}
.eoy-partner::after{content:attr(data-brand);position:absolute;right:-10px;bottom:-36px;font-family:var(--display);font-size:11rem;line-height:1;text-transform:uppercase;letter-spacing:.01em;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.055);pointer-events:none;white-space:nowrap;}
.eoy-partner-main,.eoy-partner-side{min-width:0;}
.eoy-partner-main{position:relative;z-index:1;display:flex;flex-direction:column;}
.eoy-partner-lede{margin:0 0 22px;font-size:1.02rem;line-height:1.65;color:var(--t2);max-width:52ch;}
.eoy-partner-main .eoy-plate-unit{display:inline-block;max-width:200px;line-height:1.15;}
.eoy-partner-rows{list-style:none;margin:26px 0 0;padding:16px 0 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:11px;max-width:430px;}
.eoy-partner-row{display:flex;align-items:baseline;gap:10px;}
.eoy-partner-row-lbl{font-family:var(--cond);font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:1.02rem;line-height:1;white-space:nowrap;min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--t2);}
.eoy-partner-row-stat{font-family:var(--display);font-size:1.35rem;line-height:1;color:var(--volt);flex:none;}
.eoy-partner-side{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:flex-end;}
.eoy-partner-side-kicker{font-family:var(--cond);font-weight:800;text-transform:uppercase;letter-spacing:.14em;font-size:12.5px;color:var(--volt);}
.eoy-partner-side .eoy-ranklist{margin-top:12px;}
.eoy-partner-note{margin:22px 0 0;font-size:.8rem;line-height:1.55;color:var(--t3);}

/* responsive */
@media(max-width:1000px){
  .eoy-podium{grid-template-columns:1fr;}
  .eoy-feat{grid-template-columns:1fr;}
  /* wide banner + square headshots with faces center-frame: a short banner at
     18% shows only hair. Taller banner, lower focal point. */
  .eoy-feat-photo{clip-path:none;min-height:380px;}
  .eoy-feat-img{object-position:50% 32%;}
  .eoy-posters{grid-template-columns:repeat(2,1fr);}
  .eoy-partner{grid-template-columns:1fr;gap:26px;padding:30px 26px 34px;}
  .eoy-partner::after{font-size:7rem;bottom:-24px;}
  .eoy-grow-row{grid-template-columns:54px 72px 1fr;grid-template-areas:"rank photo id" "curve curve curve" "nums nums nums";gap:14px 18px;}
  .eoy-grow-rank{grid-area:rank;}
  .eoy-grow-photo{grid-area:photo;}
  .eoy-grow-id{grid-area:id;}
  .eoy-grow-curve{grid-area:curve;}
  .eoy-grow-nums{grid-area:nums;flex-direction:row;align-items:center;justify-content:space-between;}
  .eoy-earned{grid-template-columns:1fr;}
  .eoy-fan{flex-wrap:wrap;gap:18px;}
  .eoy-fancard{margin-left:0;transform:none;}
  .eoy-fancard:hover{transform:translateY(-8px) scale(1.03);}
}
@media(max-width:620px){
  .eoy-hero{flex-direction:column;}
  .eoy-hero-badge{position:relative;top:auto;left:auto;align-self:flex-start;margin:16px 0 4px 16px;max-width:calc(100vw - 32px);}
  .eoy-posters{grid-template-columns:1fr;}
  /* stack the mini cards: a 96px side sliver crops faces out of the headshots */
  .eoy-mini{grid-template-columns:1fr;}
  .eoy-mini-photo{clip-path:none;min-height:0;height:280px;}
  .eoy-mini-img{object-position:50% 10%;}
  /* numbers band: items wrap on phones, so dividers turn into stray edges */
  .eoy-numbers-item+.eoy-numbers-item{border-left:none;padding-left:0;}
  .eoy-numbers-val{font-size:2.2rem;}
  /* keep the partner plate and stat rows inside a narrow card */
  .eoy-partner-main .eoy-plate-num{font-size:2rem;}
  .eoy-partner-main .eoy-plate-unit{max-width:150px;font-size:12px;}
  .eoy-partner-row-lbl{font-size:.88rem;}
  .eoy-partner-row-stat{font-size:1.15rem;}
  .eoy-footer-main{flex-direction:column;align-items:flex-start;gap:24px;}
  .eoy-footer-actions{align-items:flex-start;width:100%;}
  .eoy-footer-base{flex-direction:column;align-items:flex-start;gap:6px;}
}
`;
