import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReviewSection from "./ReviewSection";
import "../../styles.css";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMovie = async () => {
    setLoading(true);
    const token = sessionStorage.getItem('sessionToken');
    const res = await fetch(`http://localhost:5000/api/movies/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await res.json();
    setMovie(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovie();
    // eslint-disable-next-line
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!movie || movie.message) return <div>Movie not found.</div>;

  return (
    <div className="movie-detail">
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      <h2>{movie.title}</h2>
      {movie.ratings && movie.ratings.length > 0 && (
  <div>
    <strong>Average Rating: </strong>
    {(
      movie.ratings.reduce((sum, r) => sum + r.value, 0) / movie.ratings.length
    ).toFixed(1)} / 5
  </div>
)}
      <img src={`/images/${movie.image}`} alt={movie.title} style={{maxWidth: 300}} />
      <p>{movie.description || "No description available."}</p>
      <ReviewSection movieId={id} reviews={movie.reviews} onReviewAdded={fetchMovie} />
    </div>
  );
}