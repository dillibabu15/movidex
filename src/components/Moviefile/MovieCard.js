import React from "react";
import { Link } from "react-router-dom";
import "../../styles.css";


export default function MovieCard({ movie, isWatchlisted, toggleWatchlist }) {
  const handleError = (e) => {
    e.target.src = "images/default.jpg";
  };

  const getRatingClass = (rating) => {
    if (rating >= 8) return "rating-good";

    if (rating >= 5 && rating < 8) return "rating-ok";

    return "rating-bad";
  };

  return (
   <div key={movie._id} className="movie-card">
      <Link to={`/movie/${movie._id}`}>
        <img
          src={`images/${movie.image}`}
          alt={movie.title}
          onError={handleError}
        />
      </Link>
      <div className="movie-card-info">
        <Link to={`/movie/${movie._id}`}>
          <h3 className="movie-card-title">{movie.title}</h3>
        </Link>
        <div>
          <span className="movie-card-genre">{movie.genre}</span>
          <span className={`movie-card-rating ${getRatingClass(movie.rating)}`}>
            {movie.rating}
          </span>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={isWatchlisted}
            onChange={() => toggleWatchlist(movie._id)}
          ></input>
          <span className="slider">
            <span className="slider-label">
              {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}