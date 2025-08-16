# import asyncio
# import json
# import uuid
# from typing import Dict, List, Any
# from datetime import datetime
# from utils.perplexity_client import PerplexityClient
# from models.response_models import QuizQuestion, QuizSettings, QuizResponse


# class QuizGenerator:
#     def __init__(self):
#         self.perplexity = PerplexityClient()
        
#         self.difficulty_settings = {
#             "beginner": {
#                 "time_per_question": 2,
#                 "complexity": "basic concepts and definitions",
#                 "question_types": ["definition", "basic_syntax", "simple_concept"]
#             },
#             "intermediate": {
#                 "time_per_question": 3,
#                 "complexity": "practical applications and problem-solving",
#                 "question_types": ["application", "comparison", "troubleshooting"]
#             },
#             "advanced": {
#                 "time_per_question": 4,
#                 "complexity": "complex scenarios, best practices, and optimization",
#                 "question_types": ["optimization", "architecture", "advanced_concepts"]
#             }
#         }

#         # Topic-specific question templates for fallback
#         self.question_templates = {
#             "JavaScript": {
#                 "beginner": [
#                     {
#                         "question": "What is the correct way to declare a variable in JavaScript?",
#                         "options": ["var myVar = 5;", "variable myVar = 5;", "v myVar = 5;", "declare myVar = 5;"],
#                         "correct_answer": 0,
#                         "explanation": "In JavaScript, variables are declared using 'var', 'let', or 'const' keywords."
#                     }
#                 ],
#                 "intermediate": [
#                     {
#                         "question": "What is closure in JavaScript?",
#                         "options": [
#                             "A function that has access to variables in its outer scope",
#                             "A way to close a function",
#                             "A method to end a loop",
#                             "A type of event listener"
#                         ],
#                         "correct_answer": 0,
#                         "explanation": "A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned."
#                     }
#                 ]
#             },
#             "Python": {
#                 "beginner": [
#                     {
#                         "question": "What is the correct file extension for Python files?",
#                         "options": [".py", ".python", ".pyt", ".pt"],
#                         "correct_answer": 0,
#                         "explanation": "Python files use the .py extension."
#                     }
#                 ],
#                 "intermediate": [
#                     {
#                         "question": "What is a list comprehension in Python?",
#                         "options": [
#                             "A concise way to create lists",
#                             "A type of loop",
#                             "A function definition",
#                             "A class method"
#                         ],
#                         "correct_answer": 0,
#                         "explanation": "List comprehensions provide a concise way to create lists based on existing lists or other iterables."
#                     }
#                 ]
#             }
#         }


#     async def generate(self, topic: str, difficulty: str, num_questions: int = 10, category: str = "technical") -> QuizResponse:
#         try:
#             settings = self.difficulty_settings.get(difficulty, self.difficulty_settings["intermediate"])
            
#             # Generate quiz with AI
#             questions = await self._generate_questions_with_ai(topic, difficulty, num_questions, settings)
            
#             # Create quiz settings
#             quiz_settings = QuizSettings(
#                 time_limit=len(questions) * settings["time_per_question"],
#                 passing_score=70 if difficulty == "beginner" else (75 if difficulty == "intermediate" else 80),
#                 shuffle_questions=True,
#                 show_correct_answers=True,
#                 allow_retakes=True
#             )
            
#             return QuizResponse(
#                 title=f"{topic} - {difficulty.title()} Level Quiz",
#                 questions=questions,
#                 settings=quiz_settings,
#                 difficulty=difficulty,
#                 category=category,
#                 total_questions=len(questions),
#                 generated_by="ai"
#             )
            
#         except Exception as e:
#             # Fallback to template-based quiz
#             return self._generate_fallback_quiz(topic, difficulty, num_questions, category)


#     async def _generate_questions_with_ai(self, topic: str, difficulty: str, num_questions: int, settings: Dict) -> List[QuizQuestion]:
#         """Generate quiz questions using AI"""
#         prompt = self._create_quiz_prompt(topic, difficulty, num_questions, settings)
        
#         try:
#             ai_response = await self.perplexity.chat(prompt)
#             questions = self._parse_ai_response(ai_response, difficulty)
            
