
from typing import List
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.agent import Agent
from core.config import settings
import json

async def generate_movie_recommendations(favorite_movies: List[str]):
    model_ollama = OpenAIModel(
        model_name = settings.MODEL_ID,
        provider=OpenAIProvider(
            base_url = settings.OLLAMA_SERVER_ENDPOINT
        )
    )

    agent = Agent(
        model=model_ollama,
        system_prompt = ["You're a helpful movie assistant. Return the result as a valid JSON array of movie titles. No extra text or punctuation."]
        )   

    response = await agent.run(f"Based on the following movies: {", ".join(favorite_movies)} recommend me 20 movies I might like.")
    print(response.data)
    try:
        movie_list = json.loads(response.data)
        
        return movie_list
    except json.JSONDecodeError:
        print("Failed to parse the response as JSON")

        return []      