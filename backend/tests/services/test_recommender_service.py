import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from app.services.ollama_recommender import (
    parse_json_array,
    generate_movie_recommendations,
)

# -----------------------------------------------------------------------------
# parse_json_array – pure-function unit tests
# -----------------------------------------------------------------------------


def test_parse_json_array_valid():
    raw = '["A", "B", "C"]'
    assert parse_json_array(raw) == ["A", "B", "C"]


def test_parse_json_array_with_extra_text():
    raw = "Here they are!  \n" '["One", "Two", "Three"]  \n' "Enjoy!"
    assert parse_json_array(raw) == ["One", "Two", "Three"]


def test_parse_json_array_invalid_returns_empty():
    assert parse_json_array("nothing useful here") == []


# -----------------------------------------------------------------------------
# generate_movie_recommendations – async tests with full mocking
# -----------------------------------------------------------------------------

FAVOURITES = ["Inception", "Interstellar"]
RECOMMENDED_MOVIES = [f"Movie {i}" for i in range(1, 21)]  # exactly 20 titles
JSON_RESPONSE = json.dumps(RECOMMENDED_MOVIES)


@pytest.mark.asyncio
@patch("app.services.ollama_recommender.Agent")
async def test_generate_movie_recommendations_success(mock_agent_cls):
    """Happy-path: model returns clean JSON array."""
    # Prepare mocked Agent instance & its async run()
    mock_agent = AsyncMock()
    mock_response = MagicMock()
    mock_response.data = JSON_RESPONSE
    mock_agent.run.return_value = mock_response
    mock_agent_cls.return_value = mock_agent

    movies = await generate_movie_recommendations(FAVOURITES)

    # ✔ returned list
    assert movies == RECOMMENDED_MOVIES

    # ✔ Agent instantiated once
    mock_agent_cls.assert_called_once()

    # ✔ .run awaited exactly once with our prompt that contains the favourite movies
    mock_agent.run.assert_awaited_once()
    called_prompt = mock_agent.run.await_args.args[0]
    for fav in FAVOURITES:
        assert fav in called_prompt


@pytest.mark.asyncio
@patch("app.services.ollama_recommender.Agent")
async def test_generate_movie_recommendations_extra_text(mock_agent_cls):
    """Model surrounds JSON with chatter; parser should still succeed."""
    noisy_output = "Sure, here you go:\n" f"{JSON_RESPONSE}\n" "Have fun!"

    mock_agent = AsyncMock()
    mock_resp = MagicMock(data=noisy_output)
    mock_agent.run.return_value = mock_resp
    mock_agent_cls.return_value = mock_agent

    movies = await generate_movie_recommendations(FAVOURITES)
    assert movies == RECOMMENDED_MOVIES


@pytest.mark.asyncio
@patch("app.services.ollama_recommender.Agent")
async def test_generate_movie_recommendations_invalid_json_returns_empty(
    mock_agent_cls,
):
    """Completely malformed response ⇒ empty list."""
    mock_agent = AsyncMock()
    mock_resp = MagicMock(data="¯\\_(ツ)_/¯")
    mock_agent.run.return_value = mock_resp
    mock_agent_cls.return_value = mock_agent

    movies = await generate_movie_recommendations(FAVOURITES)
    assert movies == []  # graceful fallback
