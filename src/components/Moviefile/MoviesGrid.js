import React, { useState } from "react";
import "../../styles.css";
import MovieCard from "./MovieCard";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function MoviesGrid({ movies, watchlist, toggleWatchlist }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("All Genres");
  const [rating, setRating] = useState("All");
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('user');
    Cookies.remove('username');
    Cookies.remove('isLoggedIn');
    navigate('/');
  };

  const goToWatchlist = () => {
    navigate('/watchlist');
  };

  const goToHome = () => {
    navigate('/home');
  };

  const matchesGenre = (movie, genre) => {
    return (
      genre === "All Genres" ||
      movie.genre.toLowerCase() === genre.toLowerCase()
    );
  };

  const matchesSearchTerm = (movie, searchTerm) => {
    return movie.title.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const matchesRating = (movie, rating) => {
    switch (rating) {
      case "All":
        return true;
      case "Good":
        return movie.rating >= 8;
      case "Ok":
        return movie.rating >= 5 && movie.rating < 8;
      case "Bad":
        return movie.rating < 5;
      default:
        return false;
    }
  };

  const filteredMovies = movies.filter(
    (movie) =>
      matchesGenre(movie, genre) &&
      matchesRating(movie, rating) &&
      matchesSearchTerm(movie, searchTerm)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
        <button className="btn" onClick={goToHome}>Home</button>
        <button className="btn" onClick={goToWatchlist}>Watchlist</button>
        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </div>
      <input
        type="text"
        className="search-input"
        placeholder="Search movies..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="filter-bar">
        <div className="filter-slot">
          <label>Genre</label>
          <select
            className="filter-dropdown"
            value={genre}
            onChange={handleGenreChange}
          >
            <option>All Genres</option>
            <option>Action</option>
            <option>Drama</option>
            <option>Fantasy</option>
            <option>Horror</option>
          </select>
        </div>

        <div className="filter-slot">
          <label>Rating</label>
          <select
            className="filter-dropdown"
            value={rating}
            onChange={handleRatingChange}
          >
            <option>All</option>
            <option>Good</option>
            <option>Ok</option>
            <option>Bad</option>
          </select>
        </div>
      </div>

      <div className="movies-grid">
        {filteredMovies.map((movie) => (
          <MovieCard
            movie={movie}
            key={movie._id}
            toggleWatchlist={toggleWatchlist}
            isWatchlisted={watchlist.includes(String(movie._id))}
          />
        ))}
      </div>
    </div>
  );
}