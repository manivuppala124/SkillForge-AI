import asyncio
import json
import uuid
from typing import Dict, List, Any
from datetime import datetime, timedelta
from utils.perplexity_client import PerplexityClient
from models.response_models import (
    LearningModule, LearningResource, LearningAssessment, 
    LearningPathResponse
)


class LearningPathGenerator:
    def __init__(self):
        self.perplexity = PerplexityClient()
        
        # Predefined learning tracks for common goals
        self.learning_tracks = {
            "Full Stack Developer": {
                "target_skills": ["JavaScript", "React", "Node.js", "Database", "Git", "REST API"],
                "category": "programming",
                "difficulty": "intermediate"
            },
            "Frontend Developer": {
                "target_skills": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git"],
                "category": "programming", 
                "difficulty": "beginner"
            },
            "Backend Developer": {
                "target_skills": ["Python", "FastAPI", "Database", "Docker", "Git", "API"],
                "category": "programming",
                "difficulty": "intermediate"
            },
            "Data Scientist": {
                "target_skills": ["Python", "Pandas", "NumPy", "Machine Learning", "Statistics"],
                "category": "data-science",
                "difficulty": "intermediate"
            },
            "DevOps Engineer": {
                "target_skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"],
                "category": "programming",
                "difficulty": "advanced"
            }
        }


    async def generate(self, goal: str, timeline: int, current_skills: List[str], learning_style: str = "mixed", hours_per_week: int = 10) -> LearningPathResponse:
        try:
            # Determine learning track info
            track_info = self._get_track_info(goal)
            
            # Generate modules with AI
            modules = await self._generate_modules_with_ai(goal, timeline, current_skills, learning_style, hours_per_week)
            
            # If AI generation fails, use template modules
            if not modules:
                modules = self._generate_template_modules(goal, timeline, current_skills, hours_per_week)
            
            # Calculate target skills
            target_skills = self._determine_target_skills(goal, current_skills, track_info)
            
            return LearningPathResponse(
                goal=goal,
                timeline=timeline,
                difficulty=track_info["difficulty"],
                current_skills=current_skills,
                target_skills=target_skills,
                total_modules=len(modules),
                modules=modules,
                estimated_hours_per_week=hours_per_week,
                category=track_info["category"],
                generated_by="ai"
            )
            
        except Exception as e:
            # Fallback to template-based path
            return self._generate_fallback_path(goal, timeline, current_skills, learning_style, hours_per_week)


    def _get_track_info(self, goal: str) -> Dict[str, Any]:
        """Get track information for the goal"""
        # Check if goal matches a predefined track
        for track_name, track_info in self.learning_tracks.items():
            if track_name.lower() in goal.lower() or goal.lower() in track_name.lower():
                return track_info
        
        # Default track info
        return {
            "target_skills": ["Programming", "Problem Solving", "Git"],
            "category": "programming",
            "difficulty": "intermediate"
        }


    async def _generate_modules_with_ai(self, goal: str, timeline: int, current_skills: List[str], learning_style: str, hours_per_week: int) -> List[LearningModule]:
        """Generate learning modules using AI"""
        prompt = self._create_learning_path_prompt(goal, timeline, current_skills, learning_style, hours_per_week)
        
        try:
            ai_response = await self.perplexity.chat(prompt)
            modules = self._parse_ai_learning_response(ai_response, timeline, hours_per_week)
            return modules
            
        except Exception as e:
            print(f"AI generation failed: {e}")
            return []


    def _create_learning_path_prompt(self, goal: str, timeline: int, current_skills: List[str], learning_style: str, hours_per_week: int) -> str:
        skills_str = ", ".join(current_skills) if current_skills else "Beginner level"
        weeks = max(timeline // 7, 1)
        
        return f"""
        Create a comprehensive {timeline}-day learning path for someone who wants to become a {goal}.

        Current Skills: {skills_str}
        Learning Style: {learning_style}
        Timeline: {timeline} days ({weeks} weeks)
        Hours per week: {hours_per_week}

        Create a structured learning path with weekly modules. Each module should include:
        1. Clear learning objectives
        2. Recommended resources (courses, articles, books, practice projects)
        3. Practical exercises and projects
        4. Skills to focus on each week
        5. Assessment methods

        Format the response as JSON:
        {{
            "modules": [
                {{
                    "week": 1,
                    "title": "Module Title",
                    "description": "What you'll learn this week",
                    "estimated_hours": 8,
                    "skills": ["skill1", "skill2"],
                    "learning_objectives": ["objective1", "objective2"],
                    "resources": [
                        {{
                            "title": "Resource Title",
                            "url": "https://example.com",
                            "type": "course",
                            "duration": 60,
                            "difficulty": "beginner"
                        }}
                    ],
                    "project": "Week project description",
                    "assessment": "How to measure progress"
                }}
            ]
        }}

        Make the path progressive, building from basic to advanced concepts.
        Include practical projects that reinforce learning.
        Consider the learning style: {learning_style}.
        """


    def _parse_ai_learning_response(self, response: str, timeline: int, hours_per_week: int) -> List[LearningModule]:
        """Parse AI response and convert to LearningModule objects"""
        try:
            data = json.loads(response)
            modules = []
            
            if "modules" in data:
                for module_data in data["modules"]:
                    if self._validate_module_data(module_data):
                        module = self._create_module_from_data(module_data)
                        modules.append(module)
            
            return modules
            
        except (json.JSONDecodeError, KeyError) as e:
            # Try to parse text response
            return self._parse_text_learning_response(response, timeline, hours_per_week)


    def _validate_module_data(self, module_data: Dict) -> bool:
        """Validate module data structure"""
        required_fields = ["week", "title", "description"]
        
        for field in required_fields:
            if field not in module_data:
                return False
        
        # Validate week
        if not isinstance(module_data["week"], int) or module_data["week"] < 1:
            return False
        
        # Validate title and description
        if not isinstance(module_data["title"], str) or len(module_data["title"].strip()) < 5:
            return False
        
        if not isinstance(module_data["description"], str) or len(module_data["description"].strip()) < 10:
            return False
        
        return True


    def _create_module_from_data(self, module_data: Dict) -> LearningModule:
        """Create LearningModule from parsed data"""
        # Parse resources
        resources = []
        for res_data in module_data.get("resources", []):
            resource = LearningResource(
                title=res_data.get("title", "Learning Resource"),
                url=res_data.get("url"),
                type=res_data.get("type", "course"),
                duration=res_data.get("duration"),
                difficulty=res_data.get("difficulty"),
                provider=res_data.get("provider"),
                is_paid=res_data.get("is_paid", False),
                rating=res_data.get("rating"),
                tags=res_data.get("tags", [])
            )
            resources.append(resource)
        
        # Parse assessments
        assessments = []
        if "assessment" in module_data:
            assessment = LearningAssessment(
                type="quiz",
                title=f"Week {module_data['week']} Assessment",
                description=module_data["assessment"],
                passing_criteria="70% or higher"
            )
            assessments.append(assessment)
        
        return LearningModule(
            id=f"module_{uuid.uuid4().hex[:8]}",
            week=module_data["week"],
            title=module_data["title"],
            description=module_data["description"],
            order=module_data["week"],
            estimated_hours=module_data.get("estimated_hours", 8),
            skills=module_data.get("skills", []),
            prerequisites=module_data.get("prerequisites", []),
            learning_objectives=module_data.get("learning_objectives", []),
            resources=resources,
            assessments=assessments,
            project=module_data.get("project")
        )


    def _parse_text_learning_response(self, response: str, timeline: int, hours_per_week: int) -> List[LearningModule]:
        """Parse text response when JSON parsing fails"""
        modules = []
        weeks = max(timeline // 7, 1)
        
        # Create basic modules from text
        lines = response.split('\n')
        current_week = 1
        current_title = ""
        current_description = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for week patterns
            if "week" in line.lower() and any(char.isdigit() for char in line):
                if current_title:
                    # Save previous module
                    module = self._create_basic_module(current_week, current_title, current_description, hours_per_week)
                    modules.append(module)
                    current_week += 1
                
                current_title = line
                current_description = ""
            else:
                current_description += line + " "
        
        # Add the last module
        if current_title:
            module = self._create_basic_module(current_week, current_title, current_description, hours_per_week)
            modules.append(module)
        
        return modules[:weeks]


    def _create_basic_module(self, week: int, title: str, description: str, hours_per_week: int) -> LearningModule:
        """Create a basic module with default structure"""
        # Create basic resources
        resources = [
            LearningResource(
                title=f"Introduction to {title}",
                type="course",
                duration=120,
                difficulty="beginner"
            ),
            LearningResource(
                title=f"{title} Practice Exercises",
                type="practice",
                duration=60,
                difficulty="intermediate"
            )
        ]
        
        # Create basic assessment
        assessments = [
            LearningAssessment(
                type="quiz",
                title=f"Week {week} Assessment",
                description=f"Test your understanding of {title}",
                passing_criteria="70% or higher"
            )
        ]
        
        return LearningModule(
            id=f"module_{uuid.uuid4().hex[:8]}",
            week=week,
            title=title.strip(),
            description=description.strip() or f"Learn about {title}",
            order=week,
            estimated_hours=hours_per_week,
            skills=[title.strip()],
            prerequisites=[],
            learning_objectives=[f"Understand {title}", f"Apply {title} concepts"],
            resources=resources,
            assessments=assessments,
            project=f"Build a project using {title}"
        )


    def _generate_template_modules(self, goal: str, timeline: int, current_skills: List[str], hours_per_week: int) -> List[LearningModule]:
        """Generate template-based modules"""
        weeks = max(timeline // 7, 4)  # Minimum 4 weeks
        modules = []
        
        # Get track info for structured modules
        track_info = self._get_track_info(goal)
        target_skills = track_info["target_skills"]
        
        # Create modules based on target skills
        skills_per_week = max(len(target_skills) // weeks, 1)
        
        for week in range(1, min(weeks + 1, 13)):  # Max 12 weeks
            # Determine skills for this week
            start_idx = (week - 1) * skills_per_week
            end_idx = min(start_idx + skills_per_week, len(target_skills))
            week_skills = target_skills[start_idx:end_idx]
            
            if not week_skills:
                week_skills = [f"{goal} Advanced Topics"]
            
            # Create resources for the week
            resources = self._create_template_resources(week_skills, goal)
            
            # Create assessments
            assessments = [
                LearningAssessment(
                    type="quiz",
                    title=f"Week {week} Quiz",
                    description=f"Test your knowledge of {', '.join(week_skills)}",
                    passing_criteria="70% or higher"
                ),
                LearningAssessment(
                    type="project",
                    title=f"Week {week} Project",
                    description=f"Build a project incorporating {', '.join(week_skills)}",
                    passing_criteria="Complete project with required features"
                )
            ]
            
            module = LearningModule(
                id=f"template_module_{week}",
                week=week,
                title=f"Week {week}: {', '.join(week_skills)}",
                description=f"Master {', '.join(week_skills)} and apply them in practical scenarios",
                order=week,
                estimated_hours=hours_per_week,
                skills=week_skills,
                prerequisites=self._get_prerequisites(week, modules),
                learning_objectives=[
                    f"Understand core concepts of {skill}" for skill in week_skills
                ] + [f"Apply {skill} in real projects" for skill in week_skills],
                resources=resources,
                assessments=assessments,
                project=f"Build a {goal.lower()} project using {', '.join(week_skills)}"
            )
            
            modules.append(module)
        
        return modules


    def _create_template_resources(self, skills: List[str], goal: str) -> List[LearningResource]:
        """Create template resources for given skills"""
        resources = []
        
        for skill in skills:
            # Course resource
            resources.append(LearningResource(
                title=f"Complete {skill} Course",
                type="course",
                duration=240,  # 4 hours
                difficulty="intermediate",
                provider="Online Learning Platform",
                is_paid=False,
                rating=4.5,
                tags=[skill.lower(), goal.lower()]
            ))
            
            # Article resource
            resources.append(LearningResource(
                title=f"{skill} Best Practices Guide",
                type="article",
                duration=30,
                difficulty="intermediate",
                provider="Tech Blog",
                is_paid=False,
                rating=4.0,
                tags=[skill.lower(), "best-practices"]
            ))
            
            # Practice resource
            resources.append(LearningResource(
                title=f"Hands-on {skill} Exercises",
                type="practice",
                duration=120,  # 2 hours
                difficulty="intermediate",
                provider="Interactive Platform",
                is_paid=False,
                rating=4.3,
                tags=[skill.lower(), "practice", "hands-on"]
            ))
        
        return resources


    def _get_prerequisites(self, week: int, existing_modules: List[LearningModule]) -> List[str]:
        """Get prerequisites for a given week"""
        if week <= 1:
            return []
        
        # Get skills from previous weeks
        prerequisites = []
        for module in existing_modules:
            if module.week < week:
                prerequisites.extend(module.skills)
        
        return list(set(prerequisites))


    def _determine_target_skills(self, goal: str, current_skills: List[str], track_info: Dict) -> List[str]:
        """Determine target skills based on goal and current skills"""
        base_skills = track_info.get("target_skills", [])
        current_skills_lower = [skill.lower() for skill in current_skills]
        
        # Add skills not already possessed
        target_skills = []
        for skill in base_skills:
            if skill.lower() not in current_skills_lower:
                target_skills.append(skill)
        
        # Add advanced skills
        advanced_skills = {
            "Full Stack Developer": ["Microservices", "GraphQL", "Testing", "Deployment"],
            "Frontend Developer": ["Performance Optimization", "Accessibility", "PWA"],
            "Backend Developer": ["Scalability", "Security", "Monitoring"],
            "Data Scientist": ["Deep Learning", "Big Data", "MLOps"],
            "DevOps Engineer": ["Monitoring", "Security", "Automation"]
        }
        
        goal_advanced = advanced_skills.get(goal, ["Advanced Topics"])
        for skill in goal_advanced:
            if skill.lower() not in current_skills_lower and skill not in target_skills:
                target_skills.append(skill)
        
        return target_skills


    def _generate_fallback_path(self, goal: str, timeline: int, current_skills: List[str], learning_style: str, hours_per_week: int) -> LearningPathResponse:
        """Generate a fallback learning path when AI generation fails"""
        track_info = self._get_track_info(goal)
        modules = self._generate_template_modules(goal, timeline, current_skills, hours_per_week)
        target_skills = self._determine_target_skills(goal, current_skills, track_info)
        
        return LearningPathResponse(
            goal=goal,
            timeline=timeline,
            difficulty=track_info["difficulty"],
            current_skills=current_skills,
            target_skills=target_skills,
            total_modules=len(modules),
            modules=modules,
            estimated_hours_per_week=hours_per_week,
            category=track_info["category"],
            generated_by="template"
        )
