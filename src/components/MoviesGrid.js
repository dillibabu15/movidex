import React, { useState, useEffect } from "react";
import "../styles.css";
import MoiveCard from "./MoiveCard";

export default function MoviesGrid() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch("movies.json")
      .then((response) => response.json())
      .then((data) => setMovies(data));
  }, []);

  return (
    <div className="movies-grid">
      {movies.map((movie) => (
        <MoiveCard movie={movie} key={movie.id}></MoiveCard>
      ))}
    </div>
  );
}
