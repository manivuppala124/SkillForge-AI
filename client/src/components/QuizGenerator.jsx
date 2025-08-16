// // client/src/components/QuizGenerator.jsx

// import React, { useState, useEffect } from 'react';
// import { quizAPI } from '../services/api';
// import { SKILL_CATEGORIES, DIFFICULTY_LEVELS } from '../utils/constants';
// import toast from 'react-hot-toast';
// import { 
//   Brain, 
//   Clock, 
//   CheckCircle, 
//   ArrowRight, 
//   ArrowLeft, 
//   Trophy,
//   Target,
//   Zap,
//   BookOpen,
//   Award,
//   ChevronDown,
//   Play,
//   RotateCcw,
//   Timer,
//   Star
// } from 'lucide-react';

// const QuizGenerator = () => {
//   const [topic, setTopic] = useState('');
//   const [difficulty, setDifficulty] = useState('beginner');
//   const [quiz, setQuiz] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [currentQ, setCurrentQ] = useState(0);
//   const [score, setScore] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [quizStarted, setQuizStarted] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Timer effect
//   useEffect(() => {
//     if (timeLeft > 0 && quizStarted && score === null) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && score === null) {
//       submitQuiz();
//     }
//   }, [timeLeft, quizStarted, score]);

//   const generateQuiz = async () => {
//     if (!topic) {
//       toast.error('Please select a topic to continue');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await quizAPI.generate(topic, difficulty);
      
//       // Parse response based on actual backend structure
//       let payload = null;
//       if (res.data && res.data.success && res.data.data && res.data.data.quiz) {
//         payload = res.data.data.quiz;
//       }

//       if (!payload?.questions || !Array.isArray(payload.questions) || payload.questions.length === 0) {
//         throw new Error('No questions returned by API');
//       }

//       setQuiz(payload);
//       setAnswers({});
//       setCurrentQ(0);
//       setScore(null);
//       setQuizStarted(false);
//       setTimeLeft(payload.settings?.timeLimit * 60 || 1800); // Default 30 minutes
//       toast.success(`🎯 Quiz ready! ${payload.questions.length} questions generated.`);
      
//     } catch (err) {
//       console.error('❌ Error generating quiz:', err);
//       if (err.response?.status === 401) {
//         toast.error('Authentication failed. Please login again.');
//       } else {
//         toast.error('Failed to generate quiz. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const startQuiz = () => {
//     setQuizStarted(true);
//     toast.success('Quiz started! Good luck! 🚀');
//   };

//   const handleAnswer = (idx) => {
//     setAnswers({ ...answers, [currentQ]: idx });
//   };

//   const nextQuestion = () => {
//     if (currentQ < quiz.questions.length - 1) {
//       setCurrentQ(currentQ + 1);
//     }
//   };

//   const prevQuestion = () => {
//     if (currentQ > 0) {
//       setCurrentQ(currentQ - 1);
//     }
//   };

//   const submitQuiz = () => {
//     if (!quiz?.questions) return;
    
//     const correctCount = quiz.questions.reduce((acc, q, i) => {
//       const correctAnswer = q.correct_answer ?? q.correctAnswer ?? 0;
//       return acc + (answers[i] === correctAnswer ? 1 : 0);
//     }, 0);
    
//     const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
//     setScore(finalScore);
//     setQuizStarted(false);
    
//     // Success toast based on score
//     if (finalScore >= 90) {
//       toast.success('🏆 Outstanding performance!');
//     } else if (finalScore >= 70) {
//       toast.success('🎯 Great job!');
//     } else if (finalScore >= 50) {
//       toast('📚 Good effort! Keep learning!');
//     } else {
//       toast('💪 Don\'t give up! Practice makes perfect!');
//     }
//   };

