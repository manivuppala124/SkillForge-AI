import React, { useState } from 'react';
import { learningAPI } from '../services/api';
import { LEARNING_TIMELINES, JOB_ROLES } from '../utils/constants';
import { Target, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LearningPath = () => {
  const [goal, setGoal] = useState('');
  const [timeline, setTimeline] = useState('90');
  const [currentSkills, setCurrentSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState(null);

  const generate = async () => {
    if (!goal || !currentSkills) return toast.error('Fill all fields');
    setLoading(true);
    try {
      const res = await learningAPI.generate(goal, timeline, currentSkills.split(',').map(s=>s.trim()));
      setPath(res.data);
      toast.success('Path generated!');
    } catch {
      toast.error('Path generation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id) => {
    await learningAPI.updateProgress(path.id, id);
    setPath({
      ...path,
      modules: path.modules.map(m => m.id === id ? { ...m, completed: !m.completed } : m)
    });
  };

  if (!path) {
    return (
      <div className="card">
        <h2 className="text-lg font-bold mb-4"><Target className="inline-block mr-2"/>AI Learning Path</h2>
        <select className="input-field mb-2" value={goal} onChange={e=>setGoal(e.target.value)}>
          <option value="">Select Role</option>
          {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input-field mb-2" value={timeline} onChange={e=>setTimeline(e.target.value)}>
          {LEARNING_TIMELINES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <textarea className="input-field mb-4" placeholder="Current skills, comma separated" value={currentSkills} onChange={e=>setCurrentSkills(e.target.value)}/>
        <button onClick={generate} disabled={loading} className="btn-primary w-full">{loading ? 'Generating...' : 'Generate Path'}</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-bold">{path.goal}</h3>
        <p className="text-sm flex items-center"><Clock size={14} className="mr-1"/>{path.timeline} days • <BookOpen size={14} className="mr-1 ml-2"/>{path.modules.length} modules</p>
      </div>
      {path.modules.map((m,i) => (
        <div key={m.id} className={`p-3 mb-2 border rounded ${m.completed ? 'bg-green-50' : ''}`}>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs bg-primary text-white px-2 py-1 rounded mr-2">Week {i+1}</span>
              {m.title}
            </div>
            <button onClick={()=>toggleComplete(m.id)} className={`p-1 rounded-full ${m.completed ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              <CheckCircle2 size={16}/>
            </button>
          </div>
          <p className="text-sm text-gray-600">{m.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningPath;
