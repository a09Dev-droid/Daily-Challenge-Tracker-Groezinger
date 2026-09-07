import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Trophy, CheckCircle2, Flame, Calendar, Dumbbell, TrendingUp, BarChart3, Clock, AlertCircle, History, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MEMBERS = ['Daniel', 'Ricki', 'Emma', 'Lusia', 'Clara', 'Aye'];

const DAILY_CHALLENGE = [
  '3x 1 Min. Plank',
  '20 Kniebeugen',
  '10 Liegestütze',
];

interface Entry {
  id?: string;
  member_name: string;
  exercise: string;
  amount: number;
  created_at?: string;
  challenge_date?: string;
  is_retroactive?: boolean;
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMember, setSelectedMember] = useState(MEMBERS[0]);
  const [chartMember, setChartMember] = useState(MEMBERS[0]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto mb-8 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-44 md:h-52 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
            alt="Workout Banner"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl backdrop-blur">
              <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-white drop-shadow">
                Daily Challenge Tracker
              </h1>
              <p className="text-xs md:text-sm text-slate-300">
                Gemeinsam stark: Plank, Kniebeugen & Liegestütze
              </p>
            </div>
          </div>
          <div className="text-xs md:text-sm text-slate-300 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2">
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

            <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 block">
                Tagesziel
              </span>
              <ul className="space-y-2">
                {DAILY_CHALLENGE.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-200">
                    <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
          </section>

          {/* Rangliste */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-400">
                <Trophy className="w-5 h-5" /> Challenge-Rangliste
              </h2>
              <div className="space-y-3">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between border rounded-xl p-3.5 transition-all ${
                      item.isDoneToday
                        ? 'bg-emerald-950/30 border-emerald-800/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-amber-400 text-slate-950'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                            ? 'bg-amber-700 text-slate-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-100 block">{item.name}</span>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {item.isDoneToday ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" /> Heute erledigt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                              <Clock className="w-3 h-3 text-amber-500" /> Heute noch offen
                            </span>
                          )}

                          {item.retroactiveCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                              <History className="w-3 h-3" /> {item.retroactiveCount}x nachgereicht
                            </span>
                          )}
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