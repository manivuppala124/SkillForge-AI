import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const PortfolioBuilder = () => {
  const [portfolio, setPortfolio] = useState({title:'', about:'', projects:[]});

  const savePortfolio = () => {
    toast.success('Portfolio saved (demo)');
  };

  return (
    <div className="card">
      <h4 className="font-bold mb-4 flex items-center"><FileText className="mr-1"/>Portfolio Builder</h4>
      <input className="input-field mb-2" placeholder="Portfolio Title" value={portfolio.title} onChange={e=>setPortfolio({...portfolio,title:e.target.value})}/>
      <textarea className="input-field mb-2" placeholder="About You" value={portfolio.about} onChange={e=>setPortfolio({...portfolio,about:e.target.value})}/>
      <button onClick={savePortfolio} className="btn-primary w-full flex items-center justify-center"><Save size={16} className="mr-1"/>Save Portfolio</button>
    </div>
  );
};

export default PortfolioBuilder;
