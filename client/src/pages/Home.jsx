// // ===== client/src/pages/Home.jsx =====
// import React from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { Brain, Target, BookOpen, Users, Award, Zap } from 'lucide-react'

// const Home = () => {
//   const { user } = useAuth()

//   const features = [
//     {
//       icon: Brain,
//       title: "AI Career Agent",
//       description: "Get instant resume analysis and job matching with our AI-powered career assistant."
//     },
//     {
//       icon: Target,
//       title: "Learning Paths",
//       description: "Generate personalized learning paths tailored to your career goals and timeline."
//     },
//     {
//       icon: BookOpen,
//       title: "Smart Quizzes",
//       description: "Test your knowledge with AI-generated quizzes on any technical topic."
//     },
//     {
//       icon: Users,
//       title: "AI Tutor",
//       description: "Get instant answers to your technical questions from our AI tutor."
//     },
//     {
//       icon: Award,
//       title: "Portfolio Builder",
//       description: "Create stunning portfolios automatically from your resume and GitHub."
//     },
//     {
//       icon: Zap,
//       title: "Progress Tracking",
//       description: "Track your learning progress and productivity with detailed analytics."
//     }
//   ]

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-600 via-primary to-purple-600 text-white py-20">
//         <div className="container mx-auto px-4 text-center">
//           <h1 className="text-5xl md:text-6xl font-bold mb-6">
//             Master Skills with
//             <span className="block text-yellow-300">AI-Powered Learning</span>
//           </h1>
//           <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
//             Your complete AI-driven platform for skill development, career growth, 
//             and personalized learning experiences.
//           </p>
          
//           {user ? (
//             <Link to="/dashboard" className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
//               Go to Dashboard
//             </Link>
//           ) : (
//             <div className="space-x-4">
//               <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
//                 Get Started Free
//               </button>
//               <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors">
//                 Learn More
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">
//               Everything You Need to Succeed
//             </h2>
//             <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//               Comprehensive tools powered by cutting-edge AI to accelerate your learning journey
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="card hover:shadow-lg transition-shadow">
//                 <feature.icon className="h-12 w-12 text-primary mb-4" />
//                 <h3 className="text-xl font-semibold mb-3 text-gray-800">
//                   {feature.title}
//                 </h3>
//                 <p className="text-gray-600">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-16 bg-primary text-white">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-4 gap-8 text-center">
//             <div>
//               <div className="text-4xl font-bold mb-2">10,000+</div>
//               <div className="text-blue-100">Students Learning</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold mb-2">500+</div>
//               <div className="text-blue-100">Skills Covered</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold mb-2">95%</div>
//               <div className="text-blue-100">Success Rate</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold mb-2">24/7</div>
//               <div className="text-blue-100">AI Support</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-4xl font-bold text-gray-800 mb-6">
//             Ready to Transform Your Career?
//           </h2>
//           <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
//             Join thousands of professionals who are already accelerating their careers with SkillForge AI
//           </p>
//           <button className="btn-primary text-lg px-8 py-4">
//             Start Your Journey Today
//           </button>
//         </div>
//       </section>
//     </div>
//   )
// }

// export default Home
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-primary to-secondary text-white">
    <h1 className="text-5xl font-bold mb-4">SkillForge AI</h1>
    <p className="text-xl mb-8 max-w-xl text-center">
      Your AI-powered companion for resume analysis, personalized learning paths, quizzes, and more.
    </p>
    <div className="space-x-4">
      <Link to="/login" className="btn-primary px-6 py-3">Login</Link>
      <Link to="/signup" className="btn-primary px-6 py-3">Get Started</Link>
    </div>
  </div>
);

export default Home;