//   const resetQuiz = () => {
//     setQuiz(null);
//     setScore(null);
//     setAnswers({});
//     setCurrentQ(0);
//     setQuizStarted(false);
//     setTimeLeft(null);
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getScoreColor = (score) => {
//     if (score >= 90) return 'text-green-600';
//     if (score >= 70) return 'text-blue-600';
//     if (score >= 50) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getDifficultyIcon = (diff) => {
//     switch (diff) {
//       case 'beginner': return <BookOpen className="w-4 h-4" />;
//       case 'intermediate': return <Target className="w-4 h-4" />;
//       case 'advanced': return <Zap className="w-4 h-4" />;
//       default: return <BookOpen className="w-4 h-4" />;
//     }
//   };

//   const getDifficultyColor = (diff) => {
//     switch (diff) {
//       case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
//       case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
//       case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
//       default: return 'bg-gray-100 text-gray-700 border-gray-200';
//     }
//   };

//   // Initial setup form
//   if (!quiz) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
//             <Brain className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Quiz Generator</h1>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Challenge yourself with AI-powered quizzes tailored to your skill level. 
//             Test your knowledge and track your progress.
//           </p>
//         </div>

//         {/* Quiz Setup Card */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-100">
//             <h2 className="text-xl font-semibold text-gray-900 flex items-center">
//               <Play className="w-5 h-5 mr-2 text-blue-600" />
//               Create Your Quiz
//             </h2>
//           </div>
          
//           <div className="p-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Topic Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Choose Topic
//                 </label>
//                 <div className="relative">
//                   <select
//                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-100"
//                     value={topic}
//                     onChange={(e) => setTopic(e.target.value)}
//                   >
//                     <option value="">Select a topic...</option>
//                     {SKILL_CATEGORIES.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Difficulty Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Difficulty Level
//                 </label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {DIFFICULTY_LEVELS.map((level) => (
//                     <button
//                       key={level.value}
//                       onClick={() => setDifficulty(level.value)}
//                       className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
//                         difficulty === level.value
//                           ? 'bg-blue-600 text-white border-blue-600 shadow-md'
//                           : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
//                       }`}
//                     >
//                       {getDifficultyIcon(level.value)}
//                       <span>{level.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Generate Button */}
//             <div className="mt-6">
//               <button
//                 onClick={generateQuiz}
//                 disabled={isLoading || !topic}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
//                     <span>Generating Quiz...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Zap className="w-5 h-5" />
//                     <span>Generate Quiz</span>
//                     <ArrowRight className="w-5 h-5" />
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Results view
//   if (score !== null) {
//     const scorePercentage = score;
//     const correctAnswers = Math.round((score / 100) * quiz.questions.length);
//     const totalQuestions = quiz.questions.length;
    
//     return (
//       <div className="max-w-2xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           {/* Results Header */}
//           <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-8 text-center border-b border-gray-100">
//             <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
//               {scorePercentage >= 70 ? (
//                 <Trophy className="w-10 h-10 text-white" />
//               ) : (
//                 <Target className="w-10 h-10 text-white" />
//               )}
//             </div>
            
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
//             <p className="text-gray-600">Here's how you performed</p>
//           </div>

//           {/* Score Display */}
//           <div className="p-6">
//             <div className="text-center mb-6">
//               <div className={`text-6xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
//                 {scorePercentage}%
//               </div>
//               <div className="text-gray-600">
//                 {correctAnswers} out of {totalQuestions} questions correct
//               </div>
//             </div>

//             {/* Performance Breakdown */}
//             <div className="grid grid-cols-3 gap-4 mb-6">
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
//                 <div className="text-sm text-gray-600">Questions</div>
//               </div>
//               <div className="text-center p-4 bg-green-50 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
//                 <div className="text-sm text-gray-600">Correct</div>
//               </div>
//               <div className="text-center p-4 bg-red-50 rounded-lg">
//                 <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
//                 <div className="text-sm text-gray-600">Incorrect</div>
//               </div>
//             </div>

//             {/* Quiz Info */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-6">
//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center space-x-2">
//                   <BookOpen className="w-4 h-4 text-gray-500" />
//                   <span className="text-gray-600">Topic:</span>
//                   <span className="font-medium text-gray-900">{quiz.topic}</span>
//                 </div>
//                 <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getDifficultyColor(quiz.difficulty)}`}>
//                   {getDifficultyIcon(quiz.difficulty)}
//                   <span className="capitalize">{quiz.difficulty}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex space-x-3">
//               <button
//                 onClick={resetQuiz}
//                 className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-200 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
//               >
//                 <RotateCcw className="w-4 h-4" />
//                 <span>Try Another Quiz</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Quiz preview (before starting)
//   if (!quizStarted) {
//     return (
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           {/* Quiz Header */}
//           <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-6 border-b border-gray-100">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
//                 <div className="flex items-center space-x-4 text-sm text-gray-600">
//                   <div className="flex items-center space-x-1">
//                     <BookOpen className="w-4 h-4" />
//                     <span>{quiz.topic}</span>
//                   </div>
//                   <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
//                     {getDifficultyIcon(quiz.difficulty)}
//                     <span className="capitalize">{quiz.difficulty}</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-2xl font-bold text-gray-900">{quiz.questions.length}</div>
//                 <div className="text-sm text-gray-600">Questions</div>
//               </div>
//             </div>
//           </div>

//           {/* Quiz Info */}
//           <div className="p-6">
//             <div className="grid md:grid-cols-3 gap-4 mb-6">
//               <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
//                 <Clock className="w-8 h-8 text-blue-600" />
//                 <div>
//                   <div className="font-semibold text-gray-900">Time Limit</div>
//                   <div className="text-sm text-gray-600">{formatTime(timeLeft)} minutes</div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
//                 <Target className="w-8 h-8 text-green-600" />
//                 <div>
//                   <div className="font-semibold text-gray-900">Passing Score</div>
//                   <div className="text-sm text-gray-600">{quiz.settings?.passingScore || 70}%</div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
//                 <Award className="w-8 h-8 text-purple-600" />
//                 <div>
//                   <div className="font-semibold text-gray-900">Total Points</div>
//                   <div className="text-sm text-gray-600">{quiz.totalPoints}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Instructions */}
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//               <h3 className="font-semibold text-yellow-800 mb-2">📝 Quiz Instructions</h3>
//               <ul className="text-sm text-yellow-700 space-y-1">
//                 <li>• Read each question carefully before selecting your answer</li>
//                 <li>• You can navigate between questions using the Previous/Next buttons</li>
//                 <li>• Your progress is saved automatically</li>
//                 <li>• Submit when you're ready or when time runs out</li>
//               </ul>
//             </div>

//             {/* Start Button */}
//             <button
//               onClick={startQuiz}
//               className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
//             >
//               <Play className="w-5 h-5" />
//               <span>Start Quiz</span>
//               <ArrowRight className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Quiz questions view
//   const question = quiz.questions?.[currentQ];
//   const progress = ((currentQ + 1) / quiz.questions.length) * 100;
//   const answered = Object.keys(answers).length;

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Timer and Progress Bar */}
//       <div className="bg-white rounded-t-2xl shadow-lg border border-gray-100 px-6 py-4">
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <Timer className="w-5 h-5 text-blue-600" />
//             <span className="font-medium text-gray-900">
//               Time Left: <span className={timeLeft < 300 ? 'text-red-600' : 'text-green-600'}>{formatTime(timeLeft)}</span>
//             </span>
//           </div>
//           <div className="text-sm text-gray-600">
//             Question {currentQ + 1} of {quiz.questions.length}
//           </div>
//         </div>
        
