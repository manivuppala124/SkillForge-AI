import aiohttp
import asyncio
import json
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class PerplexityClient:
    """
    Async client for Perplexity AI API.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai"
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable not set")

        # Update default model to a currently valid model name
        self.default_model = "llama-3.1-sonar-small"  # <-- use an allowed model
        self.max_retries = 3
        self.retry_delay = 1.0
        self.default_timeout = 60

    async def chat(self, prompt: str, model: Optional[str] = None, **kwargs) -> str:
        """
        Send a chat request to Perplexity API.

        Args:
            prompt (str): User prompt or question.
            model (Optional[str]): Model to use (defaults to self.default_model).
            **kwargs: Additional request parameters.

        Returns:
            str: AI generated response.

        Raises:
            Exception: For failure or after max retries.
        """
        model = model or self.default_model
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": kwargs.get("system_prompt",
                        "You are an AI assistant specialized in technology education and career development.")
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": kwargs.get("max_tokens", 2000),
            "temperature": kwargs.get("temperature", 0.3),
            "top_p": kwargs.get("top_p", 0.9),
            "stream": False
        }

        if "conversation_history" in kwargs:
            history_msgs = [
                msg for msg in kwargs["conversation_history"]
                if isinstance(msg, dict) and "role" in msg and "content" in msg
            ]
            if history_msgs:
                payload["messages"] = [payload["messages"][0]] + history_msgs + [payload["messages"][1]]

        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    timeout = aiohttp.ClientTimeout(total=self.default_timeout)
                    async with session.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload,
                        timeout=timeout,
                    ) as response:

                        text = await response.text()
                        if response.status == 200:
                            data = json.loads(text)
                            if not data.get("choices"):
                                raise Exception("No choices returned from API.")
                            content = data["choices"][0]["message"]
                            if isinstance(content, dict) and "content" in content:
                                content = content["content"]
                            if not content:
                                raise Exception("Empty response content.")
                            logger.info(f"Perplexity API successful call (attempt {attempt + 1})")
                            return content.strip()
                        elif response.status == 429:
                            wait = self.retry_delay * (2 ** attempt)
                            logger.warning(f"Rate limited; retrying after {wait}s (attempt {attempt + 1})")
                            await asyncio.sleep(wait)
                        elif response.status == 401:
                            raise Exception("Unauthorized: Invalid API key.")
                        elif response.status == 400:
                            try:
                                err_data = json.loads(text)
                                err_msg = err_data.get("error", {}).get("message", "Bad request.")
                            except Exception:
                                err_msg = "Bad request."
                            raise Exception(f"Bad request: {err_msg}")
                        else:
                            err_msg = f"Error {response.status}: {text}"
                            if attempt == self.max_retries - 1:
                                raise Exception(err_msg)
                            logger.warning(f"{err_msg}; retrying (attempt {attempt + 1})")
            except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                if attempt == self.max_retries - 1:
                    raise Exception(f"Request error: {err}")
                logger.warning(f"Request error: {err}; retrying (attempt {attempt + 1})")
                await asyncio.sleep(self.retry_delay)
            except json.JSONDecodeError as err:
                if attempt == self.max_retries - 1:
                    raise Exception(f"Invalid JSON response: {err}")
                logger.warning(f"JSON decode error: {err}; retrying (attempt {attempt + 1})")
                await asyncio.sleep(self.retry_delay)
        raise Exception("All attempts failed.")

    def get_available_models(self) -> List[str]:
        """
        Return list of supported models.

        Returns:
            List[str]: Model names.
        """
        return [
            "llama-3.1-sonar-small",
            "llama-3.1-sonar-small-128",
            "llama-3.1-sonar-large",
            "llama-3.1-sonar-large-128",
            "llama-3.1-sonar-small-chat",
            "llama-3.1-sonar-large-chat",
            "llama-3.1-8b-instruct",
            "llama-3.1-70b-instruct"
        ]

    def _get_timestamp(self) -> str:
        return datetime.utcnow().isoformat() + "Z"

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check on the Perplexity API
        
        Returns:
            Health check results
        """
        try:
            # Simple test query
            test_response = await self.chat("Hello", max_tokens=10)
            
            return {
                "status": "healthy",
                "api_accessible": True,
                "test_response_received": bool(test_response),
                "timestamp": self._get_timestamp()
            }
            
        except Exception as e:
            return {
                "status": "unhealthy", 
                "api_accessible": False,
                "error": str(e),
                "timestamp": self._get_timestamp()
            }
