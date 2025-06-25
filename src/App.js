import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoviesGrid from "./components/Moviefile/MoviesGrid";
import Watchlist from "./components/Moviefile/Watchlist";
import Loginpage from "./components/Login/Loginpage";
import RegisterPage from "./components/Register/RegisterPage";

import './App.css';
import './styles.css';

function Layout({ children }) {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/' || location.pathname === '/register';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <div className="container">{children}</div>
      {!hideHeaderFooter && <Footer />}
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('sessionToken');
    const savedUser = sessionStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (token) {
      fetch("http://localhost:5000/api/movies", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => response.json())
      .then((data) => setMovies(Array.isArray(data) ? data : []));
    }
  }, []);

  const toggleWatchlist = (movieId) => {
    setWatchlist((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Loginpage onLogin={setUser} />}
          />
          <Route
            path="/register"
            element={<RegisterPage />}
          />
          <Route
            path="/home"
            element={
              <MoviesGrid
                user={user}
                watchlist={watchlist}
                movies={movies}
                toggleWatchlist={toggleWatchlist}
              />
            }
          />
          <Route
            path="/watchlist"
            element={
              <Watchlist
                watchlist={watchlist}
                movies={movies}
                toggleWatchlist={toggleWatchlist}
              />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;