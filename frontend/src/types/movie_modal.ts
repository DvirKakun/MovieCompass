import type { Movie, MovieTrailer } from "./movies";

// State interface
export interface MovieModalState {
  selectedMovie: Movie | null;
  isOpen: boolean;
  // Trailers
  trailers: Map<number, MovieTrailer>;
  trailersLoading: Map<number, boolean>;
  trailersError: Map<number, string>;
}

// Actions interface
export type MovieModalAction =
  | { type: "OPEN_MODAL"; payload: Movie }
  | { type: "CLOSE_MODAL" }
  | { type: "CLEAR_SELECTED_MOVIE" }
  | { type: "FETCH_TRAILER_START"; payload: { movieId: number } }
  | {
      type: "FETCH_TRAILER_SUCCESS";
      payload: { movieId: number; trailer: MovieTrailer };
    }
  | {
      type: "FETCH_TRAILER_ERROR";
      payload: { movieId: number; error: string };
    };
