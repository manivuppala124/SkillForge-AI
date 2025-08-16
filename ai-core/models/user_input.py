from pydantic import BaseModel, validator
from typing import List, Optional
from enum import Enum


class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate" 
    ADVANCED = "advanced"


class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    MIXED = "mixed"


class QuizRequest(BaseModel):
    topic: str
    difficulty: DifficultyLevel
    num_questions: int = 10
    time_limit: Optional[int] = None  # minutes
    category: Optional[str] = "technical"
    
    @validator('topic')
    def validate_topic(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Topic must be at least 2 characters')
        return v.strip()
    
    @validator('num_questions')
    def validate_questions(cls, v):
        if v < 1 or v > 50:
            raise ValueError('Number of questions must be between 1 and 50')
        return v
    
    @validator('time_limit')
    def validate_time_limit(cls, v):
        if v is not None and (v < 5 or v > 180):
            raise ValueError('Time limit must be between 5 and 180 minutes')
        return v


class ResumeAnalysisRequest(BaseModel):
    text: str
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    
    @validator('text')
    def validate_text(cls, v):
        if len(v.strip()) < 100:
            raise ValueError('Resume text must be at least 100 characters')
        if len(v) > 50000:
            raise ValueError('Resume text must not exceed 50,000 characters')
        return v.strip()
    
    @validator('target_role')
    def validate_target_role(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Target role must be at least 2 characters')
        return v.strip() if v else None


class LearningPathRequest(BaseModel):
    goal: str
    timeline: int  # days
    current_skills: List[str] = []
    learning_style: LearningStyle = LearningStyle.MIXED
    hours_per_week: int = 10
    
    @validator('goal')
    def validate_goal(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Goal must be at least 3 characters')
        return v.strip()
    
    @validator('timeline')
    def validate_timeline(cls, v):
        if v < 7 or v > 365:
            raise ValueError('Timeline must be between 7 and 365 days')
        return v
    
    @validator('hours_per_week')
    def validate_hours(cls, v):
        if v < 1 or v > 40:
            raise ValueError('Hours per week must be between 1 and 40')
        return v
    
    @validator('current_skills')
    def validate_skills(cls, v):
        if len(v) > 50:
            raise ValueError('Maximum 50 current skills allowed')
        return [skill.strip() for skill in v if skill.strip()]


class TutorRequest(BaseModel):
    question: str
    context: Optional[str] = None
    subject: Optional[str] = None
    conversation_id: Optional[str] = None
    
    @validator('question')
    def validate_question(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Question must be at least 5 characters')
        if len(v) > 2000:
            raise ValueError('Question must not exceed 2000 characters')
        return v.strip()
    
    @validator('context')
    def validate_context(cls, v):
        if v is not None and len(v) > 5000:
            raise ValueError('Context must not exceed 5000 characters')
        return v.strip() if v else None
    
    @validator('subject')
    def validate_subject(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Subject must be at least 2 characters')
        return v.strip() if v else None