#             # Ensure we have the right number of questions
#             if len(questions) < num_questions:
#                 # Supplement with template questions
#                 template_questions = self._get_template_questions(topic, difficulty, num_questions - len(questions))
#                 questions.extend(template_questions)
            
#             return questions[:num_questions]
            
#         except Exception as e:
#             # If AI fails, use template questions
#             return self._get_template_questions(topic, difficulty, num_questions)


#     def _create_quiz_prompt(self, topic: str, difficulty: str, num_questions: int, settings: Dict) -> str:
#         return f"""
#         Create a {difficulty} level quiz about {topic} with {num_questions} multiple choice questions.

#         Requirements:
#         - Focus on {settings['complexity']}
#         - Each question must have exactly 4 options (A, B, C, D)
#         - Only one correct answer per question
#         - Include clear, educational explanations for correct answers
#         - Questions should be practical and relevant to real-world applications
#         - Avoid ambiguous or trick questions
#         - Ensure questions test understanding, not just memorization

#         Question types to include: {', '.join(settings['question_types'])}

#         Format the response as valid JSON:
#         {{
#             "questions": [
#                 {{
#                     "question": "Clear, specific question text",
#                     "options": ["Option A", "Option B", "Option C", "Option D"],
#                     "correct_answer": 0,
#                     "explanation": "Clear explanation of why this answer is correct and others are wrong",
#                     "tags": ["relevant", "tags"]
#                 }}
#             ]
#         }}

#         Ensure all questions are relevant to {topic} and appropriate for {difficulty} level.
#         """


#     def _parse_ai_response(self, response: str, difficulty: str) -> List[QuizQuestion]:
#         """Parse AI response and convert to QuizQuestion objects"""
#         try:
#             # Try to parse JSON response
#             data = json.loads(response)
#             questions = []
            
#             if "questions" in data:
#                 for i, q_data in enumerate(data["questions"]):
#                     if self._validate_question_data(q_data):
#                         question = QuizQuestion(
#                             question_id=f"q_{uuid.uuid4().hex[:8]}",
#                             question=q_data["question"],
#                             options=q_data["options"],
#                             correct_answer=q_data["correct_answer"],
#                             explanation=q_data["explanation"],
#                             points=1 if difficulty == "beginner" else (2 if difficulty == "intermediate" else 3),
#                             tags=q_data.get("tags", [])
#                         )
#                         questions.append(question)
            
#             return questions
            
#         except (json.JSONDecodeError, KeyError, ValueError) as e:
#             # If parsing fails, try to extract questions from text
#             return self._parse_text_response(response, difficulty)


#     def _validate_question_data(self, q_data: Dict) -> bool:
#         """Validate question data structure"""
#         required_fields = ["question", "options", "correct_answer", "explanation"]
        
#         # Check required fields exist
#         for field in required_fields:
#             if field not in q_data:
#                 return False
        
#         # Validate question
#         if not isinstance(q_data["question"], str) or len(q_data["question"].strip()) < 10:
#             return False
        
#         # Validate options
#         if not isinstance(q_data["options"], list) or len(q_data["options"]) != 4:
#             return False
        
#         for option in q_data["options"]:
#             if not isinstance(option, str) or len(option.strip()) < 1:
#                 return False
        
#         # Validate correct answer
#         if not isinstance(q_data["correct_answer"], int) or q_data["correct_answer"] not in [0, 1, 2, 3]:
#             return False
        
#         # Validate explanation
#         if not isinstance(q_data["explanation"], str) or len(q_data["explanation"].strip()) < 10:
#             return False
        
#         return True


#     def _parse_text_response(self, response: str, difficulty: str) -> List[QuizQuestion]:
#         """Parse text response when JSON parsing fails"""
#         questions = []
        
#         # Try to extract questions from text using patterns
#         # This is a simplified parser - in production, you might want more sophisticated parsing
        
#         lines = response.split('\n')
#         current_question = None
#         current_options = []
        
#         for line in lines:
#             line = line.strip()
#             if not line:
#                 continue
            
