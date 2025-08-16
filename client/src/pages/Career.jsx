// // ===== client/src/pages/Career.jsx =====
// import React from 'react'
// import UploadResume from '../components/UploadResume.jsx'
// import { Briefcase, Target, TrendingUp } from 'lucide-react'

// const Career = () => {
//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
//           <Briefcase className="mr-3 h-10 w-10 text-primary" />
//           AI Career Assistant
//         </h1>
//         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//           Get instant AI-powered insights on your resume, discover skill gaps, 
//           and find the perfect career opportunities tailored to your profile.
//         </p>
//       </div>

//       {/* Career Tools Grid */}
//       <div className="grid lg:grid-cols-3 gap-8">
//         {/* Resume Analyzer */}
//         <div className="lg:col-span-2">
//           <UploadResume />
//         </div>

//         {/* Career Insights Sidebar */}
//         <div className="space-y-6">
//           {/* Career Tips */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4 flex items-center">
//               <Target className="mr-2 h-5 w-5 text-primary" />
//               Career Tips
//             </h3>
//             <div className="space-y-3">
//               <div className="p-3 bg-blue-50 rounded-lg">
//                 <h4 className="font-medium text-blue-900">Optimize Keywords</h4>
//                 <p className="text-sm text-blue-700">Include industry-specific keywords to pass ATS systems</p>
//               </div>
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <h4 className="font-medium text-green-900">Quantify Achievements</h4>
//                 <p className="text-sm text-green-700">Use numbers and metrics to showcase your impact</p>
//               </div>
//               <div className="p-3 bg-purple-50 rounded-lg">
//                 <h4 className="font-medium text-purple-900">Stay Updated</h4>
//                 <p className="text-sm text-purple-700">Keep your skills current with industry trends</p>
//               </div>
//             </div>
//           </div>

//           {/* Market Trends */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4 flex items-center">
//               <TrendingUp className="mr-2 h-5 w-5 text-primary" />
//               Hot Skills 2024
//             </h3>
//             <div className="space-y-2">
//               {['AI/Machine Learning', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'React/Next.js'].map((skill, index) => (
//                 <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                   <span className="text-sm font-medium">{skill}</span>
//                   <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hot</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Interview Prep */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4">Interview Preparation</h3>
//             <button className="btn-primary w-full mb-3">
//               Generate Interview Questions
//             </button>
//             <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               Mock Interview Practice
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Career
import React from 'react';
import UploadResume from '../components/UploadResume';
import { Briefcase, Target, TrendingUp } from 'lucide-react';

const Career = () => (
  <div className="space-y-8">
    <header className="text-center">
      <h2 className="text-3xl font-bold mb-2 flex justify-center items-center">
        <Briefcase className="mr-2"/>AI Career Assistant
      </h2>
      <p className="text-gray-600">Analyze your resume, identify gaps, and get tailored job suggestions.</p>
    </header>
    <div className="grid lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2">
        <UploadResume />
      </section>
      <aside className="space-y-6">
        <div className="card">
          <h3 className="font-semibold mb-2 flex items-center"><Target className="mr-2"/>Tips</h3>
          <ul className="space-y-2 text-sm">
            <li>Optimize keywords for ATS</li>
            <li>Quantify achievements</li>
            <li>Focus on impactful projects</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2 flex items-center"><TrendingUp className="mr-2"/>Hot Skills</h3>
          <ul className="space-y-2 text-sm">
            {['AI/ML','Cloud','DevOps','Cybersecurity','React'].map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </aside>
    </div>
  </div>
);

export default Career;
