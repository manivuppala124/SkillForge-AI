import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const DailyTracker = () => {
  const [tasks, setTasks] = useState([
    {id:1, title:'Code for 1 hour', done:false},
    {id:2, title:'Read AI article', done:false},
  ]);

  const toggle = (id) => {
    setTasks(tasks.map(t => t.id===id ? {...t, done:!t.done} : t));
  };

  return (
    <div className="card">
      <h4 className="font-bold mb-4">Daily Tracker</h4>
      {tasks.map(t => (
        <div key={t.id} className="flex items-center justify-between mb-2">
          <span className={t.done ? 'line-through text-gray-500' : ''}>{t.title}</span>
          <button onClick={()=>toggle(t.id)} className={`p-1 rounded-full ${t.done ? 'bg-green-500 text-white':'bg-gray-200'}`}><CheckCircle size={16}/></button>
        </div>
      ))}
    </div>
  );
};

export default DailyTracker;