//         <div className="w-full bg-gray-200 rounded-full h-2">
//           <div 
//             className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Question Card */}
//       <div className="bg-white shadow-lg border-x border-gray-100 px-6 py-8">
//         <div className="mb-6">
//           <div className="flex items-start justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
//               {question.question}
//             </h3>
//             <div className="flex items-center space-x-1 text-sm text-gray-500 ml-4">
//               <Star className="w-4 h-4" />
//               <span>{question.points} pt</span>
//             </div>
//           </div>
//         </div>

//         {/* Answer Options */}
//         <div className="space-y-3">
//           {question.options?.map((option, idx) => (
//             <label
//               key={idx}
//               className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
//                 answers[currentQ] === idx
//                   ? 'border-blue-500 bg-blue-50 shadow-md'
//                   : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//               }`}
//             >
//               <input
//                 type="radio"
//                 name={`question-${currentQ}`}
//                 className="hidden"
//                 checked={answers[currentQ] === idx}
//                 onChange={() => handleAnswer(idx)}
//               />
//               <div className="flex items-center space-x-3">
//                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
//                   answers[currentQ] === idx
//                     ? 'border-blue-500 bg-blue-500'
//                     : 'border-gray-300'
//                 }`}>
//                   {answers[currentQ] === idx && (
//                     <div className="w-2 h-2 bg-white rounded-full"></div>
//                   )}
//                 </div>
//                 <span className={`font-medium ${
//                   answers[currentQ] === idx ? 'text-blue-900' : 'text-gray-700'
//                 }`}>
//                   {String.fromCharCode(65 + idx)}.
//                 </span>
//                 <span className={answers[currentQ] === idx ? 'text-blue-900' : 'text-gray-700'}>
//                   {option}
//                 </span>
//               </div>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white rounded-b-2xl shadow-lg border border-gray-100 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <button
//             onClick={prevQuestion}
//             disabled={currentQ === 0}
//             className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             <span>Previous</span>
//           </button>

