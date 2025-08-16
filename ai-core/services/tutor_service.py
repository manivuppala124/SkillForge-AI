import asyncio
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from utils.perplexity_client import PerplexityClient
from models.response_models import TutorResponse


class TutorService:
    def __init__(self):
        self.perplexity = PerplexityClient()
        
        # Conversation context storage (in production, use Redis or database)
        self.conversation_history = {}
        
        # Subject-specific contexts
        self.subject_contexts = {
            "JavaScript": "programming language used for web development, both frontend and backend",
            "Python": "versatile programming language used for web development, data science, automation, and more",
            "React": "JavaScript library for building user interfaces, particularly web applications",
            "Data Science": "field that uses scientific methods, processes, algorithms to extract knowledge from data",
            "Machine Learning": "subset of AI that enables computers to learn and improve from experience",
            "Web Development": "process of creating websites and web applications",
            "Database": "organized collection of structured information or data stored electronically",
            "DevOps": "practices that combine software development and IT operations"
        }
        
        # Common question types and response templates
        self.question_types = {
            "definition": "What is",
            "howto": "How to",
            "comparison": "difference between",
            "troubleshooting": "error",
            "best_practices": "best practice"
        }


    async def ask(self, question: str, context: Optional[str] = None, subject: Optional[str] = None, conversation_id: Optional[str] = None) -> TutorResponse:
        try:
            # Generate conversation ID if not provided
            if not conversation_id:
                conversation_id = f"conv_{uuid.uuid4().hex[:8]}"
            
            # Build the tutor prompt
            prompt = self._build_tutor_prompt(question, context, subject, conversation_id)
            
            # Get response from AI
            ai_response = await self.perplexity.chat(prompt)
            
            # Store conversation context
            self._store_conversation_context(conversation_id, question, ai_response, subject)
            
            # Generate follow-up suggestions
            suggestions = self._generate_follow_up_suggestions(question, subject, ai_response)
            
            return TutorResponse(
                answer=ai_response,
                question=question,
                subject=subject,
                suggestions=suggestions,
                conversation_id=conversation_id,
                error=False
            )
            
        except Exception as e:
            return TutorResponse(
                answer="I'm sorry, I'm having trouble processing your question right now. Please try rephrasing your question or try again later.",
                question=question,
                subject=subject,
                suggestions=self._get_default_suggestions(),
                conversation_id=conversation_id,
                error=True
            )


    def _build_tutor_prompt(self, question: str, context: Optional[str], subject: Optional[str], conversation_id: str) -> str:
        """Build a comprehensive prompt for the AI tutor"""
        
        # Base tutor personality and guidelines
        base_prompt = """
        You are an expert AI tutor for SkillForge AI, specializing in technology education and programming concepts.

        Your teaching style:
        - Provide clear, educational explanations that build understanding
        - Use practical examples and real-world applications
        - Break down complex topics into digestible parts
        - Encourage learning through questions and exploration
        - Provide step-by-step guidance when appropriate
        - Be patient, supportive, and encouraging
        - Admit when you don't know something and suggest alternatives

        Guidelines:
        - Always prioritize accuracy and educational value
        - Adapt explanations to the student's apparent level
        - Include code examples when relevant (with proper syntax highlighting hints)
        - Suggest related concepts to explore
        - Encourage best practices and industry standards
        - Be concise but thorough
        """
        
        # Add subject context if available
        if subject:
            subject_context = self.subject_contexts.get(subject, f"topic related to {subject}")
            base_prompt += f"\n\nSubject Focus: You are specifically helping with {subject} - {subject_context}."
        
        # Add conversation context if available
        conversation_context = self._get_conversation_context(conversation_id)
        if conversation_context:
            base_prompt += f"\n\nConversation Context: {conversation_context}"
        
        # Add user-provided context
        if context:
            base_prompt += f"\n\nAdditional Context: {context}"
        
        # Add the specific question
        base_prompt += f"\n\nStudent Question: {question}\n\n"
        
        # Add specific instructions based on question type
        question_type = self._classify_question_type(question)
        if question_type == "definition":
            base_prompt += "Provide a clear definition followed by a practical example and common use cases."
        elif question_type == "howto":
            base_prompt += "Provide step-by-step instructions with examples. Include common pitfalls and best practices."
        elif question_type == "comparison":
            base_prompt += "Compare the concepts clearly, highlighting key differences, similarities, and when to use each."
        elif question_type == "troubleshooting":
            base_prompt += "Help diagnose the issue and provide systematic troubleshooting steps with explanations."
        elif question_type == "best_practices":
            base_prompt += "Explain the best practices with reasoning and provide concrete examples."
        
        base_prompt += "\n\nProvide a helpful, educational response:"
        
        return base_prompt


    def _classify_question_type(self, question: str) -> str:
        """Classify the type of question being asked"""
        question_lower = question.lower()
        
        if any(phrase in question_lower for phrase in ["what is", "what are", "define", "definition of"]):
            return "definition"
        elif any(phrase in question_lower for phrase in ["how to", "how do", "how can", "steps to"]):
            return "howto"  
        elif any(phrase in question_lower for phrase in ["difference between", "vs", "versus", "compare"]):
            return "comparison"
        elif any(phrase in question_lower for phrase in ["error", "bug", "issue", "problem", "not working", "doesn't work"]):
            return "troubleshooting"
        elif any(phrase in question_lower for phrase in ["best practice", "recommended", "should i", "better way"]):
            return "best_practices"
        else:
            return "general"


    def _get_conversation_context(self, conversation_id: str) -> Optional[str]:
        """Get conversation context for continuity"""
        if conversation_id in self.conversation_history:
            history = self.conversation_history[conversation_id]
            
            # Get last 3 interactions for context
            recent_context = history[-3:] if len(history) > 3 else history
            
            context_parts = []
            for interaction in recent_context:
                context_parts.append(f"Q: {interaction['question'][:100]}...")
                context_parts.append(f"A: {interaction['answer'][:200]}...")
            
            return " | ".join(context_parts) if context_parts else None
        
        return None


    def _store_conversation_context(self, conversation_id: str, question: str, answer: str, subject: Optional[str]):
        """Store conversation context for future reference"""
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []
        
        # Store the interaction
        interaction = {
            "question": question,
            "answer": answer,
            "subject": subject,
            "timestamp": datetime.now().isoformat()
        }
        
        self.conversation_history[conversation_id].append(interaction)
        
        # Keep only last 10 interactions per conversation
        if len(self.conversation_history[conversation_id]) > 10:
            self.conversation_history[conversation_id] = self.conversation_history[conversation_id][-10:]


    def _generate_follow_up_suggestions(self, question: str, subject: Optional[str], answer: str) -> List[str]:
        """Generate contextual follow-up suggestions"""
        suggestions = []
        question_lower = question.lower()
        
        # Generic follow-up suggestions
        generic_suggestions = [
            "Can you provide a practical example?",
            "What are the common pitfalls to avoid?",
            "How does this relate to real-world applications?",
            "What are the performance considerations?",
            "Are there any alternatives I should consider?"
        ]
        
        # Subject-specific suggestions
        subject_suggestions = {
            "JavaScript": [
                "How do I debug this in the browser?",
                "What's the difference between var, let, and const?",
                "How does this work with async/await?",
                "What are the ES6+ features I should know?"
            ],
            "Python": [
                "How do I handle exceptions here?",
                "What's the Pythonic way to do this?",
                "How does this work with different Python versions?",
                "What libraries would be helpful?"
            ],
            "React": [
                "How do I handle state with this?",
                "What about performance optimization?",
                "How do I test this component?",
                "What are the accessibility considerations?"
            ],
            "Data Science": [
                "How do I visualize this data?",
                "What statistical methods apply here?",
                "How do I validate these results?",
                "What about data cleaning and preprocessing?"
            ]
        }
        
        # Question-type specific suggestions
        if "error" in question_lower or "bug" in question_lower:
            suggestions.extend([
                "What's the exact error message?",
                "Can you share the relevant code?",
                "What have you tried so far?"
            ])
        elif "best practice" in question_lower:
            suggestions.extend([
                "What are the industry standards for this?",
                "How do large companies handle this?",
                "What tools can help with this?"
            ])
        elif "how to" in question_lower:
            suggestions.extend([
                "Can you show me the complete workflow?",
                "What are the prerequisites?",
                "Are there any shortcuts or tools?"
            ])
        
        # Add subject-specific suggestions
        if subject and subject in subject_suggestions:
            suggestions.extend(subject_suggestions[subject])
        
        # Add generic suggestions
        suggestions.extend(generic_suggestions)
        
        # Remove duplicates and limit to 5
        seen = set()
        unique_suggestions = []
        for suggestion in suggestions:
            if suggestion.lower() not in seen and len(unique_suggestions) < 5:
                seen.add(suggestion.lower())
                unique_suggestions.append(suggestion)
        
        return unique_suggestions


    def _get_default_suggestions(self) -> List[str]:
        """Get default suggestions when an error occurs"""
        return [
            "Can you try rephrasing your question?",
            "What specific topic would you like help with?",
            "Do you have a particular programming language in mind?",
            "Would you like to start with the basics?",
            "Can you provide more context about what you're trying to achieve?"
        ]


    async def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get conversation history for a given conversation ID"""
        return self.conversation_history.get(conversation_id, [])


    async def clear_conversation_history(self, conversation_id: str) -> bool:
        """Clear conversation history for a given conversation ID"""
        if conversation_id in self.conversation_history:
            del self.conversation_history[conversation_id]
            return True
        return False


    async def get_active_conversations(self) -> List[str]:
        """Get list of active conversation IDs"""
        return list(self.conversation_history.keys())
