from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError
import uvicorn
import os
import logging
from datetime import datetime
from dotenv import load_dotenv

# Import models
from models.user_input import (
    QuizRequest, ResumeAnalysisRequest, 
    LearningPathRequest, TutorRequest
)
from models.response_models import APIResponse

# Import services
from services.resume_analyzer import ResumeAnalyzer
from services.quiz_generator import QuizGenerator
from services.learning_path_gen import LearningPathGenerator
from services.tutor_service import TutorService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SkillForge AI Core",
    description="AI microservice for SkillForge Learning Management System",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize AI services
try:
    resume_analyzer = ResumeAnalyzer()
    quiz_generator = QuizGenerator()
    learning_path_gen = LearningPathGenerator()
    tutor_service = TutorService()
    logger.info("AI services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize AI services: {e}")
    resume_analyzer = None
    quiz_generator = None
    learning_path_gen = None
    tutor_service = None


# Middleware for request logging and error handling
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Process request
    response = await call_next(request)
    
    # Log request details
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    return response


# Exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content=APIResponse(
            success=False,
            message="Validation error",
            error=str(exc)
        ).dict()
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse(
            success=False,
            message=exc.detail,
            error=f"HTTP {exc.status_code}"
        ).dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=APIResponse(
            success=False,
            message="Internal server error",
            error=str(exc) if os.getenv("ENVIRONMENT") != "production" else "An unexpected error occurred"
        ).dict()
    )


# Health check endpoints
@app.get("/")
async def root():
    return APIResponse(
        success=True,
        data={
            "message": "SkillForge AI Core is running",
            "version": "1.0.0",
            "status": "healthy"
        }
    )


@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "resume_analyzer": resume_analyzer is not None,
            "quiz_generator": quiz_generator is not None,
            "learning_path_generator": learning_path_gen is not None,
            "tutor_service": tutor_service is not None
        },
        "environment": os.getenv("ENVIRONMENT", "development")
    }
    
    # Check if all services are available
    all_services_healthy = all(health_status["services"].values())
    
    return APIResponse(
        success=all_services_healthy,
        data=health_status,
        message="All services operational" if all_services_healthy else "Some services unavailable"
    )


# Resume Analysis endpoint
@app.post("/analyze-resume")
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Analyze resume text and provide insights, skills analysis, and job suggestions
    """
    if not resume_analyzer:
        raise HTTPException(status_code=503, detail="Resume analyzer service unavailable")
    
    try:
        logger.info(f"Analyzing resume (text length: {len(request.text)} chars)")
        
        analysis = await resume_analyzer.analyze(
            text=request.text,
            target_role=request.target_role
        )
        
        logger.info("Resume analysis completed successfully")
        
        return APIResponse(
            success=True,
            data=analysis,
            message="Resume analysis completed"
        )
        
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")


# Quiz Generation endpoint
@app.post("/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """
    Generate a quiz based on topic, difficulty, and number of questions
    """
    if not quiz_generator:
        raise HTTPException(status_code=503, detail="Quiz generator service unavailable")
    
    try:
        logger.info(f"Generating quiz: {request.topic} ({request.difficulty}, {request.num_questions} questions)")
        
        quiz = await quiz_generator.generate(
            topic=request.topic,
            difficulty=request.difficulty.value,
            num_questions=request.num_questions,
            category=request.category or "technical"
        )
        
        logger.info(f"Quiz generated successfully: {len(quiz.questions)} questions")
        
        return APIResponse(
            success=True,
            data=quiz,
            message=f"Quiz generated with {len(quiz.questions)} questions"
        )
        
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")


# Learning Path Generation endpoint
@app.post("/generate-learning-path")
async def generate_learning_path(request: LearningPathRequest):
    """
    Generate a personalized learning path based on goals, timeline, and current skills
    """
    if not learning_path_gen:
        raise HTTPException(status_code=503, detail="Learning path generator service unavailable")
    
    try:
        logger.info(f"Generating learning path: {request.goal} ({request.timeline} days)")
        
        path = await learning_path_gen.generate(
            goal=request.goal,
            timeline=request.timeline,
            current_skills=request.current_skills,
            learning_style=request.learning_style.value,
            hours_per_week=request.hours_per_week
        )
        
        logger.info(f"Learning path generated: {len(path.modules)} modules")
        
        return APIResponse(
            success=True,
            data=path,
            message=f"Learning path generated with {len(path.modules)} modules"
        )
        
    except Exception as e:
        logger.error(f"Learning path generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Learning path generation failed: {str(e)}")


# AI Tutor endpoint
@app.post("/tutor-ask")
async def tutor_ask(request: TutorRequest):
    """
    Ask the AI tutor a question and get an educational response
    """
    if not tutor_service:
        raise HTTPException(status_code=503, detail="Tutor service unavailable")
    
    try:
        logger.info(f"Tutor question: {request.question[:50]}...")
        
        response = await tutor_service.ask(
            question=request.question,
            context=request.context,
            subject=request.subject,
            conversation_id=request.conversation_id
        )
        
        logger.info("Tutor response generated successfully")
        
        return APIResponse(
            success=True,
            data=response,
            message="Tutor response generated"
        )
        
    except Exception as e:
        logger.error(f"Tutor request failed: {e}")
        raise HTTPException(status_code=500, detail=f"Tutor request failed: {str(e)}")


# Additional utility endpoints
@app.get("/services/status")
async def services_status():
    """
    Get detailed status of all AI services
    """
    status = {
        "resume_analyzer": {
            "available": resume_analyzer is not None,
            "status": "operational" if resume_analyzer else "unavailable"
        },
        "quiz_generator": {
            "available": quiz_generator is not None,
            "status": "operational" if quiz_generator else "unavailable"
        },
        "learning_path_generator": {
            "available": learning_path_gen is not None,
            "status": "operational" if learning_path_gen else "unavailable"
        },
        "tutor_service": {
            "available": tutor_service is not None,
            "status": "operational" if tutor_service else "unavailable"
        }
    }
    
    return APIResponse(
        success=True,
        data=status,
        message="Service status retrieved"
    )


@app.get("/models/info")
async def models_info():
    """
    Get information about available AI models and capabilities
    """
    from utils.perplexity_client import PerplexityClient
    
    try:
        client = PerplexityClient()
        models = client.get_available_models()
        
        info = {
            "available_models": models,
            "default_model": client.default_model,
            "capabilities": [
                "Resume analysis and career insights",
                "Quiz generation with multiple difficulty levels",
                "Personalized learning path creation",
                "AI tutoring and concept explanation"
            ],
            "supported_formats": {
                "resume_input": ["text"],
                "quiz_topics": ["any technical subject"],
                "learning_goals": ["career paths", "skill development"],
                "tutor_subjects": ["programming", "technology", "general"]
            }
        }
        
        return APIResponse(
            success=True,
            data=info,
            message="Model information retrieved"
        )
        
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


# Server startup event
@app.on_event("startup")
async def startup_event():
    logger.info("SkillForge AI Core starting up...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info("AI Core services ready!")


# Server shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("SkillForge AI Core shutting down...")


# Main entry point
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") != "production",
        access_log=True
    )