#             # Look for question patterns
#             if line.endswith('?') and len(line) > 20:
#                 current_question = line
#                 current_options = []
#             elif line.startswith(('A)', 'A.', '1.', '1)')):
#                 if current_question:
#                     current_options = [line[2:].strip()]
#             elif line.startswith(('B)', 'B.', '2.', '2)')):
#                 if current_options:
#                     current_options.append(line[2:].strip())
#             elif line.startswith(('C)', 'C.', '3.', '3)')):
#                 if len(current_options) == 2:
#                     current_options.append(line[2:].strip())
#             elif line.startswith(('D)', 'D.', '4.', '4)')):
#                 if len(current_options) == 3:
#                     current_options.append(line[2:].strip())
                    
#                     # We have a complete question
#                     if current_question and len(current_options) == 4:
#                         question = QuizQuestion(
#                             question_id=f"q_{uuid.uuid4().hex[:8]}",
#                             question=current_question,
#                             options=current_options,
#                             correct_answer=0,  # Default to first option
#                             explanation=f"This is the correct answer for {current_question}",
#                             points=1 if difficulty == "beginner" else (2 if difficulty == "intermediate" else 3),
#                             tags=[]
#                         )
#                         questions.append(question)
                        
#                         current_question = None
#                         current_options = []
        
#         return questions


#     def _get_template_questions(self, topic: str, difficulty: str, num_questions: int) -> List[QuizQuestion]:
#         """Get template questions for fallback"""
#         # Get templates for the topic and difficulty
#         topic_templates = self.question_templates.get(topic, {})
#         difficulty_templates = topic_templates.get(difficulty, [])
        
#         # If no specific templates, use generic ones
#         if not difficulty_templates:
#             difficulty_templates = self._get_generic_questions(topic, difficulty)
        
#         questions = []
#         for i in range(min(num_questions, len(difficulty_templates))):
#             template = difficulty_templates[i]
#             question = QuizQuestion(
#                 question_id=f"template_{uuid.uuid4().hex[:8]}",
#                 question=template["question"],
#                 options=template["options"],
#                 correct_answer=template["correct_answer"],
#                 explanation=template["explanation"],
#                 points=1 if difficulty == "beginner" else (2 if difficulty == "intermediate" else 3),
#                 tags=["template", topic.lower(), difficulty]
#             )
#             questions.append(question)
        
#         # If we need more questions, generate variations
#         while len(questions) < num_questions:
#             base_question = difficulty_templates[len(questions) % len(difficulty_templates)]
#             question = QuizQuestion(
#                 question_id=f"template_{uuid.uuid4().hex[:8]}",
#                 question=f"(Variation) {base_question['question']}",
#                 options=base_question["options"],
#                 correct_answer=base_question["correct_answer"],
#                 explanation=base_question["explanation"],
#                 points=1 if difficulty == "beginner" else (2 if difficulty == "intermediate" else 3),
#                 tags=["template", "variation", topic.lower(), difficulty]
#             )
#             questions.append(question)
        
#         return questions[:num_questions]


#     def _get_generic_questions(self, topic: str, difficulty: str) -> List[Dict]:
#         """Generate generic questions when specific templates don't exist"""
#         return [
#             {
#                 "question": f"What is a fundamental concept in {topic}?",
#                 "options": [
#                     f"Core principle of {topic}",
#                     "Unrelated concept A",
#                     "Unrelated concept B",
#                     "Unrelated concept C"
#                 ],
#                 "correct_answer": 0,
#                 "explanation": f"This represents a fundamental concept in {topic}."
#             },
#             {
#                 "question": f"Which of the following is a best practice in {topic}?",
#                 "options": [
#                     f"Following {topic} conventions",
#                     "Ignoring documentation",
#                     "Skipping testing",
#                     "Avoiding collaboration"
#                 ],
#                 "correct_answer": 0,
#                 "explanation": f"Following established conventions is a best practice in {topic}."
#             },
#             {
#                 "question": f"What is the primary benefit of using {topic}?",
#                 "options": [
#                     f"Improved efficiency and productivity",
#                     "Increased complexity",
#                     "Higher costs",
#                     "Slower development"
#                 ],
#                 "correct_answer": 0,
#                 "explanation": f"{topic} typically provides improved efficiency and productivity benefits."
#             }
#         ]


#     def _generate_fallback_quiz(self, topic: str, difficulty: str, num_questions: int, category: str) -> QuizResponse:
#         """Generate a fallback quiz when AI generation fails"""
#         questions = self._get_template_questions(topic, difficulty, num_questions)
        
