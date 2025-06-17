from fastapi import APIRouter, Depends, BackgroundTasks
import asyncio
from app.schemas.user import User, UpdateUserProfile, UserResponse
from app.schemas.movie import MovieResponse
from app.api.dependencies import get_current_user
from app.services.tmdb import fetch_movie_details, search_movies
from app.services.ollama_recommender import (
    generate_enhanced_movie_recommendations,
    generate_movie_recommendations,
)
from app.services.user import (
    add_movie_to_favorites,
    remove_movie_from_favorites,
    add_movie_to_watchlist,
    remove_movie_from_watchlist,
    add_movie_rating,
    update_user_profile,
    delete_movie_rating,
)

router = APIRouter()


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def patch_me(
    background_tasks: BackgroundTasks,
    payload: UpdateUserProfile,
    current_user: User = Depends(get_current_user),
):
    user_response = update_user_profile(current_user, payload, background_tasks)

    return user_response


# @router.post("/me/recommendations", response_model=MovieResponse)
# async def recommend_movies(current_user: User = Depends(get_current_user)):
#     favorite_movies = current_user.favorite_movies

#     favorite_movies_names = await asyncio.gather(
#         *(fetch_movie_details(movie_id) for movie_id in favorite_movies)
#     )
#     favorite_movies_names = [movie.title for movie in favorite_movies_names]

#     recommendations = await generate_movie_recommendations(favorite_movies_names)
#     match_movies = [
#         res[0]
#         for res in await asyncio.gather(
#             *(search_movies(movie) for movie in recommendations)
#         )
#         if res
#     ]

#     return MovieResponse(movies=match_movies)


@router.post("/me/recommendations", response_model=MovieResponse)
async def recommend_movies(current_user: User = Depends(get_current_user)):
    """
    Generate enhanced movie recommendations based on user's complete profile:
    - Favorite movies
    - Watchlist
    - Rating history (with emphasis on highly-rated films)
    """

    # Use the enhanced recommendation function

    try:
        # Generate recommendations using all user data
        recommendations = await generate_enhanced_movie_recommendations(current_user)

        if not recommendations:
            # Fallback to basic recommendations if enhanced fails
            if current_user.favorite_movies:
                favorite_movies_names = await asyncio.gather(
                    *(
                        fetch_movie_details(movie_id)
                        for movie_id in current_user.favorite_movies
                    )
                )
                favorite_movies_names = [movie.title for movie in favorite_movies_names]

                recommendations = await generate_movie_recommendations(
                    favorite_movies_names
                )
            else:
                # Return empty response if no data available
                return MovieResponse(movies=[])

        # Search for movies and return results
        match_movies = []

        for movie_title in recommendations:
            try:
                search_results = await search_movies(movie_title)

                if search_results:
                    # Take the first (most relevant) result
                    match_movies.append(search_results[0])

                    # Limit to prevent too many API calls
                    if len(match_movies) >= 20:
                        break
            except Exception as e:
                print(f"Error searching for movie '{movie_title}': {e}")
                continue

        return MovieResponse(movies=match_movies)

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        # Return empty response on error
        return MovieResponse(movies=[])


@router.put("/me/favorite/{movie_id}")
async def add_favorite_movie(
    movie_id: int, current_user: User = Depends(get_current_user)
):
    updated_favorite_movies = await add_movie_to_favorites(current_user, movie_id)

    return {
        "message": "Movie added to favorites",
        "favorite_movies": updated_favorite_movies,
    }


@router.delete("/me/favorite/{movie_id}")
async def remove_favorite_movie(
    movie_id: int, current_user: User = Depends(get_current_user)
):
    updated_favorite_movies = remove_movie_from_favorites(current_user, movie_id)

    return {
        "message": "Movie removed from favorites",
        "favorite_movies": updated_favorite_movies,
    }


@router.put("/me/watchlist/{movie_id}")
async def add_watchlist_movie(
    movie_id: int, current_user: User = Depends(get_current_user)
):
    updated_watchlist = await add_movie_to_watchlist(current_user, movie_id)

    return {"message": "Movie added to watchlist", "watchlist": updated_watchlist}


@router.delete("/me/watchlist/{movie_id}")
async def remove_watchlist_movie(
    movie_id: int, current_user: User = Depends(get_current_user)
):
    updated_watchlist = remove_movie_from_watchlist(current_user, movie_id)

    return {"message": "Movie removed from watchlist", "watchlist": updated_watchlist}


@router.put("/me/rating/{movie_id}")
async def rate_movie(
    movie_id: int, rating: int, current_user: User = Depends(get_current_user)
):
    updated_ratings = await add_movie_rating(current_user, movie_id, rating)

    return {"message": "Movie rated", "ratings": updated_ratings}


@router.delete("/me/rating/{movie_id}")
async def delete_rating(movie_id: int, current_user: User = Depends(get_current_user)):
    updated_ratings = delete_movie_rating(current_user, movie_id)

    return {"message": "Rating deleted", "ratings": updated_ratings}
