import React, { useState } from 'react';
import { tutorAPI } from '../services/api';
import { SendHorizonal } from 'lucide-react';
import toast from 'react-hot-toast';

const AITutor = () => {
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]);

  const ask = async () => {
    if (!question.trim()) return;
    const userMsg = { role: 'user', content: question };
    setChat([...chat, userMsg]);
    setQuestion('');
    try {
      const res = await tutorAPI.ask(question);
      setChat(c => [...c, { role: 'assistant', content: res.data.response }]);
    } catch {
      toast.error('Tutor unavailable');
    }
  };

  return (
    <div className="card flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-2">
        {chat.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role==='user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.role==='user' ? 'bg-primary text-white' : 'bg-gray-100'}`}>{msg.content}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input value={question} onChange={e=>setQuestion(e.target.value)} className="input-field flex-1 mr-2" placeholder="Ask your tutor..."/>
        <button onClick={ask} className="btn-primary"><SendHorizonal size={16}/></button>
      </div>
    </div>
  );
};

export default AITutor;