#         settings = self.difficulty_settings.get(difficulty, self.difficulty_settings["intermediate"])
#         quiz_settings = QuizSettings(
#             time_limit=len(questions) * settings["time_per_question"],
#             passing_score=70,
#             shuffle_questions=True,
#             show_correct_answers=True,
#             allow_retakes=True
#         )
        
#         return QuizResponse(
#             title=f"{topic} - {difficulty.title()} Level Quiz (Template)",
#             questions=questions,
#             settings=quiz_settings,
#             difficulty=difficulty,
#             category=category,
#             total_questions=len(questions),
#             generated_by="template"
#         )
import asyncio
import json
import uuid
import re
import random
from typing import Dict, List, Any
from datetime import datetime
from utils.perplexity_client import PerplexityClient
from models.response_models import QuizQuestion, QuizSettings, QuizResponse


class QuizGenerator:
    def __init__(self):
        self.perplexity = PerplexityClient()
        
        self.difficulty_settings = {
            "beginner": {
                "time_per_question": 2,
                "complexity": "basic concepts, definitions, and fundamental principles",
                "question_types": ["definition", "basic_syntax", "simple_concept", "true_false"],
                "passing_score": 70
            },
            "intermediate": {
                "time_per_question": 3,
                "complexity": "practical applications, problem-solving, and real-world scenarios",
                "question_types": ["application", "comparison", "troubleshooting", "code_analysis"],
                "passing_score": 75
            },
            "advanced": {
                "time_per_question": 4,
                "complexity": "complex scenarios, best practices, optimization, and advanced concepts",
                "question_types": ["optimization", "architecture", "advanced_concepts", "system_design"],
                "passing_score": 80
            }
        }

    async def generate(self, topic: str, difficulty: str, num_questions: int = 10, category: str = "technical") -> QuizResponse:
        try:
            print(f"🎯 Starting quiz generation: {topic} - {difficulty} - {num_questions} questions")
            
            settings = self.difficulty_settings.get(difficulty, self.difficulty_settings["intermediate"])
            
            # Generate quiz with AI (with better retry mechanism)
            questions = await self._generate_questions_with_ai_retry(topic, difficulty, num_questions, settings)
            
            # Validate and ensure we have enough questions
            if len(questions) < num_questions:
                print(f"⚠️ Only generated {len(questions)} questions, supplementing...")
                additional_questions = await self._generate_supplementary_questions(
                    topic, difficulty, num_questions - len(questions), settings
                )
                questions.extend(additional_questions)
            
            # Shuffle questions for variety
            random.shuffle(questions)
            questions = questions[:num_questions]
            
            # Create quiz settings
            quiz_settings = QuizSettings(
                time_limit=len(questions) * settings["time_per_question"],
                passing_score=settings["passing_score"],
                shuffle_questions=True,
                show_correct_answers=True,
                allow_retakes=True
            )
            
            total_points = sum(q.points for q in questions)
            
            print(f"✅ Quiz generated successfully: {len(questions)} questions, {total_points} points")
            
            return QuizResponse(
                title=f"{topic} - {difficulty.title()} Level Quiz",
                topic=topic,
                questions=questions,
                settings=quiz_settings,
                difficulty=difficulty,
                category=category,
                total_questions=len(questions),
                total_points=total_points,
                generated_by="ai"
            )
            
        except Exception as e:
            print(f"❌ Error in quiz generation: {e}")
            # Enhanced fallback with topic-specific questions
            return await self._generate_smart_fallback_quiz(topic, difficulty, num_questions, category)

    async def _generate_questions_with_ai_retry(self, topic: str, difficulty: str, num_questions: int, settings: Dict) -> List[QuizQuestion]:
        """Generate quiz questions using AI with retry mechanism"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                print(f"🤖 AI Generation Attempt {attempt + 1}/{max_retries}")
                
                prompt = self._create_enhanced_quiz_prompt(topic, difficulty, num_questions, settings)
                ai_response = await self.perplexity.chat(prompt, max_tokens=4000, temperature=0.7)
                
                print(f"📝 AI Response received, length: {len(ai_response)}")
                
                questions = self._parse_ai_response_enhanced(ai_response, topic, difficulty)
                
                if len(questions) >= max(3, num_questions // 2):  # At least half the questions
                    print(f"✅ AI generated {len(questions)} valid questions")
                    return questions
                else:
                    print(f"⚠️ Only {len(questions)} questions parsed, retrying...")
                    
            except Exception as e:
                print(f"❌ AI generation attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    print("🔄 All AI attempts failed, using intelligent fallback")
                    
        return []

    def _create_enhanced_quiz_prompt(self, topic: str, difficulty: str, num_questions: int, settings: Dict) -> str:
        return f"""
