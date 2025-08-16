// // ===== client/src/pages/Profile.jsx =====
// import React, { useState, useEffect } from 'react'
// import { useAuth } from '../hooks/useAuth'
// import { User, Settings, Bell, Shield, Save } from 'lucide-react'
// import { SKILL_CATEGORIES } from '../utils/constants'
// import toast from 'react-hot-toast'

// const Profile = () => {
//   const { user } = useAuth()
//   const [profile, setProfile] = useState({
//     skills: [],
//     experience: '',
//     education: '',
//     goals: [],
//     preferredDomains: []
//   })
//   const [settings, setSettings] = useState({
//     notifications: true,
//     theme: 'light'
//   })
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     // Load user profile data
//     loadProfile()
//   }, [])

//   const loadProfile = async () => {
//     try {
//       // API call to get profile data
//       // const response = await api.get('/auth/profile')
//       // setProfile(response.data.profile)
//       // setSettings(response.data.settings)
//     } catch (error) {
//       console.error('Error loading profile:', error)
//     }
//   }

//   const handleSaveProfile = async () => {
//     setLoading(true)
//     try {
//       // API call to save profile
//       // await api.put('/auth/profile', { profile, settings })
//       toast.success('Profile updated successfully!')
//     } catch (error) {
//       toast.error('Error updating profile')
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSkillToggle = (skill) => {
//     setProfile(prev => ({
//       ...prev,
//       skills: prev.skills.includes(skill)
//         ? prev.skills.filter(s => s !== skill)
//         : [...prev.skills, skill]
//     }))
//   }

//   const handleGoalChange = (index, value) => {
//     const newGoals = [...profile.goals]
//     newGoals[index] = value
//     setProfile(prev => ({ ...prev, goals: newGoals }))
//   }

//   const addGoal = () => {
//     setProfile(prev => ({ ...prev, goals: [...prev.goals, ''] }))
//   }

//   const removeGoal = (index) => {
//     setProfile(prev => ({
//       ...prev,
//       goals: prev.goals.filter((_, i) => i !== index)
//     }))
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
//           <User className="mr-3 h-10 w-10 text-primary" />
//           Profile & Settings
//         </h1>
//         <p className="text-xl text-gray-600">
//           Customize your learning experience and manage your account settings
//         </p>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-8">
//         {/* Profile Information */}
//         <div className="lg:col-span-2 space-y-8">
//           {/* Basic Info */}
//           <div className="card">
//             <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
//             <div className="flex items-center space-x-6 mb-6">
//               <img
//                 src={user?.photoURL || '/default-avatar.png'}
//                 alt="Profile"
//                 className="w-20 h-20 rounded-full border-4 border-gray-100"
//               />
//               <div>
//                 <h3 className="text-lg font-medium text-gray-800">{user?.displayName}</h3>
//                 <p className="text-gray-600">{user?.email}</p>
//                 <button className="mt-2 text-sm text-primary hover:underline">
//                   Change Profile Photo
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Skills */}
//           <div className="card">
//             <h2 className="text-xl font-semibold mb-6">Your Skills</h2>
//             <div className="space-y-4">
//               {SKILL_CATEGORIES.map((category) => (
//                 <div key={category}>
//                   <h3 className="font-medium text-gray-700 mb-2">{category}</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {/* This would be populated with actual skills from the category */}
//                     {['React', 'JavaScript', 'Node.js', 'Python', 'MongoDB'].map((skill) => (
//                       <button
//                         key={skill}
//                         onClick={() => handleSkillToggle(skill)}
//                         className={`px-3 py-1 rounded-full text-sm transition-colors ${
//                           profile.skills.includes(skill)
//                             ? 'bg-primary text-white'
//                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                         }`}
//                       >
//                         {skill}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Learning Goals */}
//           <div className="card">
//             <h2 className="text-xl font-semibold mb-6">Learning Goals</h2>
//             <div className="space-y-3">
//               {profile.goals.map((goal, index) => (
//                 <div key={index} className="flex items-center space-x-3">
//                   <input
//                     type="text"
//                     value={goal}
//                     onChange={(e) => handleGoalChange(index, e.target.value)}
//                     placeholder="Enter your learning goal"
//                     className="input-field flex-1"
//                   />
//                   <button
//                     onClick={() => removeGoal(index)}
//                     className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//               <button
//                 onClick={addGoal}
//                 className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
//               >
//                 + Add Learning Goal
//               </button>
//             </div>
//           </div>

//           {/* Experience & Education */}
//           <div className="card">
//             <h2 className="text-xl font-semibold mb-6">Background</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Experience Level
//                 </label>
//                 <select
//                   value={profile.experience}
//                   onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
//                   className="input-field"
//                 >
//                   <option value="">Select experience level</option>
//                   <option value="entry">Entry Level (0-2 years)</option>
//                   <option value="junior">Junior (2-4 years)</option>
//                   <option value="mid">Mid Level (4-7 years)</option>
//                   <option value="senior">Senior (7+ years)</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Education
//                 </label>
//                 <input
//                   type="text"
//                   value={profile.education}
//                   onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
//                   placeholder="e.g., Bachelor's in Computer Science"
//                   className="input-field"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Settings Sidebar */}
//         <div className="space-y-6">
//           {/* Account Settings */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4 flex items-center">
//               <Settings className="mr-2 h-5 w-5" />
//               Settings
//             </h3>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-700">Email Notifications</span>
//                 <input
//                   type="checkbox"
//                   checked={settings.notifications}
//                   onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
//                   className="h-4 w-4 text-primary"
//                 />
//               </div>
              
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-700">Theme</span>
//                 <select
//                   value={settings.theme}
//                   onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
//                   className="text-sm border rounded px-2 py-1"
//                 >
//                   <option value="light">Light</option>
//                   <option value="dark">Dark</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Account Actions */}
//           <div className="card">
//             <h3 className="text-lg font-semibold mb-4">Account</h3>
//             <div className="space-y-3">
//               <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-colors">
//                 Export Data
//               </button>
//               <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded transition-colors">
//                 Privacy Settings
//               </button>
//               <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded transition-colors">
//                 Delete Account
//               </button>
//             </div>
//           </div>

//           {/* Save Button */}
//           <button
//             onClick={handleSaveProfile}
//             disabled={loading}
//             className="btn-primary w-full flex items-center justify-center space-x-2"
//           >
//             <Save size={16} />
//             <span>{loading ? 'Saving...' : 'Save Changes'}</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Profile
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="card max-w-md mx-auto text-center">
      <User className="mx-auto h-16 w-16 text-primary mb-4"/>
      <h3 className="text-xl font-semibold">{user.displayName || user.email}</h3>
      <p className="text-gray-600">{user.email}</p>
      {/* Additional profile details */}
    </div>
  );
};

export default Profile;
