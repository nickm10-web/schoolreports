// End of Year Report - data contract.
//
// One typed object drives the whole page. The <EndOfYearReport/> component is
// purely presentational: it renders whatever ReportData it is handed and reads
// no services and fetches nothing. To produce a new school, generate a new
// ReportData (see build/buildSchoolReport.ts) - the component never changes.

export type HighlightIcon = 'ribbon' | 'trend' | 'eyes';

/** A #2-5 entry in a category's mini-leaderboard. */
export interface RunnerUp {
  /** "02".."05" */
  rank: string;
  athlete: string;
  /** Same unit as the category leader, e.g. "11" · "+2.4X" · "310K". */
  stat: string;
}

export type Platform =
  | 'Instagram Reels'
  | 'Instagram Post'
  | 'TikTok'
  | 'YouTube Shorts';

/** One of the three "Year in Review" highlight cards. */
export interface Highlight {
  /** "01" | "02" | "03" - display rank chip. */
  rank: string;
  /** ribbon = Most Sponsored, trend = Overperformer, eyes = Largest Following. */
  icon: HighlightIcon;
  title: string;
  description: string;
  athlete: string;
  sport: string;
  /** Headshot URL. "" → renders the athlete's initials in a placeholder. */
  photo: string;
  /** The big number on the skewed plate, e.g. "14" · "+2.8X" · "182K". */
  statValue: string;
  /** Unit under the number, e.g. "POSTS" · "LIKE SCORE" · "FOLLOWERS". */
  statLabel: string;
  /** Optional #2-5 in this category, shown as a mini-leaderboard under the leader. */
  runnersUp?: RunnerUp[];
  /** Optional context stat shown before the main plate, e.g. actual followers
   *  for the overperformer ("25.6K followers → performs like 241.6K"). */
  subValue?: string;
  subLabel?: string;
}

/** One "Top Brand to Reach Out To" card. */
export interface Brand {
  /** Use "\n" to force a line break in the display name. */
  name: string;
  /** Optional brand logo URL. Shown on a white chip; falls back to the name. */
  logo?: string;
  /** Optional lifestyle/product photo for the card image panel (preferred over logo). */
  image?: string;
  /** Optional brand website. When set, clicking the card opens it in a new tab. */
  site?: string;
  /** One-line reason this brand fits the program's athletes. */
  why: string;
  /** Contact team label. "" → contact block hidden (flag for human fill). */
  contactTeam: string;
  /** Contact email. "" → hidden. */
  contactEmail: string;
}

/** One "Top Content That Blew Up" card. */
export interface ContentPiece {
  rank: string;
  title: string;
  /** Thumbnail URL. "" → striped placeholder. */
  thumb: string;
  platform: Platform;
  likes: string;
  comments: string;
  /** Third metric value — "Views" for reels/videos, "Shares" for photos. "N/A" when unavailable. */
  third: string;
  /** Label for the third metric: "Views" or "Shares". */
  thirdLabel: string;
  /** Athlete/account handle, without the leading @. */
  handle: string;
  verified: boolean;
}

export interface Program {
  /** Short name used in body copy, e.g. "Baylor". */
  name: string;
  /** Full institutional name shown in the hero badge, e.g. "Baylor University". */
  fullName?: string;
  /** Monogram fallback shown when no logo image is supplied, e.g. "BU". */
  monogram: string;
  /** Program mark URL. "" → renders the monogram. */
  logoSrc: string;
}

export interface ReportData {
  program: Program;
  /** Full-bleed hero photo URL. "" → patterned gradient fallback. */
  heroImage: string;
  /** Dark headline words, e.g. "THE YEAR". */
  heroLineA: string;
  /** Volt headline words, e.g. "IN NIL". */
  heroLineB: string;
  /** Exactly 3 highlight cards. */
  highlights: Highlight[];
  /** Exactly 5 brand cards. */
  brands: Brand[];
  /** Exactly 5 top-content cards. */
  topContent: ContentPiece[];
}
