// // ===== client/src/pages/Dashboard.jsx =====
// import React, { useState, useEffect } from 'react'
// import { useAuth } from '../hooks/useAuth'
// import { Brain, Target, BookOpen, TrendingUp, Clock, Award } from 'lucide-react'
// import { resumeAPI, quizAPI, learningAPI } from '../services/api'

// const Dashboard = () => {
//   const { user } = useAuth()
//   const [stats, setStats] = useState({
//     totalQuizzes: 0,
//     averageScore: 0,
//     learningPaths: 0,
//     hoursLearned: 0
//   })
//   const [recentActivity, setRecentActivity] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     loadDashboardData()
//   }, [])

//   const loadDashboardData = async () => {
//     try {
//       // Load user stats and recent activity
//       // This would typically come from multiple API calls
//       setStats({
//         totalQuizzes: 12,
//         averageScore: 85,
//         learningPaths: 3,
//         hoursLearned: 47
//       })
      
//       setRecentActivity([
//         { type: 'quiz', title: 'React Fundamentals Quiz', score: 90, date: '2 hours ago' },
//         { type: 'learning', title: 'Started Full Stack Development Path', date: '1 day ago' },
//         { type: 'resume', title: 'Resume Analysis Completed', date: '3 days ago' }
//       ])
//     } catch (error) {
//       console.error('Error loading dashboard data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const quickActions = [
//     {
//       icon: Brain,
//       title: 'Analyze Resume',
//       description: 'Get AI insights on your resume',
//       action: 'career',
//       color: 'bg-blue-500'
//     },
//     {
//       icon: Target,
//       title: 'Create Learning Path',
//       description: 'Generate personalized curriculum',
//       action: 'learning',
//       color: 'bg-green-500'
//     },
//     {
//       icon: BookOpen,
//       title: 'Take Quiz',
//       description: 'Test your knowledge',
//       action: 'quiz',
//       color: 'bg-purple-500'
//     }
//   ]

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Welcome Header */}
//       <div className="card bg-gradient-to-r from-primary to-secondary text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">
//               Welcome back, {user?.displayName || 'Learner'}! 👋
//             </h1>
//             <p className="text-blue-100">
//               Continue your learning journey and achieve your goals
//             </p>
//           </div>
//           <div className="hidden md:block">
//             <img 
//               src={user?.photoURL || '/default-avatar.png'} 
//               alt="Profile" 
//               className="w-16 h-16 rounded-full border-4 border-white"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid md:grid-cols-4 gap-6">
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">Total Quizzes</p>
//               <p className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</p>
//             </div>
//             <BookOpen className="h-8 w-8 text-blue-500" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">Average Score</p>
//               <p className="text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
//             </div>
//             <TrendingUp className="h-8 w-8 text-green-500" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">Learning Paths</p>
//               <p className="text-2xl font-bold text-gray-800">{stats.learningPaths}</p>
//             </div>
//             <Target className="h-8 w-8 text-purple-500" />
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">Hours Learned</p>
//               <p className="text-2xl font-bold text-gray-800">{stats.hoursLearned}</p>
//             </div>
//             <Clock className="h-8 w-8 text-orange-500" />
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="card">
//         <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
//         <div className="grid md:grid-cols-3 gap-4">
//           {quickActions.map((action, index) => (
//             <div
//               key={index}
//               className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
//             >
//               <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
//                 <action.icon className="h-6 w-6 text-white" />
//               </div>
//               <h3 className="font-medium text-gray-800 mb-2">{action.title}</h3>
//               <p className="text-sm text-gray-600">{action.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="card">
//         <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h2>
//         <div className="space-y-4">
//           {recentActivity.map((activity, index) => (
//             <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
//               <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
//                 {activity.type === 'quiz' && <BookOpen className="h-5 w-5 text-white" />}
//                 {activity.type === 'learning' && <Target className="h-5 w-5 text-white" />}
//                 {activity.type === 'resume' && <Brain className="h-5 w-5 text-white" />}
//               </div>
//               <div className="flex-1">
//                 <h4 className="font-medium text-gray-800">{activity.title}</h4>
//                 <p className="text-sm text-gray-600">{activity.date}</p>
//               </div>
//               {activity.score && (
//                 <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
//                   {activity.score}%
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Target, Brain, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    learningPaths: 0,
    hoursLearned: 0
  });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Placeholder data
    setStats({ totalQuizzes:12, averageScore:85, learningPaths:3, hoursLearned:47 });
    setRecent([
      { type:'quiz', title:'React Quiz', date:'2 hours ago', score:90 },
      { type:'learning', title:'Full Stack Path', date:'1 day ago' },
      { type:'resume', title:'Resume Analysis', date:'3 days ago' }
    ]);
  }, []);

  const cards = [
    { icon: BookOpen, label:'Total Quizzes', value: stats.totalQuizzes },
    { icon: TrendingUp, label:'Average Score', value:`${stats.averageScore}%` },
    { icon: Target, label:'Learning Paths', value: stats.learningPaths },
    { icon: Clock, label:'Hours Learned', value: stats.hoursLearned }
  ];

  const quick = [
    { to:'/career', icon: Brain, label:'Analyze Resume' },
    { to:'/learning', icon: Target, label:'Create Path' },
    { to:'/quiz', icon: BookOpen, label:'Take Quiz' }
  ];

  return (
    <div className="space-y-8">
      <div className="card bg-white p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {user?.displayName || 'Learner'}!</h2>
          <p className="text-gray-600">Let's continue your journey.</p>
        </div>
        <img src={user?.photoURL || '/default-avatar.png'} alt="Avatar" className="w-16 h-16 rounded-full"/>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {cards.map(({ icon:Icon, label, value }, i) => (
          <div key={i} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-xl font-semibold">{value}</p>
            </div>
            <Icon className="w-8 h-8 text-primary"/>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {quick.map(({ to, icon:Icon, label }, i) => (
          <Link key={i} to={to} className="card flex items-center space-x-3 hover:shadow-lg transition p-4">
            <Icon className="w-6 h-6 text-primary"/>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="card">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          {recent.map((r,i) => (
            <li key={i} className="flex justify-between items-center">
              <span>{r.title}</span>
              <div className="flex items-center space-x-2">
                {r.score && <span className="text-green-600">{r.score}%</span>}
                <span className="text-sm text-gray-500">{r.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
