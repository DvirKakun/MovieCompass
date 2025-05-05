
from typing import List
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.agent import Agent
from core.config import settings
import json, re

SYSTEM_PROMPT = (
        "You are a movie recommendation assistant. "
        "Given a list of favorite movies, recommend exactly 20 other movies. "
        "Respond ONLY with a valid JSON array of movie titles, e.g., "
        "[\"Movie 1\", \"Movie 2\", ..., \"Movie 20\"]. "
        "No extra text or explanation."
    )

MODEL_SETTINGS = {"temperature": 0.15, "max_tokens": 512}

MODEL = OpenAIModel(
        model_name = settings.MODEL_ID,
        provider=OpenAIProvider(
            base_url = settings.OLLAMA_SERVER_ENDPOINT
        ),
)

def parse_json_array(raw: str):
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\[[^\]]*\]', raw, re.DOTALL)

        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return []  

async def generate_movie_recommendations(favorite_movies: List[str]):
    user_prompt = (
        f"Based on these movies: {', '.join(favorite_movies)}, "
        "recommend exactly 20 other movies."
    )
    
    agent = Agent(
        model=MODEL,
        system_prompt = [SYSTEM_PROMPT], 
        model_settings = MODEL_SETTINGS,
    )

    response = await agent.run(user_prompt)
    movies = parse_json_array(response.data)

    return movies;