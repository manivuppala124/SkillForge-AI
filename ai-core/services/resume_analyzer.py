import asyncio
import re
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from utils.perplexity_client import PerplexityClient
from models.response_models import (
    SkillAnalysis, SkillCategory, ResumeAnalysisResponse, 
    JobSuggestion, ResumeScore
)

class ResumeAnalyzer:
    def __init__(self):
        self.perplexity = PerplexityClient()
        self.skill_categories = {
            "Programming Languages": [
                "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", 
                "Ruby", "Go", "Rust", "Kotlin", "Swift", "Dart", "Scala", "R"
            ],
            "Frontend": [
                "React", "Vue.js", "Angular", "HTML", "CSS", "SASS", "LESS", 
                "Bootstrap", "Tailwind CSS", "Material-UI", "Ant Design", "jQuery"
            ],
            "Backend": [
                "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", 
                "Laravel", "Ruby on Rails", "ASP.NET", "Gin", "Echo"
            ],
            "Mobile": [
                "React Native", "Flutter", "iOS", "Android", "Xamarin", 
                "Ionic", "PhoneGap", "Cordova"
            ],
            "Database": [
                "MongoDB", "MySQL", "PostgreSQL", "Redis", "Elasticsearch", 
                "Cassandra", "DynamoDB", "Firebase", "SQLite", "Oracle"
            ],
            "Cloud & DevOps": [
                "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", 
                "Ansible", "Jenkins", "CI/CD", "Nginx", "Apache"
            ],
            "Data Science & AI": [
                "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", 
                "Jupyter", "Matplotlib", "Seaborn", "OpenCV", "NLTK"
            ],
            "Testing": [
                "Jest", "Cypress", "Selenium", "JUnit", "PyTest", "Mocha", 
                "Chai", "TestNG", "Postman", "Newman"
            ],
            "Tools & Others": [
                "Git", "GitHub", "GitLab", "Jira", "Confluence", "VS Code", 
                "IntelliJ IDEA", "Eclipse", "Figma", "Adobe XD"
            ]
        }

        self.job_roles = {
            "Frontend Developer": ["frontend", "front-end", "ui", "user interface", "react", "angular", "vue"],
            "Backend Developer": ["backend", "back-end", "server", "api", "database", "microservices"],
            "Full Stack Developer": ["full stack", "fullstack", "full-stack", "end-to-end"],
            "Data Scientist": ["data scientist", "machine learning", "ml", "ai", "analytics"],
            "DevOps Engineer": ["devops", "infrastructure", "deployment", "ci/cd", "kubernetes"],
            "Mobile Developer": ["mobile", "ios", "android", "react native", "flutter"],
            "QA Engineer": ["qa", "quality assurance", "testing", "test automation"]
        }

    async def analyze(self, text: str, target_role: Optional[str] = None) -> ResumeAnalysisResponse:
        try:
            skills = self._extract_skills(text)
            experience = self._extract_experience(text)
            education = self._extract_education(text)
            score = self._calculate_score(skills, experience, education)
            job_suggestions = self._generate_job_suggestions(skills, target_role)
            ai_insights = await self._analyze_with_ai(text, target_role)
            recommendations = self._generate_recommendations(skills, experience, target_role)
            return ResumeAnalysisResponse(
                skills=skills,
                experience=experience,
                education=education,
                score=score,
                job_suggestions=job_suggestions,
                ai_insights=ai_insights,
                recommendations=recommendations
            )
        except Exception as e:
            raise Exception(f"Resume analysis failed: {str(e)}")

    def _extract_skills(self, text: str) -> SkillAnalysis:
        text_lower = text.lower()
        found_skills = []
        skills_by_category = {}
        categories = []
        for category, skills in self.skill_categories.items():
            category_skills = []
            for skill in skills:
                if self._skill_exists_in_text(skill, text_lower):
                    category_skills.append(skill)
                    found_skills.append(skill)
            if category_skills:
                skills_by_category[category] = category_skills
                categories.append(SkillCategory(
                    name=category,
                    skills=category_skills,
                    proficiency=self._estimate_proficiency(category_skills, text)
                ))
        found_skills = list(set(found_skills))
        return SkillAnalysis(
            identified=found_skills,
            by_category=skills_by_category,
            missing=self._suggest_missing_skills(found_skills, target_role=None),
            categories=categories
        )

    def _skill_exists_in_text(self, skill: str, text_lower: str) -> bool:
        skill_lower = skill.lower()
        if skill_lower in text_lower:
            return True
        variations = {
            "node.js": ["nodejs", "node js"],
            "vue.js": ["vuejs", "vue js"],
            "express.js": ["expressjs", "express js"],
            "c++": ["cpp", "c plus plus"],
            "c#": ["c sharp", "csharp"],
            "asp.net": ["aspnet", "asp net"]
        }
        if skill_lower in variations:
            return any(var in text_lower for var in variations[skill_lower])
        return False

    def _extract_experience(self, text: str) -> Dict[str, Any]:
        experience_patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional\s*)?experience',
            r'experience:?\s*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*in\s*(?:the\s*)?(?:field|industry|role)',
            r'(\d+)\+?\s*years?\s*(?:working|developing|programming)',
            r'over\s*(\d+)\s*years?',
            r'more\s*than\s*(\d+)\s*years?'
        ]
        total_years = 0
        for pattern in experience_patterns:
            matches = re.findall(pattern, text.lower())
            if matches:
                total_years = max(total_years, int(matches[0]))
        companies = self._extract_companies(text)
        roles = self._extract_roles(text)
        return {
            "total_years": total_years,
            "level": self._determine_experience_level(total_years),
            "companies": companies[:5],
            "roles": roles[:5],
            "industries": self._extract_industries(text)
        }

    def _extract_companies(self, text: str) -> List[str]:
        company_patterns = [
            r'(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Co\.?))',
            r'([A-Z][a-zA-Z\s&.,]+(?:Technologies|Tech|Systems|Solutions|Services|Software|Inc|LLC|Corp|Ltd))',
        ]
        companies = []
        for pattern in company_patterns:
            matches = re.findall(pattern, text)
            companies.extend([match.strip() for match in matches if len(match.strip()) > 2])
        return list(set(companies))

    def _extract_roles(self, text: str) -> List[str]:
        role_keywords = [
            "developer", "engineer", "analyst", "manager", "lead", "senior",
            "junior", "architect", "consultant", "specialist", "coordinator",
            "administrator", "designer", "programmer", "scientist"
        ]
        roles = []
        text_lower = text.lower()
        for keyword in role_keywords:
            if keyword in text_lower:
                pattern = rf'(\w+\s+)*{keyword}(?:\s+\w+)*'
                matches = re.findall(pattern, text_lower)
                if matches:
                    roles.extend([match.strip() for match in matches if len(match.strip()) > 5])
        return list(set(roles))

    def _extract_industries(self, text: str) -> List[str]:
        industries = [
            "fintech", "healthcare", "e-commerce", "education", "gaming",
            "automotive", "banking", "insurance", "retail", "media",
            "telecommunications", "consulting", "manufacturing"
        ]
        found_industries = []
        text_lower = text.lower()
        for industry in industries:
            if industry in text_lower:
                found_industries.append(industry.title())
        return found_industries

    def _extract_education(self, text: str) -> Dict[str, Any]:
        education_patterns = {
            "degrees": [
                r"bachelor(?:'?s)?(?:\s+of\s+|\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"master(?:'?s)?(?:\s+of\s+|\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"phd(?:\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"doctorate(?:\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"mba(?:\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"b\.?tech(?:\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})",
                r"m\.?tech(?:\s+in\s+)?(.*?)(?:\n|,|\.|\s{2,})"
            ],
            "certifications": [
                r"certified?\s+([A-Za-z\s]+)(?:\s+\([A-Z]+\))?",
                r"certification\s+in\s+([A-Za-z\s]+)",
                r"([A-Z]{2,})\s+certified",
                r"aws\s+(.*?)(?:\s+certified|certification)",
                r"google\s+(.*?)(?:\s+certified|certification)",
                r"microsoft\s+(.*?)(?:\s+certified|certification)"
            ]
        }
        degrees = []
        certifications = []
        institutions = []
        text_lower = text.lower()
        for pattern in education_patterns["degrees"]:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            degrees.extend([match.strip() for match in matches if len(match.strip()) > 2])
        for pattern in education_patterns["certifications"]:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            certifications.extend([match.strip() for match in matches if len(match.strip()) > 2])
        institution_patterns = [
            r'(?:university|college|institute|school)\s+of\s+([A-Za-z\s]+)',
            r'([A-Za-z\s]+)\s+(?:university|college|institute)',
            r'(?:at|from)\s+([A-Z][A-Za-z\s]+(?:University|College|Institute|School))'
        ]
        for pattern in institution_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            institutions.extend([match.strip() for match in matches if len(match.strip()) > 3])
        return {
            "degrees": list(set(degrees))[:5],
            "certifications": list(set(certifications))[:10],
            "institutions": list(set(institutions))[:5]
        }

    def _estimate_proficiency(self, skills: List[str], text: str) -> str:
        text_lower = text.lower()
        expert_indicators = ["expert", "advanced", "lead", "senior", "architect", "years"]
        intermediate_indicators = ["proficient", "experienced", "solid", "good"]
        expert_count = sum(1 for indicator in expert_indicators if indicator in text_lower)
        intermediate_count = sum(1 for indicator in intermediate_indicators if indicator in text_lower)
        if expert_count >= 2:
            return "Advanced"
        elif intermediate_count >= 1 or expert_count >= 1:
            return "Intermediate"
        else:
            return "Beginner"

    def _determine_experience_level(self, years: int) -> str:
        if years == 0:
            return "Entry Level"
        elif years <= 2:
            return "Junior"
        elif years <= 5:
            return "Mid Level"
        elif years <= 8:
            return "Senior"
        else:
            return "Lead/Principal"

    def _calculate_score(self, skills: SkillAnalysis, experience: Dict, education: Dict) -> ResumeScore:
        skill_count = len(skills.identified)
        skills_score = min(skill_count * 3, 40)
        exp_years = experience.get("total_years", 0)
        experience_score = min(exp_years * 4, 35)
        education_score = 0
        if education.get("degrees"):
            education_score += 15
        if education.get("certifications"):
            education_score += 10
        education_score = min(education_score, 25)
        overall_score = min(skills_score + experience_score + education_score, 100)
        return ResumeScore(
            overall=overall_score,
            sections={
                "skills": skills_score,
                "experience": experience_score,
                "education": education_score,
                "formatting": 85
            }
        )

    def _generate_job_suggestions(self, skills: SkillAnalysis, target_role: Optional[str]) -> List[JobSuggestion]:
        suggestions = []
        identified_skills = set(skill.lower() for skill in skills.identified)
        for role, keywords in self.job_roles.items():
            match_count = sum(1 for keyword in keywords if keyword in identified_skills)
            match_percentage = min(int((match_count / len(keywords)) * 100), 100)
            if match_percentage > 20:
                required_skills = self._get_role_requirements(role)
                missing_skills = [skill for skill in required_skills if skill.lower() not in identified_skills]
                suggestions.append(JobSuggestion(
                    title=role,
                    match_percentage=match_percentage,
                    requirements=required_skills,
                    missing_skills=missing_skills,
                    salary_range=self._get_salary_range(role)
                ))
        suggestions.sort(key=lambda x: x.match_percentage, reverse=True)
        return suggestions[:5]

    def _get_role_requirements(self, role: str) -> List[str]:
        role_requirements = {
            "Frontend Developer": ["JavaScript", "React", "HTML", "CSS", "Git"],
            "Backend Developer": ["Python", "Node.js", "Database", "API", "Git"],
            "Full Stack Developer": ["JavaScript", "React", "Node.js", "Database", "Git"],
            "Data Scientist": ["Python", "Pandas", "Machine Learning", "SQL", "Statistics"],
            "DevOps Engineer": ["AWS", "Docker", "Kubernetes", "CI/CD", "Git"],
            "Mobile Developer": ["React Native", "Flutter", "iOS", "Android", "Git"],
            "QA Engineer": ["Testing", "Automation", "Selenium", "API Testing", "Git"]
        }
        return role_requirements.get(role, ["Programming", "Problem Solving", "Git"])

    def _get_salary_range(self, role: str) -> Dict[str, Any]:
        salary_ranges = {
            "Frontend Developer": {"min": 60000, "max": 120000, "currency": "USD"},
            "Backend Developer": {"min": 70000, "max": 130000, "currency": "USD"},
            "Full Stack Developer": {"min": 75000, "max": 140000, "currency": "USD"},
            "Data Scientist": {"min": 80000, "max": 150000, "currency": "USD"},
            "DevOps Engineer": {"min": 85000, "max": 160000, "currency": "USD"},
            "Mobile Developer": {"min": 65000, "max": 125000, "currency": "USD"},
            "QA Engineer": {"min": 55000, "max": 100000, "currency": "USD"}
        }
        return salary_ranges.get(role, {"min": 50000, "max": 100000, "currency": "USD"})

    def _suggest_missing_skills(self, current_skills: List[str], target_role: Optional[str]) -> List[str]:
        current_lower = set(skill.lower() for skill in current_skills)
        trending_skills = [
            "Docker", "Kubernetes", "AWS", "TypeScript", "GraphQL", 
            "Microservices", "CI/CD", "Testing", "Agile", "REST API"
        ]
        missing = [skill for skill in trending_skills if skill.lower() not in current_lower]
        if target_role:
            role_skills = self._get_role_requirements(target_role)
            missing.extend([skill for skill in role_skills if skill.lower() not in current_lower])
        return list(set(missing))[:10]

    async def _analyze_with_ai(self, text: str, target_role: Optional[str]) -> Dict[str, Any]:
        prompt = f"""
        Analyze this resume and provide professional insights:

        Resume Text: {text[:3000]}...

        Target Role: {target_role or "General Software Development"}

        Please provide a JSON response with:
        1. Key strengths (top 3-5 points)
        2. Areas for improvement (top 3-5 points)
        3. Market trends relevance (1-10 score)
        4. Specific recommendations for improvement
        5. Standout achievements or projects

        Keep the analysis professional and actionable.
        """
        try:
            response = await self.perplexity.chat(
                prompt,
                model="llama-3.1-sonar-small"  # <— Supported Perplexity model!
            )
            try:
                return json.loads(response)
            except Exception:
                return {
                    "analysis": response,
                    "ai_generated": True,
                    "timestamp": datetime.now().isoformat()
                }
        except Exception as e:
            return {
                "analysis": "AI analysis temporarily unavailable",
                "ai_generated": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    def _generate_recommendations(self, skills: SkillAnalysis, experience: Dict, target_role: Optional[str]) -> List[str]:
        recommendations = [
            "Add quantifiable achievements and metrics to demonstrate impact",
            "Include relevant certifications to validate your expertise",
            "Optimize keywords for Applicant Tracking Systems (ATS)",
            "Highlight your most impactful projects with technical details"
        ]
        skill_count = len(skills.identified)
        if skill_count < 10:
            recommendations.append("Expand your technical skill set with trending technologies")
        if skill_count > 20:
            recommendations.append("Consider organizing skills by proficiency level for better clarity")
        exp_years = experience.get("total_years", 0)
        if exp_years == 0:
            recommendations.extend([
                "Include personal projects, internships, or volunteer work",
                "Highlight academic projects and coursework relevant to your target role"
            ])
        elif exp_years < 3:
            recommendations.append("Emphasize learning agility and growth potential")
        if target_role:
            recommendations.append(f"Research and include skills specifically required for {target_role} positions")
        if not experience.get("education", {}).get("certifications"):
            recommendations.append("Consider obtaining industry-recognized certifications")
        return recommendations[:8]
