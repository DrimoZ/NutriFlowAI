import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../store/chat';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

type DailyLog = { waterMl: number; sleepHours: number; steps: number; mood: number; date: string };

export function App() {
  const { messages, add, conversationId, setConversationId } = useChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('demo@nutriflow.ai');
  const [password, setPassword] = useState('password123');
  const { login, loading: authLoading, isAuthed } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [log, setLog] = useState<DailyLog>({ waterMl: 1600, sleepHours: 7, steps: 6500, mood: 7, date: today });
  const [grocery, setGrocery] = useState<Record<string, string[]>>({});

  const score = useMemo(() => Math.round((Math.min(log.waterMl/2500,1)+Math.min(log.sleepHours/8,1)+Math.min(log.steps/9000,1)+Math.min(log.mood/10,1))*25), [log]);

  useEffect(() => { if (isAuthed) api.get('/daily-logs').then(({data}) => { if (data?.[0]) setLog(data[0]); }).catch(()=>undefined); }, [isAuthed]);

  const saveDaily = async () => { await api.post('/daily-logs', log); };
  const generatePlan = async () => {
    const { data: me } = await api.get('/users/me');
    const n = me.nutritionProfile;
    const pref = me.preference;
    const { data } = await api.post('/meal-plans/generate', { days: 3, calories: n?.calories ?? 2200, proteinG: n?.proteinG ?? 150, carbsG: n?.carbsG ?? 220, fatsG: n?.fatsG ?? 70, allergies: pref?.allergies ?? [], dislikedFoods: [], dietType: pref?.restrictions?.[0] ?? 'omnivore', weeklyBudget: pref?.budget ?? 120 });
    setGrocery(data.generated?.grocerySections ?? {});
    add({ role: 'assistant', content: `Plan generated: ${data.saved?.title ?? 'New plan'} ✅` });
  };

  const send = async () => {
    if (!input.trim()) return;
    add({ role: 'user', content: input }); setLoading(true);
    try { const { data } = await api.post('/ai/chat', { message: input, conversationId }); add({ role: 'assistant', content: data.reply }); if (data.conversationId) setConversationId(data.conversationId); }
    catch { add({ role: 'assistant', content: 'My chef brain lagged 🧠🍳 — mind retrying?' }); }
    setInput(''); setLoading(false);
  };

  return <main className='max-w-6xl mx-auto p-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]'>
    <section className='rounded-3xl bg-white/5 p-4 border border-white/10'>
      <h1 className='text-2xl font-bold'>NutriFlow AI</h1>
      {!isAuthed && <div className='my-3 grid gap-2 sm:grid-cols-3'><input className='rounded p-2 text-black' value={email} onChange={(e)=>setEmail(e.target.value)} /><input className='rounded p-2 text-black' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /><button className='rounded bg-cyan-400 text-black' onClick={()=>login(email,password)} disabled={authLoading}>Login</button></div>}
      <div className='space-y-2 min-h-[40vh] max-h-[52vh] overflow-y-auto my-3'>{messages.map((m,i)=><motion.div key={i} initial={{opacity:0}} animate={{opacity:1}} className={`rounded-xl p-3 ${m.role==='assistant'?'bg-white/10':'bg-cyan-500/30'}`}>{m.content}</motion.div>)}{loading&&<div className='animate-pulse'>AI thinking...</div>}</div>
      <div className='flex gap-2'><input className='flex-1 rounded p-3 text-black' value={input} onChange={(e)=>setInput(e.target.value)} placeholder='Chat your goal, allergies, and preferences...' /><button className='rounded bg-cyan-400 px-4 text-black' onClick={send}>Send</button></div>
    </section>
    <aside className='grid gap-4'>
      <div className='rounded-2xl bg-white/5 p-4 border border-white/10'><div className='text-sm'>Wellness Score</div><div className='text-3xl font-bold'>{score}</div><div className='h-2 bg-white/10 rounded'><div className='h-2 bg-cyan-400 rounded' style={{width:`${score}%`}} /></div></div>
      <div className='rounded-2xl bg-white/5 p-4 border border-white/10'>
        <h3 className='font-semibold mb-2'>Daily Input</h3>
        <div className='grid grid-cols-2 gap-2 text-sm'>
          <input type='number' className='rounded p-2 text-black' value={log.waterMl} onChange={(e)=>setLog({...log,waterMl:Number(e.target.value)})} />
          <input type='number' className='rounded p-2 text-black' value={log.sleepHours} onChange={(e)=>setLog({...log,sleepHours:Number(e.target.value)})} />
          <input type='number' className='rounded p-2 text-black' value={log.steps} onChange={(e)=>setLog({...log,steps:Number(e.target.value)})} />
          <input type='number' className='rounded p-2 text-black' value={log.mood} onChange={(e)=>setLog({...log,mood:Number(e.target.value)})} />
        </div>
        <div className='flex gap-2 mt-2'><button className='rounded bg-white/10 px-3 py-2 text-sm' onClick={saveDaily}>Save Daily</button><button className='rounded bg-cyan-500/40 px-3 py-2 text-sm' onClick={generatePlan}>Generate Plan</button></div>
      </div>
      <div className='rounded-2xl bg-white/5 p-4 border border-white/10'>
        <h3 className='font-semibold mb-2'>Grocery List</h3>
        {Object.keys(grocery).length===0 ? <div className='text-sm text-white/70'>Generate a plan to populate sections.</div> : Object.entries(grocery).map(([k,v])=> <div key={k} className='mb-2'><div className='font-medium text-sm'>{k}</div><ul className='text-sm text-white/80 list-disc pl-5'>{v.map((i)=> <li key={i}>{i}</li>)}</ul></div>)}
      </div>
    </aside>
  </main>;
}
