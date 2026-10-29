import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import {
  Trophy,
  CheckCircle2,
  Flame,
  Calendar,
  Dumbbell,
  TrendingUp,
  BarChart3,
  Clock,
  AlertCircle,
  History,
  ShieldAlert,
  Crown,
  Medal,
  Award,
  Gem,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Emblem = 'bolt' | 'star' | 'shield' | 'flame' | 'ring' | 'heart';

interface Hero {
  gender: 'f' | 'm';
  bg: string;
  suit: string;
  cape: string;
  mask: string;
  hair: string;
  skin: string;
  emblem: Emblem;
}

// Eigene, originale Heldenfiguren (keine geschützten Charaktere)
const HEROES: Record<string, Hero> = {
  Ricki: { gender: 'f', bg: '#3b0d0d', suit: '#dc2626', cape: '#fbbf24', mask: '#7f1d1d', hair: '#1c1917', skin: '#f5c9a6', emblem: 'bolt' },
  Clara: { gender: 'f', bg: '#2e1065', suit: '#7c3aed', cape: '#e879f9', mask: '#4c1d95', hair: '#b45309', skin: '#f8d5b8', emblem: 'star' },
  Emma: { gender: 'f', bg: '#042f2e', suit: '#0d9488', cape: '#5eead4', mask: '#134e4a', hair: '#facc15', skin: '#fde0c8', emblem: 'shield' },
  Louisa: { gender: 'f', bg: '#500724', suit: '#db2777', cape: '#fb7185', mask: '#831843', hair: '#7c2d12', skin: '#e8b48f', emblem: 'heart' },
  Daniel: { gender: 'm', bg: '#172554', suit: '#2563eb', cape: '#ef4444', mask: '#1e3a8a', hair: '#292524', skin: '#f1c3a0', emblem: 'bolt' },
  Arvin: { gender: 'm', bg: '#052e16', suit: '#16a34a', cape: '#a3e635', mask: '#14532d', hair: '#0c0a09', skin: '#c68a62', emblem: 'shield' },
  Aye: { gender: 'm', bg: '#431407', suit: '#ea580c', cape: '#fde047', mask: '#7c2d12', hair: '#57534e', skin: '#f3cfb0', emblem: 'flame' },
};

const FALLBACK: Hero = HEROES.Daniel;

function EmblemShape({ type }: { type: Emblem }) {
  const fill = '#fde047';
  switch (type) {
    case 'bolt':
      return <polygon points="34,49 28,56 32,56 30,63 37,54 33,54" fill={fill} />;
    case 'star':
      return (
        <polygon
          points="32,49 33.8,53.2 38.3,53.5 34.8,56.4 36,60.8 32,58.4 28,60.8 29.2,56.4 25.7,53.5 30.2,53.2"
          fill={fill}
        />
      );
    case 'shield':
      return <path d="M26 50 H38 V56 Q38 61 32 63 Q26 61 26 56 Z" fill={fill} />;
    case 'flame':
      return <path d="M32 49 Q38 55 36 60 Q34 64 32 64 Q28 63 28 59 Q28 56 31 54 Q31 52 32 49 Z" fill={fill} />;
    case 'ring':
      return <circle cx="32" cy="56" r="5" fill="none" stroke={fill} strokeWidth="2.5" />;
    case 'heart':
      return <path d="M32 62 L26 56 Q24 52 28 51 Q31 51 32 54 Q33 51 36 51 Q40 52 38 56 Z" fill={fill} />;
  }
}

function HeroAvatar({ name, className = 'w-10 h-10' }: { name: string; className?: string }) {
  const h = HEROES[name] ?? FALLBACK;
  const clipId = `hero-clip-${name}`;
  const female = h.gender === 'f';

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`Superheld ${name}`}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="32" cy="32" r="32" fill={h.bg} />
        {/* Cape */}
        <path d="M10 64 Q2 44 18 36 L46 36 Q62 44 54 64 Z" fill={h.cape} />
        {/* Lange Haare hinten (weiblich) */}
        {female && <ellipse cx="32" cy="33" rx="15" ry="17" fill={h.hair} />}
        {/* Hals */}
        <rect x="28" y="38" width="8" height="8" fill={h.skin} />
        {/* Anzug */}
        <path d="M8 64 Q10 46 32 44 Q54 46 56 64 Z" fill={h.suit} />
        <EmblemShape type={h.emblem} />
        {/* Kopf */}
        <circle cx="32" cy="29" r="12" fill={h.skin} />
        {/* Pony / Kurzhaar */}
        {female ? (
          <path d="M19 29 Q20 13 32 13 Q44 13 45 29 Q37 21 19 29 Z" fill={h.hair} />
        ) : (
          <path d="M20 27 Q20 14 32 14 Q44 14 44 27 Q38 21 32 22 Q26 21 20 27 Z" fill={h.hair} />
        )}
        {/* Maske */}
        <rect x="19" y="27" width="26" height="8" rx="3.5" fill={h.mask} />
        <ellipse cx="26.5" cy="31" rx="3.2" ry="1.9" fill="#ffffff" />
        <ellipse cx="37.5" cy="31" rx="3.2" ry="1.9" fill="#ffffff" />
        {/* Lächeln */}
        <path d="M27 38 Q32 42 37 38" fill="none" stroke="#7c2d12" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}


