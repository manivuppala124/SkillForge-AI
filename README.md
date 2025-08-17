# 🚀 SkillForge AI

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B35?style=for-the-badge&logo=openai&logoColor=white)](https://perplexity.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **🎯 Revolutionizing skill development through AI-powered personalized learning experiences**

SkillForge AI is a comprehensive full-stack learning platform that leverages artificial intelligence to transform how professionals develop their skills. From intelligent resume analysis to personalized learning paths and AI-powered tutoring, SkillForge AI provides a complete ecosystem for career advancement and skill mastery.

## ✨ Key Features

### 📄 **Smart Resume Analysis**
- 🔍 **PDF Text Extraction**: Advanced parsing of resume documents with high accuracy
- 🧠 **AI-Powered Skills Detection**: Intelligent identification of technical and soft skills
- 📊 **Gap Analysis**: Comprehensive skill gap identification with industry benchmarks
- 💡 **Personalized Recommendations**: AI-generated suggestions for skill improvement

### 🧪 **AI Quiz Generation**
- 📝 **Dynamic Quiz Creation**: Generate topic-specific quizzes with varying difficulty levels
- 🎚️ **Adaptive Difficulty**: Smart difficulty adjustment based on performance
- 📈 **Progress Tracking**: Detailed analytics on quiz attempts and improvement trends
- 🏆 **Achievement System**: Gamified learning experience with badges and milestones

### 🛤️ **Personalized Learning Paths**
- 🎯 **Goal-Based Curriculum**: Tailored learning modules based on career objectives
- 📚 **Structured Modules**: Well-organized content with clear learning outcomes
- 🔄 **Adaptive Pathways**: Dynamic adjustment of learning sequence based on progress
- 📅 **Timeline Management**: Realistic scheduling with milestone tracking

### 🤖 **AI Tutor Chat**
- 💬 **Context-Aware Assistance**: Intelligent responses based on learning context
- 🔍 **Real-Time Help**: Instant answers to learning-related questions
- 📖 **Concept Explanation**: Detailed explanations with examples and analogies
- 💡 **Learning Tips**: Personalized study strategies and best practices

### 📊 **Comprehensive Analytics**
- 📈 **Progress Dashboard**: Visual representation of learning journey
- 🎯 **Performance Metrics**: Detailed statistics on strengths and improvement areas
- 📉 **Learning Velocity**: Tracking of learning speed and retention rates
- 🏅 **Achievement History**: Complete record of completed modules and certifications

### 🔐 **Secure Authentication**
- 🔑 **Firebase Integration**: Robust authentication with multiple providers
- 📱 **Multi-Modal Login**: Email/password, Google OAuth, and phone OTP
- 🛡️ **Rate Limiting**: Advanced security measures against abuse
- 👤 **User Management**: Comprehensive profile and preference management

## 🏗️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library with hooks and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router** - Declarative routing for React applications
- **Axios** - Promise-based HTTP client with interceptors
- **React Hot Toast** - Elegant toast notifications
- **Lucide React** - Beautiful and consistent icon library

### **Backend**
- **Node.js & Express.js** - Scalable server-side JavaScript runtime
- **MongoDB & Mongoose** - NoSQL database with elegant ODM
- **Firebase Admin SDK** - Server-side authentication and management
- **Multer** - Middleware for handling multipart/form-data
- **Express Rate Limit** - Rate limiting middleware for API protection

### **AI Core**
- **Python FastAPI** - High-performance async web framework
- **Perplexity AI API** - Advanced AI model integration
- **PDF Parsing Libraries** - Robust document text extraction
- **Machine Learning Pipeline** - Custom AI processing workflows

### **Infrastructure**
- **MongoDB Atlas** - Cloud-native database solution
- **Firebase Authentication** - Secure user management
- **Local File Storage** - Cost-effective file handling with Multer

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │         React 18 + Vite + Tailwind CSS                     ││
│  │    (Components, Hooks, Context, Router)                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Node.js + Express.js                          ││
│  │     (Authentication, Rate Limiting, Validation)            ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────┬───────────────────────────┬─────────────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│     SERVICE LAYER       │    │        AI CORE LAYER            │
│ ┌─────────────────────┐ │    │ ┌─────────────────────────────┐ │
│ │   User Service      │ │    │ │     Python FastAPI          │ │
│ │   Quiz Service      │ │    │ │  (AI Processing Pipeline)   │ │
│ │   Learning Service  │ │    │ │                             │ │
│ │   Analytics Service │ │    │ │ • Resume Analysis           │ │
│ └─────────────────────┘ │    │ │ • Quiz Generation           │ │
└─────────────┬───────────┘    │ │ • Learning Path Creation    │ │
              │                │ │ • AI Tutoring               │ │
              ▼                │ └─────────────────────────────┘ │
┌─────────────────────────┐    └─────────────┬───────────────────┘
│      DATA LAYER         │                  │
│ ┌─────────────────────┐ │                  ▼
│ │   MongoDB Atlas     │ │    ┌─────────────────────────────────┐
│ │                     │ │    │       EXTERNAL APIs             │
│ │ • User Profiles     │ │    │ ┌─────────────────────────────┐ │
│ │ • Resumes           │ │    │ │      Perplexity AI          │ │
│ │ • Quizzes           │ │    │ │   (GPT-4, Claude, etc.)     │ │
│ │ • Learning Paths    │ │    │ └─────────────────────────────┘ │
│ │ • Progress Data     │ │    └─────────────────────────────────┘
│ └─────────────────────┘ │
└─────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **Python** (v3.8+ recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/manivuppala124/SkillForge-AI.git
cd SkillForge-AI
```

#### 2. Backend Setup (Node.js API)
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Configure your environment variables (see Environment Variables section)

# Start the backend server
npm run dev
# Server will run on http://localhost:5000
```

#### 3. AI Core Setup (Python FastAPI)
```bash
cd ../ai-core
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Configure your AI service environment variables

# Start the AI core service
uvicorn main:app --reload --port 8000
# AI service will run on http://localhost:8000
```

#### 4. Frontend Setup (React)
```bash
cd ../client
npm install

# Create environment file
cp .env.example .env
# Configure your frontend environment variables

# Start the development server
npm run dev
# Frontend will run on http://localhost:5173
```

### Environment Variables

#### **Backend (.env)**
```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string
DB_NAME=skillforge_ai

# Firebase
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PROJECT_ID=your-project-id

# API Configuration
PORT=5000
NODE_ENV=development
AI_CORE_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **AI Core (.env)**
```env
# AI Services
PERPLEXITY_API_KEY=your-perplexity-api-key
MODEL_NAME=mixtral-8x7b-instruct

# Service Configuration
PYTHON_ENV=development
LOG_LEVEL=INFO
MAX_WORKERS=4
```

#### **Frontend (.env)**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=SkillForge AI
```

## 📚 API Documentation

### Authentication Endpoints

#### **POST** `/api/auth/verify-token`
Verify Firebase authentication token
```json
{
  "token": "firebase-id-token"
}
```

### Resume Analysis Endpoints

#### **POST** `/api/resumes/upload`
Upload and analyze resume
```bash
curl -X POST \
  http://localhost:5000/api/resumes/upload \
  -H 'Authorization: Bearer <token>' \
  -F 'resume=@path/to/resume.pdf'
```

#### **GET** `/api/resumes/analysis/:resumeId`
Get resume analysis results
```json
{
  "resumeId": "resume-uuid",
  "analysis": {
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "2-3 years",
    "recommendations": ["Learn TypeScript", "Improve system design"]
  }
}
```

### Quiz Endpoints

#### **POST** `/api/quizzes/generate`
Generate AI quiz for specific topic
```json
{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "questionCount": 10
}
```

#### **POST** `/api/quizzes/submit`
Submit quiz answers and get results
```json
{
  "quizId": "quiz-uuid",
  "answers": [0, 1, 2, 0, 3],
  "timeSpent": 1200
}
```

### Learning Path Endpoints

#### **POST** `/api/learning-paths/generate`
Generate personalized learning path
```json
{
  "skills": ["JavaScript", "React"],
  "goals": ["Full-stack development"],
  "timeframe": "3 months",
  "currentLevel": "intermediate"
}
```

#### **GET** `/api/learning-paths/user`
Get user's learning paths
```json
{
  "paths": [
    {
      "id": "path-uuid",
      "title": "Full-stack JavaScript Developer",
      "modules": [...],
      "progress": 45
    }
  ]
}
```

### AI Tutor Endpoints

#### **POST** `/api/tutor/chat`
Send message to AI tutor
```json
{
  "message": "Explain React useEffect hook",
  "context": {
    "currentTopic": "React Hooks",
    "userLevel": "beginner"
  }
}
```

## 🎯 Usage Examples

### Resume Analysis Flow
```javascript
// Upload resume
const formData = new FormData();
formData.append('resume', resumeFile);

const response = await axios.post('/api/resumes/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});

// Get analysis results
const analysis = await axios.get(`/api/resumes/analysis/${response.data.resumeId}`);
console.log('Skills found:', analysis.data.skills);
```

### Quiz Generation and Submission
```javascript
// Generate quiz
const quiz = await axios.post('/api/quizzes/generate', {
  topic: 'JavaScript ES6',
  difficulty: 'intermediate',
  questionCount: 15
});

// Submit answers
const results = await axios.post('/api/quizzes/submit', {
  quizId: quiz.data.id,
  answers: userAnswers,
  timeSpent: completionTime
});

console.log('Score:', results.data.score);
console.log('Feedback:', results.data.feedback);
```

### AI Tutor Interaction
```javascript
// Chat with AI tutor
const response = await axios.post('/api/tutor/chat', {
  message: 'How do I optimize React component performance?',
  context: {
    currentTopic: 'React Performance',
    userLevel: 'intermediate',
    previousQuestions: ['What is React.memo?']
  }
});

console.log('AI Response:', response.data.message);
console.log('Suggested Resources:', response.data.resources);
```

## 📱 Screenshots

### Dashboard Overview
*[Screenshot of main dashboard with learning progress, recent activities, and quick actions]*

![Dashboard](./docs/screenshots/dashboard.png)

### Resume Analysis Results
*[Screenshot showing resume analysis with skills detection, gaps, and recommendations]*

![Resume Analysis](./docs/screenshots/resume-analysis.png)

### AI-Generated Quiz Interface
*[Screenshot of quiz interface with questions, timer, and progress indicator]*

![Quiz Interface](./docs/screenshots/quiz-interface.png)

### Personalized Learning Path
*[Screenshot of learning path with modules, progress tracking, and milestones]*

![Learning Path](./docs/screenshots/learning-path.png)

### AI Tutor Chat
*[Screenshot of chat interface with AI tutor responses and suggested actions]*

![AI Tutor](./docs/screenshots/ai-tutor.png)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
   ```bash
   git fork https://github.com/manivuppala124/SkillForge-AI.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature: brief description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Code Style Guidelines

- **Frontend**: Use Prettier for code formatting, ESLint for linting
- **Backend**: Follow Node.js best practices, use consistent naming conventions
- **AI Core**: Follow PEP 8 for Python code style
- **Git**: Use conventional commit messages

### Areas for Contribution

- 🔧 **Feature Development**: Add new learning modules or AI capabilities
- 🐛 **Bug Fixes**: Help identify and fix issues
- 📚 **Documentation**: Improve README, API docs, or code comments
- 🧪 **Testing**: Increase test coverage and add integration tests
- 🎨 **UI/UX**: Enhance user interface and experience
- 🚀 **Performance**: Optimize application performance and scalability

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Resume analysis and skill extraction
- [x] AI quiz generation and evaluation
- [x] Basic learning path creation
- [x] User authentication and management

### Phase 2: Enhanced AI Features 🔄
- [ ] Advanced AI tutoring with conversation memory
- [ ] Skill recommendation engine improvements
- [ ] Adaptive learning difficulty adjustment
- [ ] Multi-language support for content

### Phase 3: Community Features 🔮
- [ ] Peer learning and study groups
- [ ] Mentor matching system
- [ ] Community-driven content creation
- [ ] Achievement and certification system

### Phase 4: Advanced Analytics 🔮
- [ ] Predictive career path modeling
- [ ] Industry trend analysis and recommendations
- [ ] Advanced progress analytics and insights
- [ ] Integration with job market data

### Phase 5: Enterprise Features 🔮
- [ ] Team and organization management
- [ ] Custom learning content creation
- [ ] Advanced reporting and analytics
- [ ] API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

```
MIT License

Copyright (c) 2024 Mani Vuppala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 👨‍💻 Author & Contact

**Mani Vuppala**
- 🌐 **GitHub**: [@manivuppala124](https://github.com/manivuppala124)
- 📧 **Email**: [your.email@example.com](mailto:manikantavuppala124@gmail.com)
- 💼 **LinkedIn**: [Your LinkedIn Profile](https://www.linkedin.com/in/vuppala-manikanta)

## 🙏 Acknowledgments

- **Perplexity AI** for providing the AI API that powers our intelligent features
- **Firebase** for robust authentication and real-time database capabilities
- **MongoDB Atlas** for scalable and reliable data storage
- **React Community** for the amazing ecosystem and tools
- **Open Source Contributors** who have made this project possible

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

*Built with ❤️ by developers, for developers*

</div>
