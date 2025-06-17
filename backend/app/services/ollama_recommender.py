from typing import List, Dict
from app.schemas.rating import RatingEntry
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider
from pydantic_ai.agent import Agent
from app.core.config import settings
from app.schemas.user import User
from app.services.tmdb import fetch_movie_details
import json
import re
import asyncio


# Enhanced system prompt that considers multiple data sources
SYSTEM_PROMPT = (
    "You are an advanced movie recommendation assistant. "
    "Based on the user's movie preferences including favorite movies, watchlist, and ratings, "
    "recommend exactly 20 movies that match their taste. "
    "Consider the user's rating patterns - movies they rated highly should influence recommendations more. "
    "Avoid recommending movies that are already in their favorites or watchlist. "
    "Respond ONLY with a valid JSON array of movie titles, e.g., "
    '["Movie 1", "Movie 2", ..., "Movie 20"]. '
    "No extra text or explanation."
)

MODEL_SETTINGS = {"temperature": 0.2, "max_tokens": 768}

MODEL = OpenAIModel(
    model_name=settings.MODEL_ID,
    provider=OpenAIProvider(base_url=settings.OLLAMA_SERVER_ENDPOINT),
)


def parse_json_array(raw: str) -> List[str]:
    """Parse JSON array from potentially malformed response"""
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Try to extract JSON array from text
        match = re.search(r"\[[^\]]*\]", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return []


async def get_movie_titles_from_ids(movie_ids: List[int]) -> List[str]:
    """Fetch movie titles from TMDB API"""
    try:
        movies = await asyncio.gather(
            *(fetch_movie_details(movie_id) for movie_id in movie_ids)
        )
        return [movie.title for movie in movies if movie]
    except Exception:
        return []


def categorize_ratings(ratings: List[RatingEntry]) -> Dict[str, List[int]]:
    """Categorize movies by rating levels"""
    high_rated = []  # 8-10
    medium_rated = []  # 6-7
    low_rated = []  # 1-5

    for rating_data in ratings:
        score = rating_data.rating
        movie_id = rating_data.movie_id

        if score >= 8:
            high_rated.append(movie_id)
        elif score >= 6:
            medium_rated.append(movie_id)
        else:
            low_rated.append(movie_id)

    return {
        "high_rated": high_rated,
        "medium_rated": medium_rated,
        "low_rated": low_rated,
    }


def build_enhanced_prompt(
    favorite_titles: List[str],
    watchlist_titles: List[str],
    rating_categories: Dict[str, List[str]],
    existing_movies: List[str],
) -> str:
    """Build comprehensive user prompt with all preference data"""

    prompt_parts = []

    # Add favorite movies
    if favorite_titles:
        prompt_parts.append(f"FAVORITE MOVIES: {', '.join(favorite_titles)}")

    # Add highly rated movies (these are strong indicators)
    if rating_categories["high_rated"]:
        prompt_parts.append(
            f"HIGHLY RATED MOVIES (8-10/10): {', '.join(rating_categories['high_rated'])}"
        )

    # Add medium rated movies
    if rating_categories["medium_rated"]:
        prompt_parts.append(
            f"MODERATELY LIKED MOVIES (6-7/10): {', '.join(rating_categories['medium_rated'])}"
        )

    # Add watchlist context (shows interest but not yet watched)
    if watchlist_titles:
        prompt_parts.append(
            f"MOVIES IN WATCHLIST (showing interest): {', '.join(watchlist_titles)}"
        )

    # Add movies to avoid
    if rating_categories["low_rated"]:
        prompt_parts.append(
            f"DISLIKED MOVIES (avoid similar): {', '.join(rating_categories['low_rated'])}"
        )

    # Add existing movies to avoid duplicates
    if existing_movies:
        prompt_parts.append(
            f"DO NOT RECOMMEND (already known): {', '.join(existing_movies)}"
        )

    base_instruction = (
        "Based on this user's movie preferences, recommend exactly 20 movies that would match their taste. "
        "Prioritize movies similar to their favorites and highly-rated films. "
        "Consider their watchlist interests but avoid recommending movies they've already rated poorly."
    )

    return base_instruction + "\n\n" + "\n".join(prompt_parts)


async def generate_enhanced_movie_recommendations(user: User) -> List[str]:
    """Generate movie recommendations using comprehensive user data"""

    # Get movie titles for all user data
    favorite_titles = await get_movie_titles_from_ids(user.favorite_movies)
    watchlist_titles = await get_movie_titles_from_ids(user.watchlist)

    # Process ratings data
    rating_categories = categorize_ratings(user.ratings)

    # Get titles for rated movies
    high_rated_titles = await get_movie_titles_from_ids(rating_categories["high_rated"])
    medium_rated_titles = await get_movie_titles_from_ids(
        rating_categories["medium_rated"]
    )
    low_rated_titles = await get_movie_titles_from_ids(rating_categories["low_rated"])

    # Combine all existing movies to avoid duplicates
    all_existing_movies = (
        favorite_titles
        + watchlist_titles
        + high_rated_titles
        + medium_rated_titles
        + low_rated_titles
    )

    # Build the enhanced prompt
    user_prompt = build_enhanced_prompt(
        favorite_titles=favorite_titles,
        watchlist_titles=watchlist_titles,
        rating_categories={
            "high_rated": high_rated_titles,
            "medium_rated": medium_rated_titles,
            "low_rated": low_rated_titles,
        },
        existing_movies=all_existing_movies,
    )

    # Fallback for users with minimal data
    if not any([favorite_titles, high_rated_titles, watchlist_titles]):
        user_prompt = (
            "This user is new to the platform. Recommend 20 popular, highly-rated movies "
            "from diverse genres including action, drama, comedy, thriller, sci-fi, and romance. "
            "Focus on critically acclaimed films that appeal to broad audiences."
        )

    # Create and run the agent
    agent = Agent(
        model=MODEL,
        system_prompt=[SYSTEM_PROMPT],
        model_settings=MODEL_SETTINGS,
    )

    try:
        response = await agent.run(user_prompt)
        movies = parse_json_array(response.data)

        # Ensure we return exactly 20 movies, filter out any that might be duplicates
        unique_movies = []
        seen = set()

        for movie in movies:
            if movie and movie.lower() not in seen and movie not in all_existing_movies:
                unique_movies.append(movie)
                seen.add(movie.lower())

                if len(unique_movies) >= 20:
                    break

        return unique_movies[:20]

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return []


# Backwards compatibility - keep the original function signature
async def generate_movie_recommendations(favorite_movies: List[str]) -> List[str]:
    """Legacy function for backwards compatibility"""
    user_prompt = (
        f"Based on these movies: {', '.join(favorite_movies)}, "
        "recommend exactly 20 other movies."
    )

    agent = Agent(
        model=MODEL,
        system_prompt=[SYSTEM_PROMPT],
        model_settings=MODEL_SETTINGS,
    )

    response = await agent.run(user_prompt)
    movies = parse_json_array(response.data)

    return movies
