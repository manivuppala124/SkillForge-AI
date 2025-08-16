// // ===== client/src/pages/Quiz.jsx =====
// import React from 'react'
// import QuizGenerator from '../components/QuizGenerator.jsx'
// import { Brain, Trophy, Target, Clock } from 'lucide-react'

// const Quiz = () => {
//   const quizStats = [
//     { label: 'Quizzes Taken', value: '24', icon: Brain, color: 'text-blue-600' },
//     { label: 'Average Score', value: '87%', icon: Trophy, color: 'text-yellow-600' },
//     { label: 'Topics Mastered', value: '8', icon: Target, color: 'text-green-600' },
//     { label: 'Time Spent', value: '12h', icon: Clock, color: 'text-purple-600' }
//   ]

//   const recentQuizzes = [
//     { topic: 'React Hooks', score: 95, difficulty: 'intermediate', date: '2 days ago' },
//     { topic: 'Node.js APIs', score: 82, difficulty: 'advanced', date: '5 days ago' },
//     { topic: 'CSS Flexbox', score: 100, difficulty: 'beginner', date: '1 week ago' }
//   ]

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
//           <Brain className="mr-3 h-10 w-10 text-primary" />
//           AI Quiz Generator
//         </h1>
//         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//           Test your knowledge with AI-generated quizzes tailored to your skill level. 
//           Track your progress and identify areas for improvement.
//         </p>
//       </div>

//       {/* Quiz Stats */}
//       <div className="grid md:grid-cols-4 gap-6">
//         {quizStats.map((stat, index) => (
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

//       {/* Main Quiz Generator */}
//       <div className="grid lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2">
//           <QuizGenerator />
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Recent Quizzes */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4">Recent Quizzes</h3>
//             <div className="space-y-3">
//               {recentQuizzes.map((quiz, index) => (
//                 <div key={index} className="p-3 border border-gray-200 rounded-lg">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-medium text-gray-800">{quiz.topic}</h4>
//                     <span className={`text-lg font-bold ${
//                       quiz.score >= 90 ? 'text-green-600' : 
//                       quiz.score >= 70 ? 'text-yellow-600' : 'text-red-600'
//                     }`}>
//                       {quiz.score}%
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-sm text-gray-600">
//                     <span className="capitalize">{quiz.difficulty}</span>
//                     <span>{quiz.date}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Performance Insights */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
//             <div className="space-y-3">
//               <div className="p-3 bg-green-50 rounded-lg">
//                 <h4 className="font-medium text-green-900">Strong Areas</h4>
//                 <p className="text-sm text-green-700">Frontend Development, JavaScript</p>
//               </div>
//               <div className="p-3 bg-orange-50 rounded-lg">
//                 <h4 className="font-medium text-orange-900">Areas to Improve</h4>
//                 <p className="text-sm text-orange-700">Backend APIs, Database Design</p>
//               </div>
//             </div>
//           </div>

//           {/* Recommended Topics */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4">Recommended Topics</h3>
//             <div className="space-y-2">
//               {['Node.js Express', 'MongoDB Aggregation', 'REST API Design', 'Authentication'].map((topic, index) => (
//                 <button
//                   key={index}
//                   className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
//                 >
//                   {topic}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Quiz
import React from 'react';
import QuizGenerator from '../components/QuizGenerator';

const Quiz = () => (
  <div>
    <QuizGenerator />
  </div>
);

export default Quiz;
