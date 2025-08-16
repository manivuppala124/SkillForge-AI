// // ===== client/src/pages/Learning.jsx =====
// import React from 'react'
// import LearningPath from '../components/LearningPath.jsx'
// import { BookOpen, Target, Award, Clock } from 'lucide-react'

// const Learning = () => {
//   const learningStats = [
//     { label: 'Active Paths', value: '2', icon: Target, color: 'text-blue-600' },
//     { label: 'Completed Modules', value: '15', icon: Award, color: 'text-green-600' },
//     { label: 'Study Hours', value: '47', icon: Clock, color: 'text-purple-600' },
//     { label: 'Certificates', value: '3', icon: Award, color: 'text-orange-600' }
//   ]

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
//           <BookOpen className="mr-3 h-10 w-10 text-primary" />
//           AI Learning Center
//         </h1>
//         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//           Generate personalized learning paths, track your progress, and achieve your career goals 
//           with AI-powered curriculum designed just for you.
//         </p>
//       </div>

//       {/* Learning Stats */}
//       <div className="grid md:grid-cols-4 gap-6">
//         {learningStats.map((stat, index) => (
//           <div key={index} className="card">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">{stat.label}</p>
//                 <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
//               </div>
//               <stat.icon className={`h-8 w-8 ${stat.color}`} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Main Learning Component */}
//       <LearningPath />

//       {/* Learning Resources */}
//       <div className="grid lg:grid-cols-2 gap-8">
//         <div className="card">
//           <h3 className="text-xl font-semibold mb-4">Recommended Resources</h3>
//           <div className="space-y-3">
//             <div className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
//               <h4 className="font-medium text-gray-800">The Complete Web Developer Course</h4>
//               <p className="text-sm text-gray-600">Comprehensive full-stack development course</p>
//               <div className="flex items-center justify-between mt-2">
//                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Course</span>
//                 <span className="text-xs text-gray-500">4.8 ⭐ (12K reviews)</span>
//               </div>
//             </div>
            
//             <div className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
//               <h4 className="font-medium text-gray-800">JavaScript: The Good Parts</h4>
//               <p className="text-sm text-gray-600">Master JavaScript fundamentals and best practices</p>
//               <div className="flex items-center justify-between mt-2">
//                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Book</span>
//                 <span className="text-xs text-gray-500">4.5 ⭐ (5K reviews)</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <h3 className="text-xl font-semibold mb-4">Study Schedule</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div>
//                 <h4 className="font-medium">React Components</h4>
//                 <p className="text-sm text-gray-600">Today, 2:00 PM</p>
//               </div>
//               <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Upcoming</span>
//             </div>
            
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div>
//                 <h4 className="font-medium">Database Design</h4>
//                 <p className="text-sm text-gray-600">Tomorrow, 10:00 AM</p>
//               </div>
//               <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Scheduled</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Learning
import React from 'react';
import LearningPath from '../components/LearningPath';

const Learning = () => (
  <div>
    <LearningPath />
  </div>
);

export default Learning;