const MEMBERS = ['Daniel', 'Ricki', 'Emma', 'Louisa', 'Clara', 'Aye', 'Arvin'];

type ExerciseType = 'plank' | 'squat' | 'pushup';

const DAILY_CHALLENGE: { label: string; sub: string; type: ExerciseType }[] = [
  { label: '3x 1 Min. Plank', sub: 'Körperspannung halten', type: 'plank' },
  { label: '20 Kniebeugen', sub: 'Tief runter, Rücken gerade', type: 'squat' },
  { label: '10 Liegestütze', sub: 'Brust zum Boden', type: 'pushup' },
];

const MILESTONES = [
  { days: 7, label: '7 Tage', Icon: Medal, color: 'text-amber-600' },
  { days: 14, label: '14 Tage', Icon: Medal, color: 'text-slate-300' },
  { days: 30, label: '30 Tage', Icon: Award, color: 'text-amber-400' },
  { days: 50, label: '50 Tage', Icon: Gem, color: 'text-cyan-300' },
];

const BANNER_BUBBLES: Record<string, string> = {
  Ricki: '10 Liegestütze? Aufwärmen.',
  Emma: 'Fliegen ist leichter als Kniebeugen.',
  Arvin: 'Plank hält, Cape flattert.',
};

interface Entry {
  id?: string;
  member_name: string;
  exercise: string;
  amount: number;
  created_at?: string;
  challenge_date?: string;
  is_retroactive?: boolean;
}

/* ---------- Kleine Bausteine ---------- */

function ExerciseIcon({ type }: { type: ExerciseType }) {
  return (
    <svg
      viewBox="0 0 80 48"
      className="w-full h-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="45" x2="76" y2="45" strokeWidth="2" opacity="0.4" />
      {type === 'plank' && (
        <>
          <circle cx="66" cy="22" r="5" />
          <line x1="60" y1="28" x2="14" y2="38" />
          <line x1="58" y1="29" x2="58" y2="44" />
          <line x1="14" y1="38" x2="12" y2="44" />
        </>
      )}
      {type === 'squat' && (
        <>
          <circle cx="38" cy="8" r="5" />
          <line x1="38" y1="13" x2="32" y2="28" />
          <line x1="32" y1="28" x2="48" y2="33" />
          <line x1="48" y1="33" x2="44" y2="44" />
          <line x1="36" y1="17" x2="54" y2="19" />
        </>
      )}
      {type === 'pushup' && (
        <>
          <circle cx="68" cy="14" r="5" />
          <line x1="62" y1="19" x2="12" y2="36" />
          <line x1="58" y1="21" x2="56" y2="44" />
          <line x1="12" y1="36" x2="10" y2="44" />
        </>
      )}
    </svg>
  );
}

