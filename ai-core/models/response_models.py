from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class SkillCategory(BaseModel):
    name: str
    skills: List[str]
    proficiency: Optional[str] = "Intermediate"


class SkillAnalysis(BaseModel):
    identified: List[str] = Field(default_factory=list)
    by_category: Dict[str, List[str]] = Field(default_factory=dict)
    missing: List[str] = Field(default_factory=list)
    categories: List[SkillCategory] = Field(default_factory=list)


class JobSuggestion(BaseModel):
    title: str
    match_percentage: int = Field(ge=0, le=100)
    requirements: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    salary_range: Optional[Dict[str, Any]] = None


class ResumeScore(BaseModel):
    overall: int = Field(ge=0, le=100, default=0)
    sections: Dict[str, Optional[int]] = Field(default_factory=dict)


class ResumeAnalysisResponse(BaseModel):
    skills: SkillAnalysis
    experience: Dict[str, Any] = Field(default_factory=dict)
    education: Dict[str, Any] = Field(default_factory=dict)
    score: ResumeScore
    recommendations: List[str] = Field(default_factory=list)
    ai_insights: Dict[str, Any] = Field(default_factory=dict)
    job_suggestions: List[JobSuggestion] = Field(default_factory=list)


class QuizQuestion(BaseModel):
    question_id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    question: str
    options: List[str] = Field(min_items=2, max_items=4)
    correct_answer: int = Field(ge=0)
    explanation: str
    points: int = Field(default=1, ge=1)
    tags: List[str] = Field(default_factory=list)


class QuizSettings(BaseModel):
    time_limit: int = Field(default=30, ge=1)
    passing_score: int = Field(default=70, ge=0, le=100)
    shuffle_questions: bool = True
    show_correct_answers: bool = True
    allow_retakes: bool = True


class QuizResponse(BaseModel):
    title: str
    questions: List[QuizQuestion]
    settings: QuizSettings
    difficulty: str
    category: str = "technical"
    total_questions: int
    generated_by: str = "ai"


class LearningResource(BaseModel):
    resource_id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    title: str
    url: Optional[str] = None
    type: str  # course, article, book, practice, video, quiz, project
    duration: Optional[int] = None  # in minutes
    difficulty: Optional[str] = None
    provider: Optional[str] = None
    is_paid: bool = False
    rating: Optional[float] = Field(None, ge=1, le=5)
    tags: List[str] = Field(default_factory=list)


class LearningAssessment(BaseModel):
    type: str = "quiz"  # quiz, assignment, project, peer-review
    title: str
    description: Optional[str] = None
    passing_criteria: Optional[str] = None


class LearningModule(BaseModel):
    id: str = Field(default_factory=lambda: f"module_{datetime.now().timestamp()}")
    week: int = Field(ge=1)
    title: str
    description: str
    order: int = Field(ge=1)
    estimated_hours: int = Field(default=5, ge=1)
    skills: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)
    resources: List[LearningResource] = Field(default_factory=list)
    assessments: List[LearningAssessment] = Field(default_factory=list)
    project: Optional[str] = None


class LearningPathResponse(BaseModel):
    goal: str
    timeline: int
    difficulty: str = "intermediate"
    current_skills: List[str] = Field(default_factory=list)
    target_skills: List[str] = Field(default_factory=list)
    total_modules: int
    modules: List[LearningModule]
    estimated_hours_per_week: int
    category: str = "programming"
    generated_by: str = "ai"


class TutorResponse(BaseModel):
    answer: str
    question: str
    subject: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    conversation_id: Optional[str] = None
    error: bool = False


class APIResponse(BaseModel):
    success: bool
    data: Any = None
    message: Optional[str] = None
    error: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
