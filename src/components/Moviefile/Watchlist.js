import React from "react";
import "../../styles.css";
import MovieCard from "./MovieCard";

export default function Watchlist({ movies, watchlist, toggleWatchlist }) {
  return (
    <div>
      <div className="watchlist-header">
        <button className="back-button" onClick={() => window.history.back()}>
          Back
        </button>
        <h1 className="title">Your Watchlist</h1>
        <div className="watchlist">
          {watchlist.map((id) => {
            const movie = movies.find((movie) => String(movie._id) === String(id));
            return movie ? (
              <MovieCard
                key={id}
                movie={movie}
                toggleWatchlist={toggleWatchlist}
                isWatchlisted={true}
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}