function MilestoneBadges({ count }: { count: number }) {
  const earned = MILESTONES.filter((m) => count >= m.days);
  if (earned.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5">
      {earned.map(({ days, label, Icon, color }) => (
        <span key={days} title={`${label} geschafft`} aria-label={`${label} geschafft`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </span>
      ))}
    </span>
  );
}

function DoneBadge({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">
      <CheckCircle2 className="w-3 h-3" /> Heute erledigt
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
      <Clock className="w-3 h-3 text-amber-500" /> Heute noch offen
    </span>
  );
}

function RetroBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
      <History className="w-3 h-3" /> {count}x nachgereicht
    </span>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.2,
        size: 6 + Math.random() * 6,
        color: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171'][i % 6],
        rotate: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

const SKYLINE: [number, number, number][] = [
  [0, 70, 90], [70, 50, 130], [120, 80, 100], [200, 60, 150], [260, 90, 85],
  [350, 55, 125], [405, 75, 160], [480, 60, 95], [540, 85, 140], [625, 55, 105],
  [680, 80, 155], [760, 60, 90], [820, 75, 135], [895, 50, 110], [945, 55, 145],
];

function HeroBanner() {
  return (
    <div className="relative h-44 md:h-52 bg-slate-900 overflow-hidden">
      <svg
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
        <rect width="1000" height="200" fill="url(#sky)" />
        <circle cx="880" cy="42" r="22" fill="#fef3c7" opacity="0.9" />
        {SKYLINE.map(([x, w, h], i) => (
          <g key={i}>
            <rect x={x} y={200 - h} width={w} height={h} fill="#0b1224" />
            {Array.from({ length: Math.floor((h - 16) / 18) }, (_, r) =>
              Array.from({ length: Math.floor((w - 10) / 16) }, (_, c) =>
                (i * 7 + r * 3 + c) % 4 !== 0 ? (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 8 + c * 16}
                    y={200 - h + 10 + r * 18}
                    width="7"
                    height="9"
                    fill="#fde68a"
                    opacity="0.55"
                  />
                ) : null
              )
            )}
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-0 bottom-0 px-2 md:px-6 flex items-end justify-between">
        {MEMBERS.map((m, i) => (
          <div
            key={m}
            className="hero-bob relative flex flex-col items-center"
            style={{ animationDelay: `${i * 0.25}s` }}
          >
            {BANNER_BUBBLES[m] && (
              <div className="hidden md:block absolute bottom-full mb-1 w-32 text-center text-[10px] leading-tight text-slate-900 bg-white/90 rounded-lg px-2 py-1 shadow">
                {BANNER_BUBBLES[m]}
              </div>
            )}
            <HeroAvatar name={m} className="w-11 h-11 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px]" />
            <span className="text-[10px] md:text-xs font-semibold text-white/90 mt-0.5">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- App ---------- */

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMember, setSelectedMember] = useState(MEMBERS[0]);
  const [chartMember, setChartMember] = useState(MEMBERS[0]);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden:', error);
    } else if (data) {
      setEntries(data);
    }
  };

  const isCompletedForDate = (member: string, date: string) => {
    return entries.some((e) => {
      const entryDate = e.challenge_date || (e.created_at ? e.created_at.split('T')[0] : '');
      return (
        e.member_name === member &&
        e.exercise === 'Daily Challenge Erfüllt' &&
        entryDate === date
      );
    });
  };

  const isFutureDate = selectedDate > todayStr;
  const isAlreadyDone = isCompletedForDate(selectedMember, selectedDate);

  const handleCompleteChallenge = async () => {
    if (isFutureDate || isAlreadyDone) return;

    setLoading(true);
    const isRetroactive = selectedDate < todayStr;

    const { error } = await supabase.from('daily_logs').insert([
      {
        member_name: selectedMember,
        exercise: 'Daily Challenge Erfüllt',
        amount: 1,
        challenge_date: selectedDate,
        is_retroactive: isRetroactive,
      },
    ]);

    setLoading(false);

    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      fetchEntries();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const getChartData = (member: string) => {
    const memberEntries = entries.filter(
      (e) => e.member_name === member && e.exercise === 'Daily Challenge Erfüllt'
    );

    const dateMap: { [date: string]: number } = {};
    memberEntries.forEach((e) => {
      const rawDate = e.challenge_date || (e.created_at ? e.created_at.split('T')[0] : '');
      if (rawDate) {
        const formattedDate = new Date(rawDate).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
        });
        dateMap[formattedDate] = (dateMap[formattedDate] || 0) + 1;
      }
    });

    let cumulative = 0;
    return Object.keys(dateMap).map((date) => {
      cumulative += dateMap[date];
      return {
        datum: date,
        kumuliert: cumulative,
      };
    });
  };

  const calculateTotals = (member?: string) => {
    const filtered = member ? entries.filter((e) => e.member_name === member) : entries;
    const challengeCount = filtered.filter((e) => e.exercise === 'Daily Challenge Erfüllt').length;

    return {
      pushups: challengeCount * 10,
      plankMinutes: challengeCount * 3,
      squats: challengeCount * 20,
    };
  };

  const selectedMemberTotals = calculateTotals(chartMember);

  const leaderboard = MEMBERS.map((member) => {
    const memberLogs = entries.filter(
      (e) => e.member_name === member && e.exercise === 'Daily Challenge Erfüllt'
    );

    const totalChallenges = memberLogs.length;
    const retroactiveCount = memberLogs.filter((e) => e.is_retroactive).length;
    const isDoneToday = isCompletedForDate(member, todayStr);

    return {
      name: member,
      totalChallenges,
      retroactiveCount,
      isDoneToday,
    };
  }).sort((a, b) => b.totalChallenges - a.totalChallenges);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium-Reihenfolge: Platz 2 links, Platz 1 Mitte, Platz 3 rechts
  const podium = [
    { item: top3[1], rank: 2, ring: 'border-slate-300', avatar: 'w-16 h-16 md:w-20 md:h-20', block: 'h-12', blockBg: 'bg-slate-300 text-slate-950' },
    { item: top3[0], rank: 1, ring: 'border-amber-400', avatar: 'w-20 h-20 md:w-24 md:h-24', block: 'h-16', blockBg: 'bg-amber-400 text-slate-950' },
    { item: top3[2], rank: 3, ring: 'border-amber-700', avatar: 'w-16 h-16 md:w-20 md:h-20', block: 'h-9', blockBg: 'bg-amber-700 text-slate-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <style>{`
        @keyframes confetti-fall {
          0% { top: -5%; opacity: 1; }
          100% { top: 105%; opacity: 0.9; }
        }
        .confetti-piece { animation-name: confetti-fall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
        @keyframes hero-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .hero-bob { animation: hero-bob 2.4s ease-in-out infinite; }
      `}</style>

      {showConfetti && <Confetti />}

      <header className="max-w-5xl mx-auto mb-8 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <HeroBanner />
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
              <Flame className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-wide text-white">
                Daily Challenge Tracker
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Gemeinsam stark: Plank, Kniebeugen & Liegestütze
              </p>
            </div>
          </div>
          <div className="hidden sm:flex text-xs md:text-sm text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 items-center gap-2 shrink-0">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Heute: {new Date().toLocaleDateString('de-DE')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Eingabebereich */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Teilnehmer auswählen
              </label>
              <div className="flex items-center gap-3">
                <HeroAvatar name={selectedMember} className="w-12 h-12 shrink-0" />
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-lg font-semibold rounded-xl p-3 text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {MEMBERS.map((m) => (
                    <option key={m} value={m}>
                      {m} {isCompletedForDate(m, selectedDate) ? '✅ (Für gewähltes Datum erledigt)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Datum der Ausführung
              </label>
              <input
                type="date"
                max={todayStr} // Zukunfts-Tage im Kalender-Picker ausgrauen
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-base rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />

              {/* Hinweis-Texte unter dem Datum */}
              {selectedDate < todayStr && (
                <span className="text-xs text-amber-400 flex items-center gap-1 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Nachträglicher Eintrag (wird als nachgereicht markiert)
                </span>
              )}
              {isFutureDate && (
                <span className="text-xs text-rose-400 flex items-center gap-1 mt-1.5 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" /> Tage in der Zukunft können nicht im Voraus eingetragen werden.
                </span>
              )}
            </div>

            <button
              onClick={handleCompleteChallenge}
              disabled={loading || isAlreadyDone || isFutureDate}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                isFutureDate
                  ? 'bg-rose-950/40 border border-rose-800/60 text-rose-400 cursor-not-allowed'
                  : isAlreadyDone
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 className="w-6 h-6" />
              {isFutureDate
                ? 'Zukunft kann nicht eingetragen werden'
                : isAlreadyDone
                ? 'Für dieses Datum schon eingetragen'
                : `${selectedMember}: Challenge für ${new Date(selectedDate).toLocaleDateString('de-DE')} abhaken!`}
            </button>

            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 block">
                Tagesziel
              </span>
              <ul className="space-y-2.5">
                {DAILY_CHALLENGE.map((item) => (
                  <li
                    key={item.type}
                    className="flex items-center gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-2.5"
                  >
                    <div className="w-16 h-12 shrink-0 text-emerald-400 bg-slate-950 rounded-lg border border-slate-800 p-1">
                      <ExerciseIcon type={item.type} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-100 block">{item.label}</span>
                      <span className="text-xs text-slate-400">{item.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Rangliste mit Podium */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-amber-400">
              <Trophy className="w-5 h-5" /> Challenge-Rangliste
            </h2>

            {/* Podium */}
            <div className="grid grid-cols-3 gap-2 items-end mb-5">
              {podium.map(({ item, rank, ring, avatar, block, blockBg }) => (
                <div key={rank} className="flex flex-col items-center text-center">
                  {rank === 1 ? (
                    <Crown className="w-6 h-6 text-amber-400 mb-1" />
                  ) : (
                    <div className="h-6 mb-1" />
                  )}
                  <div className={`rounded-full border-4 ${ring} bg-slate-950 overflow-hidden ${avatar}`}>
                    <HeroAvatar name={item.name} className="w-full h-full" />
                  </div>
                  <span className="font-semibold text-slate-100 mt-2 text-sm md:text-base">{item.name}</span>
                  <MilestoneBadges count={item.totalChallenges} />
                  <div className="mt-1 flex flex-col items-center gap-1">
                    <DoneBadge done={item.isDoneToday} />
                    <RetroBadge count={item.retroactiveCount} />
                  </div>
                  <div
                    className={`w-full mt-2 rounded-t-xl flex flex-col items-center justify-center ${block} ${blockBg}`}
                  >
                    <span className="text-lg font-extrabold leading-none">{item.totalChallenges}</span>
                    <span className="text-[10px] font-semibold leading-none mt-0.5">Tage</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Plätze 4 bis 7 */}
            <div className="space-y-2.5">
              {rest.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between border rounded-xl p-3 transition-all ${
                    item.isDoneToday
                      ? 'bg-emerald-950/30 border-emerald-800/60'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-800 text-slate-400 shrink-0">
                      {i + 4}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 shrink-0">
                      <HeroAvatar name={item.name} className="w-full h-full" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                        {item.name}
                        <MilestoneBadges count={item.totalChallenges} />
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <DoneBadge done={item.isDoneToday} />
                        <RetroBadge count={item.retroactiveCount} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-amber-400">{item.totalChallenges}</span>
                    <span className="text-xs text-slate-400 block">Tage gesamt</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legende Meilensteine */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
              {MILESTONES.map(({ days, Icon, color }) => (
                <span key={days} className="inline-flex items-center gap-1">
                  <Icon className={`w-3.5 h-3.5 ${color}`} /> {days} Tage
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* GRAFIK-BEREICH */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-5 h-5" /> Auswertung & Fortschritt
            </h2>
            <div className="flex items-center gap-2">
              <HeroAvatar name={chartMember} className="w-8 h-8" />
              <span className="text-sm text-slate-400">Teilnehmer wählen:</span>
              <select
                value={chartMember}
                onChange={(e) => setChartMember(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
              >
                {MEMBERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Kumulierte Tage über Zeit ({chartMember})
              </h3>
              <div className="h-64 w-full bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                {getChartData(chartMember).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData(chartMember)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="datum" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="kumuliert"
                        name="Abgehakte Tage"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Noch keine Daten für {chartMember} vorhanden
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">
                Gesamtergebnisse ({chartMember})
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Liegestütze gesamt</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {selectedMemberTotals.pushups}
                    </span>
                  </div>
                  <Dumbbell className="w-6 h-6 text-emerald-500/40" />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Plank-Minuten gesamt</span>
                    <span className="text-2xl font-bold text-amber-400">
                      {selectedMemberTotals.plankMinutes} Min.
                    </span>
                  </div>
                  <Flame className="w-6 h-6 text-amber-500/40" />
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Kniebeugen gesamt</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {selectedMemberTotals.squats}
                    </span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-blue-500/40" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
