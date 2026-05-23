import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../store/chat';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

type DailyLog = { waterMl: number; sleepHours: number; steps: number; mood: number; date: string };

type Toast = { type: 'success' | 'error'; message: string };

const DEFAULT_EMAIL = 'demo@nutriflow.ai';
const DEFAULT_PASSWORD = 'password123';

export function App() {
  const { messages, add, conversationId, setConversationId } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [name, setName] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);
  const { login, register, logout, loading: authLoading, isAuthed } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [log, setLog] = useState<DailyLog>({ waterMl: 1600, sleepHours: 7, steps: 6500, mood: 7, date: today });
  const [grocery, setGrocery] = useState<Record<string, string[]>>({});

  const score = useMemo(
    () => Math.round((Math.min(log.waterMl / 2500, 1) + Math.min(log.sleepHours / 8, 1) + Math.min(log.steps / 9000, 1) + Math.min(log.mood / 10, 1)) * 25),
    [log],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAuthed) return;
    api.get('/daily-logs')
      .then(({ data }) => {
        if (data?.[0]) setLog(data[0]);
      })
      .catch(() => setToast({ type: 'error', message: 'Could not load daily logs.' }));
  }, [isAuthed]);

  const onAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setToast({ type: 'error', message: 'Email and password are required.' });
      return;
    }
    if (authMode === 'register' && !name.trim()) {
      setToast({ type: 'error', message: 'Please enter your name to create an account.' });
      return;
    }
    try {
      if (authMode === 'login') await login(email, password);
      else await register(email, password, name);
      setToast({ type: 'success', message: authMode === 'login' ? 'Welcome back!' : 'Account created and signed in.' });
    } catch {
      setToast({ type: 'error', message: `Unable to ${authMode}. Please check your details.` });
    }
  };

  const saveDaily = async () => {
    try {
      await api.post('/daily-logs', log);
      setToast({ type: 'success', message: 'Daily log saved.' });
    } catch {
      setToast({ type: 'error', message: 'Could not save daily log.' });
    }
  };

  const generatePlan = async () => {
    if (!isAuthed) {
      setToast({ type: 'error', message: 'Please login first.' });
      return;
    }
    try {
      const { data: me } = await api.get('/users/me');
      const n = me.nutritionProfile;
      const pref = me.preference;
      const { data } = await api.post('/meal-plans/generate', {
        days: 3,
        calories: n?.calories ?? 2200,
        proteinG: n?.proteinG ?? 150,
        carbsG: n?.carbsG ?? 220,
        fatsG: n?.fatsG ?? 70,
        allergies: pref?.allergies ?? [],
        dislikedFoods: [],
        dietType: pref?.restrictions?.[0] ?? 'omnivore',
        weeklyBudget: pref?.budget ?? 120,
      });
      setGrocery(data.generated?.grocerySections ?? {});
      add({ role: 'assistant', content: `Plan generated: ${data.saved?.title ?? 'New plan'} ✅` });
      setToast({ type: 'success', message: 'Meal plan generated.' });
    } catch {
      setToast({ type: 'error', message: 'Plan generation failed. Please finish onboarding in chat first.' });
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    add({ role: 'user', content: input });
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: input, conversationId });
      add({ role: 'assistant', content: data.reply });
      if (data.conversationId) setConversationId(data.conversationId);
    } catch {
      add({ role: 'assistant', content: 'My chef brain lagged 🧠🍳 — mind retrying?' });
    }
    setInput('');
    setLoading(false);
  };

  return (
    <main className="max-w-7xl mx-auto p-4 lg:p-6 grid gap-4 lg:gap-6 lg:grid-cols-[1.5fr_1fr]">
      {toast && (
        <div className={`fixed top-4 right-4 z-20 rounded-xl px-4 py-3 border ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-300/40' : 'bg-rose-500/20 border-rose-300/40'}`}>
          {toast.message}
        </div>
      )}
      <section className="rounded-3xl bg-white/5 p-5 border border-white/10 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-2xl font-bold">NutriFlow AI</h1>
          {isAuthed && <button className="rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/20" onClick={logout}>Logout</button>}
        </div>
        <p className="text-sm text-white/75 mt-1">Chat with your nutrition coach, track your daily habits, and generate meal plans in one place.</p>

        {!isAuthed && (
          <div className="my-4 rounded-2xl border border-white/10 p-4 bg-black/10">
            <h2 className="text-sm font-semibold mb-1">Get started</h2>
            <p className="text-xs text-white/70 mb-3">Create an account to save logs, generate plans, and keep your chat context.</p>
            <div className="flex gap-2 mb-3 text-sm">
              <button className={`px-3 py-1.5 rounded-lg ${authMode === 'login' ? 'bg-cyan-400 text-black' : 'bg-white/10'}`} onClick={() => setAuthMode('login')}>Login</button>
              <button className={`px-3 py-1.5 rounded-lg ${authMode === 'register' ? 'bg-cyan-400 text-black' : 'bg-white/10'}`} onClick={() => setAuthMode('register')}>Register</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {authMode === 'register' && <input className="rounded-lg p-2.5 text-black" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />}
              <input className="rounded-lg p-2.5 text-black" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <input className="rounded-lg p-2.5 text-black" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
              <button className="rounded-lg bg-cyan-400 text-black font-medium" onClick={onAuth} disabled={authLoading}>{authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}</button>
            </div>
            <p className="text-xs text-white/70 mt-2">Password must be 10-72 chars and contain both letters and numbers.</p>
          </div>
        )}

        <div className="space-y-2 min-h-[42vh] max-h-[52vh] overflow-y-auto my-3 pr-1">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-3 ${m.role === 'assistant' ? 'bg-white/10' : 'bg-cyan-500/30'}`}>
              {m.content}
            </motion.div>
          ))}
          {loading && <div className="animate-pulse text-sm text-white/70">AI is thinking...</div>}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 rounded-xl p-3 text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tell me your goals, allergies, and food preferences..." onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button className="rounded-xl bg-cyan-400 px-4 text-black font-semibold" onClick={send}>Send</button>
        </div>
      </section>

      <aside className="grid gap-4">
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <h3 className="font-semibold mb-2">How to use NutriFlow</h3>
          <ol className="text-sm text-white/80 list-decimal pl-5 space-y-1">
            <li>{isAuthed ? 'You are signed in. Start by chatting your goals and preferences.' : 'Login or register first to unlock saved plans and logs.'}</li>
            <li>Update your Daily Tracking values and click <strong>Save Daily</strong>.</li>
            <li>Click <strong>Generate Plan</strong> to build a grocery list tailored to your profile.</li>
          </ol>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <div className="text-sm text-white/75">Wellness Score</div>
          <div className="text-4xl font-bold mt-1">{score}</div>
          <div className="h-2 mt-2 bg-white/10 rounded"><div className="h-2 bg-cyan-400 rounded" style={{ width: `${score}%` }} /></div>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <h3 className="font-semibold mb-2">Daily Tracking</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input type="number" className="rounded p-2 text-black" value={log.waterMl} onChange={(e) => setLog({ ...log, waterMl: Number(e.target.value) })} title="Water (ml)" />
            <input type="number" className="rounded p-2 text-black" value={log.sleepHours} onChange={(e) => setLog({ ...log, sleepHours: Number(e.target.value) })} title="Sleep (hours)" />
            <input type="number" className="rounded p-2 text-black" value={log.steps} onChange={(e) => setLog({ ...log, steps: Number(e.target.value) })} title="Steps" />
            <input type="number" className="rounded p-2 text-black" value={log.mood} onChange={(e) => setLog({ ...log, mood: Number(e.target.value) })} title="Mood (1-10)" />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20" onClick={saveDaily}>Save Daily</button>
            <button className="rounded bg-cyan-500/40 px-3 py-2 text-sm hover:bg-cyan-400/50" onClick={generatePlan}>Generate Plan</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
          <h3 className="font-semibold mb-2">Grocery List</h3>
          {Object.keys(grocery).length === 0 ? (
            <div className="text-sm text-white/70">No groceries yet. Generate a meal plan to auto-fill this list.</div>
          ) : (
            Object.entries(grocery).map(([k, v]) => (
              <div key={k} className="mb-2">
                <div className="font-medium text-sm">{k}</div>
                <ul className="text-sm text-white/80 list-disc pl-5">
                  {v.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </aside>
    </main>
  );
}