You are an expert quiz creator. Create a comprehensive {difficulty} level quiz about "{topic}" with exactly {num_questions} multiple choice questions.

CRITICAL REQUIREMENTS:
1. Each question MUST be specifically about {topic}
2. Questions must be {difficulty} level difficulty
3. Focus on {settings['complexity']}
4. Each question has exactly 4 options (A, B, C, D)
5. Only one correct answer per question
6. Include detailed explanations

QUESTION TYPES TO INCLUDE: {', '.join(settings['question_types'])}

FORMAT - Return ONLY valid JSON in this exact structure:
{{
  "questions": [
    {{
      "question": "Specific question about {topic}",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "{difficulty}",
      "topic": "{topic}",
      "question_type": "definition"
    }}
  ]
}}

CONTENT GUIDELINES:
- Make questions practical and relevant to {topic}
- Avoid ambiguous or trick questions
- Test understanding, not just memorization
- Ensure options are plausible but only one is correct
- Include current best practices for {topic}

Generate exactly {num_questions} questions now:
"""

    def _parse_ai_response_enhanced(self, response: str, topic: str, difficulty: str) -> List[QuizQuestion]:
        """Enhanced parsing with multiple fallback strategies"""
        questions = []
        
        # Strategy 1: Try to parse as JSON
        try:
            # Clean response - remove any markdown formatting
            cleaned_response = self._clean_json_response(response)
            data = json.loads(cleaned_response)
            
            if "questions" in data and isinstance(data["questions"], list):
                for i, q_data in enumerate(data["questions"]):
                    if self._validate_question_data_enhanced(q_data):
                        question = self._create_quiz_question(q_data, topic, difficulty, i)
                        questions.append(question)
                        
            if questions:
                print(f"✅ JSON parsing successful: {len(questions)} questions")
                return questions
                
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing failed: {e}")
        
        # Strategy 2: Extract questions from text patterns
        questions = self._extract_questions_from_text(response, topic, difficulty)
        if questions:
            print(f"✅ Text parsing successful: {len(questions)} questions")
            return questions
        
        # Strategy 3: Generate from AI response understanding
        questions = self._generate_from_ai_understanding(response, topic, difficulty)
        print(f"⚠️ Fallback parsing: {len(questions)} questions")
        return questions

    def _clean_json_response(self, response: str) -> str:
        """Clean the AI response to extract valid JSON"""
        # Remove markdown code blocks
        response = re.sub(r'```json\n?|```\n?', '', response)
        
        # Find JSON-like content
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json_match.group(0)
        
        return response.strip()

    def _validate_question_data_enhanced(self, q_data: Dict) -> bool:
        """Enhanced validation for question data"""
        required_fields = ["question", "options", "correct_answer"]
        
        # Check required fields
        for field in required_fields:
            if field not in q_data:
                print(f"❌ Missing field: {field}")
                return False
        
        # Validate question
        if not isinstance(q_data["question"], str) or len(q_data["question"].strip()) < 10:
            print(f"❌ Invalid question: {q_data.get('question', 'N/A')}")
            return False
        
        # Validate options
        if not isinstance(q_data["options"], list) or len(q_data["options"]) != 4:
            print(f"❌ Invalid options: {len(q_data.get('options', []))} options")
            return False
        
        for i, option in enumerate(q_data["options"]):
            if not isinstance(option, str) or len(option.strip()) < 1:
                print(f"❌ Invalid option {i}: {option}")
                return False
        
        # Validate correct answer
        if not isinstance(q_data["correct_answer"], int) or q_data["correct_answer"] not in [0, 1, 2, 3]:
            print(f"❌ Invalid correct_answer: {q_data.get('correct_answer')}")
            return False
        
        return True

    def _create_quiz_question(self, q_data: Dict, topic: str, difficulty: str, index: int) -> QuizQuestion:
        """Create a QuizQuestion object from validated data"""
        points = {"beginner": 1, "intermediate": 2, "advanced": 3}.get(difficulty, 1)
        
        return QuizQuestion(
            question_id=f"q_{uuid.uuid4().hex[:8]}",
            question=q_data["question"].strip(),
            options=[opt.strip() for opt in q_data["options"]],
            correct_answer=q_data["correct_answer"],
            explanation=q_data.get("explanation", f"This is the correct answer for this {topic} question.").strip(),
            points=points,
            tags=[topic.lower().replace(" ", "_"), difficulty, q_data.get("question_type", "general")]
        )

    def _extract_questions_from_text(self, response: str, topic: str, difficulty: str) -> List[QuizQuestion]:
        """Extract questions from unstructured text"""
        questions = []
        lines = response.split('\n')
        
        current_question = None
        current_options = []
        current_correct = 0
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Look for questions (lines ending with ?)
            if '?' in line and len(line) > 20:
                if current_question and len(current_options) == 4:
                    # Save previous question
                    questions.append(self._create_text_question(
                        current_question, current_options, current_correct, topic, difficulty, len(questions)
                    ))
                
                current_question = line
                current_options = []
                current_correct = 0
            
            # Look for options
            elif re.match(r'^[A-D][\)\.]\s*(.+)', line, re.IGNORECASE):
                option_text = re.sub(r'^[A-D][\)\.]\s*', '', line, flags=re.IGNORECASE)
                current_options.append(option_text)
                
                # Check if this might be the correct answer (marked with * or "correct")
                if '*' in line or 'correct' in line.lower():
                    current_correct = len(current_options) - 1
        
        # Don't forget the last question
        if current_question and len(current_options) == 4:
            questions.append(self._create_text_question(
                current_question, current_options, current_correct, topic, difficulty, len(questions)
            ))
        
        return questions

    def _create_text_question(self, question: str, options: List[str], correct: int, topic: str, difficulty: str, index: int) -> QuizQuestion:
        """Create question from text extraction"""
        points = {"beginner": 1, "intermediate": 2, "advanced": 3}.get(difficulty, 1)
        
        return QuizQuestion(
            question_id=f"text_{uuid.uuid4().hex[:8]}",
            question=question.strip(),
            options=options,
            correct_answer=correct,
            explanation=f"This is the correct answer for this {topic} question.",
            points=points,
            tags=[topic.lower().replace(" ", "_"), difficulty, "extracted"]
        )

    def _generate_from_ai_understanding(self, response: str, topic: str, difficulty: str) -> List[QuizQuestion]:
        """Generate basic questions when parsing fails but we have AI response"""
        questions = []
        
        # Extract key terms from the response
        key_terms = self._extract_key_terms(response, topic)
        
        # Generate basic questions based on key terms
        for i, term in enumerate(key_terms[:5]):  # Max 5 questions
            question_text = f"What is {term} in the context of {topic}?"
            options = [
                f"A key concept in {topic}",
                f"An unrelated concept",
                f"A deprecated feature",
                f"Not relevant to {topic}"
            ]
            
            questions.append(QuizQuestion(
                question_id=f"understanding_{uuid.uuid4().hex[:8]}",
                question=question_text,
                options=options,
                correct_answer=0,
                explanation=f"{term} is indeed a key concept in {topic}.",
                points={"beginner": 1, "intermediate": 2, "advanced": 3}.get(difficulty, 1),
                tags=[topic.lower().replace(" ", "_"), difficulty, "understanding"]
            ))
        
        return questions

    def _extract_key_terms(self, text: str, topic: str) -> List[str]:
        """Extract key terms from text"""
        # Simple extraction based on common patterns
        words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        
        # Filter for relevant terms (contains topic-related words or is technical)
        topic_words = topic.lower().split()
        key_terms = []
        
        for word in words:
            if (any(tw in word.lower() for tw in topic_words) or 
                len(word) > 4 and word.lower() not in ['question', 'answer', 'option']):
                if word not in key_terms:
                    key_terms.append(word)
        
        return key_terms[:10]  # Return top 10 terms

    async def _generate_supplementary_questions(self, topic: str, difficulty: str, num_needed: int, settings: Dict) -> List[QuizQuestion]:
        """Generate additional questions if AI didn't provide enough"""
        print(f"🔄 Generating {num_needed} supplementary questions for {topic}")
        
        # Try a focused AI request
        try:
            focused_prompt = f"""
Create {num_needed} additional {difficulty} level questions about {topic}.
Return only JSON format:
{{"questions": [
  {{
    "question": "Question about {topic}",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0,
    "explanation": "Explanation"
  }}
]}}
"""
            response = await self.perplexity.chat(focused_prompt, max_tokens=2000, temperature=0.8)
            questions = self._parse_ai_response_enhanced(response, topic, difficulty)
            
            if questions:
                return questions[:num_needed]
                
        except Exception as e:
            print(f"⚠️ Supplementary AI generation failed: {e}")
        
        # Fallback to topic-specific templates
        return self._generate_topic_specific_questions(topic, difficulty, num_needed)

    def _generate_topic_specific_questions(self, topic: str, difficulty: str, num_needed: int) -> List[QuizQuestion]:
        """Generate topic-specific questions based on common patterns"""
        questions = []
        points = {"beginner": 1, "intermediate": 2, "advanced": 3}.get(difficulty, 1)
        
        # Topic-specific question patterns
        patterns = {
            "beginner": [
                f"What is the primary purpose of {topic}?",
                f"Which of the following is a key feature of {topic}?",
                f"What does {topic} help developers achieve?",
                f"In {topic}, what is the most basic concept?",
                f"How would you describe {topic} to a beginner?"
            ],
            "intermediate": [
                f"How does {topic} improve development workflow?",
                f"What are the best practices when working with {topic}?",
                f"Which scenario best demonstrates {topic} usage?",
                f"What problems does {topic} solve in real applications?",
                f"How does {topic} integrate with other technologies?"
            ],
            "advanced": [
                f"What are the performance considerations when implementing {topic}?",
                f"How would you optimize {topic} for large-scale applications?",
                f"What are the architectural implications of using {topic}?",
                f"Which advanced pattern works best with {topic}?",
                f"How do you handle edge cases in {topic} implementations?"
            ]
        }
        
        selected_patterns = patterns.get(difficulty, patterns["intermediate"])
        
        for i in range(min(num_needed, len(selected_patterns))):
            question_text = selected_patterns[i]
            
            options = [
                f"Correct implementation/concept for {topic}",
                f"Incorrect approach A",
                f"Incorrect approach B", 
                f"Unrelated concept"
            ]
            
            # Randomize options
            random.shuffle(options)
            correct_index = options.index(f"Correct implementation/concept for {topic}")
            
            questions.append(QuizQuestion(
                question_id=f"pattern_{uuid.uuid4().hex[:8]}",
                question=question_text,
                options=options,
                correct_answer=correct_index,
                explanation=f"This represents the correct approach for {topic} at {difficulty} level.",
                points=points,
                tags=[topic.lower().replace(" ", "_"), difficulty, "pattern_based"]
            ))
        
        return questions

    async def _generate_smart_fallback_quiz(self, topic: str, difficulty: str, num_questions: int, category: str) -> QuizResponse:
        """Enhanced fallback quiz generation"""
        print(f"🔄 Generating smart fallback quiz for {topic}")
        
        questions = self._generate_topic_specific_questions(topic, difficulty, num_questions)
        
        settings = self.difficulty_settings.get(difficulty, self.difficulty_settings["intermediate"])
        quiz_settings = QuizSettings(
            time_limit=len(questions) * settings["time_per_question"],
            passing_score=settings["passing_score"],
            shuffle_questions=True,
            show_correct_answers=True,
            allow_retakes=True
        )
        
        return QuizResponse(
            title=f"{topic} - {difficulty.title()} Level Quiz",
            topic=topic,
            questions=questions,
            settings=quiz_settings,
            difficulty=difficulty,
            category=category,
            total_questions=len(questions),
            total_points=sum(q.points for q in questions),
            generated_by="smart_fallback"
        )