//           <div className="flex items-center space-x-4 text-sm text-gray-600">
//             <span>{answered}/{quiz.questions.length} answered</span>
//             <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
//             <span className="flex items-center space-x-1">
//               <CheckCircle className="w-4 h-4 text-green-500" />
//               <span>Auto-saved</span>
//             </span>
//           </div>

//           {currentQ === quiz.questions.length - 1 ? (
//             <button
//               onClick={submitQuiz}
//               className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//             >
//               <CheckCircle className="w-4 h-4" />
//               <span>Submit Quiz</span>
//             </button>
//           ) : (
//             <button
//               onClick={nextQuestion}
//               className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//             >
//               <span>Next</span>
//               <ArrowRight className="w-4 h-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Progress Summary */}
//       <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
//         <div className="flex items-center justify-center space-x-8 text-sm">
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//             <span className="text-gray-600">Current</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//             <span className="text-gray-600">Answered ({answered})</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
//             <span className="text-gray-600">Remaining ({quiz.questions.length - answered})</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuizGenerator;
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trophy,
  Target,
  Zap,
  BookOpen,
  Award,
  ChevronDown,
  Play,
  RotateCcw,
  Timer,
  Star,
  Sparkles,
  TrendingUp,
  Filter,
  BarChart3,
  Calendar,
  Settings,
  RefreshCw,
  CheckSquare,
  XCircle
} from 'lucide-react';

// Mock API for demo
const mockQuizAPI = {
  generate: async (topic, difficulty) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockQuestions = [
      {
        question_id: "q1",
        question: `What is the fundamental principle of ${topic} at ${difficulty} level?`,
        options: [
          `Core ${topic} concept`,
          "Incorrect option A",
          "Incorrect option B", 
          "Incorrect option C"
        ],
        correct_answer: 0,
        explanation: `This represents the fundamental principle of ${topic} at ${difficulty} level.`,
        points: difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3,
        tags: [topic.toLowerCase(), difficulty]
      },
      {
        question_id: "q2", 
        question: `Which best practice applies to ${topic} development?`,
        options: [
          "Follow outdated methods",
          `Modern ${topic} best practices`,
          "Ignore documentation",
          "Skip testing phases"
        ],
        correct_answer: 1,
        explanation: `Modern best practices are essential for effective ${topic} development.`,
        points: difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3,
        tags: [topic.toLowerCase(), difficulty]
      },
      {
        question_id: "q3",
        question: `How does ${topic} solve real-world problems?`,
        options: [
          "It doesn't solve problems",
          "Only for theoretical use",
          `Provides practical solutions in ${topic}`,
          "Creates more complexity"
        ],
        correct_answer: 2,
        explanation: `${topic} provides practical, real-world solutions for various challenges.`,
        points: difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3,
        tags: [topic.toLowerCase(), difficulty]
      }
    ];

    return {
      data: {
        success: true,
        data: {
          quiz: {
            title: `${topic} - ${difficulty} Level Quiz`,
            topic: topic,
            difficulty: difficulty,
            questions: mockQuestions,
            settings: {
              timeLimit: mockQuestions.length * (difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 4),
              passingScore: difficulty === 'beginner' ? 70 : difficulty === 'intermediate' ? 75 : 80,
              shuffleQuestions: true,
              showCorrectAnswers: true,
              allowRetakes: true
            },
            totalQuestions: mockQuestions.length,
            totalPoints: mockQuestions.reduce((sum, q) => sum + q.points, 0)
          }
        }
      }
    };
  }
};

// Mock constants
const SKILL_CATEGORIES = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Mobile Development'
];

const DIFFICULTY_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
];

const QuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const progressRef = useRef(null);

  // Enhanced timer effect with warning states
  useEffect(() => {
    if (timeLeft > 0 && quizStarted && score === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && score === null) {
      submitQuiz();
    }
  }, [timeLeft, quizStarted, score]);

  // Auto-scroll to current question
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQ]);

  const generateQuiz = async () => {
    if (!topic) {
      // toast.error would be here in real implementation
      alert('Please select a topic to continue');
      return;
    }

    setIsLoading(true);
    try {
      const res = await mockQuizAPI.generate(topic, difficulty);
      
      let payload = null;
      if (res.data && res.data.success && res.data.data && res.data.data.quiz) {
        payload = res.data.data.quiz;
      }

      if (!payload?.questions || !Array.isArray(payload.questions) || payload.questions.length === 0) {
        throw new Error('No questions returned by API');
      }

      setQuiz(payload);
      setAnswers({});
      setCurrentQ(0);
      setScore(null);
      setQuizStarted(false);
      setTimeLeft(payload.settings?.timeLimit * 60 || 1800);
      
    } catch (err) {
      console.error('❌ Error generating quiz:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswer = (idx) => {
    setAnswers({ ...answers, [currentQ]: idx });
  };

  const nextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const submitQuiz = () => {
    if (!quiz?.questions) return;
    
    const correctCount = quiz.questions.reduce((acc, q, i) => {
      const correctAnswer = q.correct_answer ?? q.correctAnswer ?? 0;
      return acc + (answers[i] === correctAnswer ? 1 : 0);
    }, 0);
    
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(finalScore);
    setQuizStarted(false);
  };

  const resetQuiz = () => {
    setQuiz(null);
    setScore(null);
    setAnswers({});
    setCurrentQ(0);
    setQuizStarted(false);
    setTimeLeft(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-emerald-500 to-green-500';
    if (score >= 70) return 'from-blue-500 to-indigo-500';
    if (score >= 50) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getDifficultyIcon = (diff) => {
    switch (diff) {
      case 'beginner': return <BookOpen className="w-4 h-4" />;
      case 'intermediate': return <Target className="w-4 h-4" />;
      case 'advanced': return <Zap className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTimeWarningColor = () => {
    if (timeLeft <= 300) return 'text-red-600 animate-pulse';
    if (timeLeft <= 600) return 'text-amber-600';
    return 'text-emerald-600';
  };

  // Initial setup form
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Animated Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-2xl animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                AI Quiz Generator
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Challenge yourself with AI-powered quizzes tailored to your expertise level. 
                <span className="text-blue-600 font-semibold"> Test your knowledge</span> and 
                <span className="text-purple-600 font-semibold"> track your progress</span>.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Topics Available', value: '50+', icon: BookOpen, color: 'from-emerald-500 to-green-500' },
              { label: 'Difficulty Levels', value: '3', icon: Target, color: 'from-blue-500 to-indigo-500' },
              { label: 'AI Generated', value: '100%', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
              { label: 'Success Rate', value: '95%', icon: TrendingUp, color: 'from-amber-500 to-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Quiz Setup Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Play className="w-6 h-6 mr-3 text-blue-600" />
                    Create Your Quiz
                  </h2>
                  <p className="text-gray-600 mt-1">Customize your learning experience</p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/50 hover:bg-white/80 rounded-xl transition-all duration-200"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Options</span>
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Topic Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Choose Your Topic
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer transition-all duration-300 hover:shadow-md text-lg group-hover:border-blue-300"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    >
                      <option value="">Select a topic...</option>
                      {SKILL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors duration-200" />
                  </div>
                  {topic && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span>Topic selected: {topic}</span>
                    </div>
                  )}
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-4">
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setDifficulty(level.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-300 flex flex-col items-center space-y-2 hover:scale-105 ${
                          difficulty === level.value
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {getDifficultyIcon(level.value)}
                          <span>{level.label}</span>
                        </div>
                        <div className={`text-xs ${difficulty === level.value ? 'text-blue-100' : 'text-gray-500'}`}>
                          {level.value === 'beginner' && '⭐ Easy Start'}
                          {level.value === 'intermediate' && '⭐⭐ Balanced'}
                          {level.value === 'advanced' && '⭐⭐⭐ Expert'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              {showFilters && (
                <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Advanced Options
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>5 Questions</option>
                        <option selected>10 Questions</option>
                        <option>15 Questions</option>
                        <option>20 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>15 minutes</option>
                        <option selected>30 minutes</option>
                        <option>45 minutes</option>
                        <option>60 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-8">
                <button
                  onClick={generateQuiz}
                  disabled={isLoading || !topic}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-blue-500/25 hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                      <span>Generating Your Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Generate AI Quiz</span>
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
                
                {!topic && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Please select a topic to continue
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: 'AI-Powered Questions',
                description: 'Dynamic questions generated based on current industry standards',
                icon: Brain,
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Adaptive Difficulty',
                description: 'Questions adapt to your selected expertise level',
                icon: Target,
                color: 'from-blue-500 to-indigo-500'
              },
              {
                title: 'Instant Feedback',
                description: 'Get detailed explanations for every answer',
                icon: Zap,
                color: 'from-emerald-500 to-green-500'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 group">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (score !== null) {
    const scorePercentage = score;
    const correctAnswers = Math.round((score / 100) * quiz.questions.length);
    const totalQuestions = quiz.questions.length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Results Header */}
            <div className={`bg-gradient-to-r ${getScoreGradient(scorePercentage)}/10 px-8 py-12 text-center border-b border-gray-100 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              <div className="relative">
                <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r ${getScoreGradient(scorePercentage)} rounded-full mb-6 shadow-2xl animate-bounce`}>
                  {scorePercentage >= 70 ? (
                    <Trophy className="w-12 h-12 text-white" />
                  ) : (
                    <Target className="w-12 h-12 text-white" />
                  )}
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Quiz Complete!</h2>
                <p className="text-xl text-gray-600">Outstanding performance on {quiz.topic}</p>
              </div>
            </div>

            {/* Score Display */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`text-8xl font-bold mb-4 bg-gradient-to-r ${getScoreGradient(scorePercentage)} bg-clip-text text-transparent`}>
                  {scorePercentage}%
                </div>
                <div className="text-xl text-gray-600 mb-6">
                  {correctAnswers} out of {totalQuestions} questions correct
                </div>
                
                {/* Score Badge */}
                <div className={`inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${getScoreGradient(scorePercentage)} text-white rounded-full text-lg font-semibold shadow-lg`}>
                  {scorePercentage >= 90 && (
                    <>
                      <Award className="w-5 h-5" />
                      <span>Excellent!</span>
                    </>
                  )}
                  {scorePercentage >= 70 && scorePercentage < 90 && (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Great Job!</span>
                    </>
                  )}
                  {scorePercentage >= 50 && scorePercentage < 70 && (
                    <>
                      <Target className="w-5 h-5" />
                      <span>Good Effort!</span>
                    </>
                  )}
                  {scorePercentage < 50 && (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Keep Learning!</span>
                    </>
                  )}
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{totalQuestions}</div>
                  <div className="text-gray-600 flex items-center justify-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Total Questions</span>
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{correctAnswers}</div>
                  <div className="text-gray-600 flex items-center justify-center space-x-1">
                    <CheckSquare className="w-4 h-4" />
                    <span>Correct Answers</span>
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">{totalQuestions - correctAnswers}</div>
                  <div className="text-gray-600 flex items-center justify-center space-x-1">
                    <XCircle className="w-4 h-4" />
                    <span>Incorrect</span>
                  </div>
                </div>
              </div>

              {/* Quiz Info Card */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">Topic:</span>
                      <span className="font-bold text-gray-900">{quiz.topic}</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm border ${getDifficultyColor(quiz.difficulty)}`}>
                      {getDifficultyIcon(quiz.difficulty)}
                      <span className="capitalize font-medium">{quiz.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Points Earned</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((scorePercentage / 100) * quiz.totalPoints)}/{quiz.totalPoints}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Performance</span>
                  <span className="text-sm font-bold text-gray-900">{scorePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 bg-gradient-to-r ${getScoreGradient(scorePercentage)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={resetQuiz}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Another Quiz</span>
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-all duration-300 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz preview (before starting)
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Quiz Header */}
            <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 px-8 py-8 border-b border-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{quiz.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-lg">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{quiz.topic}</span>
                      </div>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                        {getDifficultyIcon(quiz.difficulty)}
                        <span className="capitalize font-medium">{quiz.difficulty}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <span>{formatTime(timeLeft)} time limit</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                    <div className="text-4xl font-bold text-gray-900 mb-1">{quiz.questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Statistics */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  {
                    icon: Clock,
                    title: 'Time Limit',
                    value: `${formatTime(timeLeft)}`,
                    subtitle: 'Total duration',
                    color: 'from-blue-500 to-indigo-500',
                    bgColor: 'from-blue-50 to-indigo-50'
                  },
                  {
                    icon: Target,
                    title: 'Passing Score',
                    value: `${quiz.settings?.passingScore || 70}%`,
                    subtitle: 'Required to pass',
                    color: 'from-emerald-500 to-green-500',
                    bgColor: 'from-emerald-50 to-green-50'
                  },
                  {
                    icon: Award,
                    title: 'Total Points',
                    value: quiz.totalPoints,
                    subtitle: 'Maximum possible',
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'from-purple-50 to-pink-50'
                  },
                  {
                    icon: Star,
                    title: 'Questions',
                    value: quiz.questions.length,
                    subtitle: 'AI generated',
                    color: 'from-amber-500 to-orange-500',
                    bgColor: 'from-amber-50 to-orange-50'
                  }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.subtitle}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-amber-900 text-lg mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  📝 Quiz Instructions
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                      <span className="text-sm">Read each question carefully before selecting</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                      <span className="text-sm">Navigate between questions using Previous/Next</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-amber-800">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                      <span className="text-sm">Your progress is automatically saved</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
                      <span className="text-sm">Submit when ready or when time expires</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={startQuiz}
                  className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white px-12 py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 mx-auto transition-all duration-300 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 group"
                >
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Start Quiz</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <p className="text-gray-600 mt-4 text-lg">Good luck! 🚀</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz questions view
  const question = quiz.questions?.[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  // Completing the remaining part of QuizGenerator.jsx

const answeredCount = Object.keys(answers).length;

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
          <p className="text-lg text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Quiz Header with Timer */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                {getDifficultyIcon(quiz.difficulty)}
                <span className="capitalize font-medium text-sm">{quiz.difficulty}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 ${getTimeWarningColor()}`}>
                <Timer className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-bold text-gray-900">
                  {currentQ + 1}/{quiz.questions.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Started</span>
              <span>{Math.round(progress)}% Complete</span>
              <span>Finish</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden" ref={progressRef}>
          {/* Question Header */}
          <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 px-8 py-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-sm">
                    {currentQ + 1}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    Question {currentQ + 1} of {quiz.questions.length}
                  </span>
                  {answers[currentQ] !== undefined && (
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Answered</span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {question.question}
                </h3>
              </div>
              <div className="text-right bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="text-2xl font-bold text-purple-600">{question.points}</div>
                <div className="text-xs text-gray-600">points</div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-8">
            <div className="space-y-4 mb-8">
              {question.options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 hover:shadow-lg group ${
                    answers[currentQ] === idx
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-gray-200 hover:border-blue-300 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold transition-all duration-300 ${
                      answers[currentQ] === idx
                        ? 'bg-white text-blue-600 border-white'
                        : 'border-gray-400 text-gray-400 group-hover:border-blue-500 group-hover:text-blue-500'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium flex-1">{option}</span>
                    {answers[currentQ] === idx && (
                      <CheckCircle className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Question Info */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-8 border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Topic: <span className="font-semibold text-gray-900">{quiz.topic}</span></span>
                  <span className="text-gray-600">Points: <span className="font-semibold text-purple-600">{question.points}</span></span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>Answered: <span className="font-semibold text-gray-900">{answeredCount}/{quiz.questions.length}</span></span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQ === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                {/* Question Navigator */}
                <div className="hidden md:flex items-center space-x-2">
                  {quiz.questions.slice(0, 10).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQ(idx)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
                        idx === currentQ
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                          : answers[idx] !== undefined
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  {quiz.questions.length > 10 && (
                    <span className="text-gray-500 px-2">...</span>
                  )}
                </div>

                {currentQ === quiz.questions.length - 1 ? (
                  <button
                    onClick={submitQuiz}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold transition-all duration-300 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Submit Quiz</span>
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all duration-300 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Answered: <span className="font-semibold">{answeredCount}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-gray-600">Remaining: <span className="font-semibold">{quiz.questions.length - answeredCount}</span></span>
              </div>
            </div>
            <div className="text-gray-600">
              Time per question: <span className="font-semibold">{Math.round(timeLeft / (quiz.questions.length - currentQ))}s avg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;