import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from "./components/Header";
import Footer from "./components/Footer";
import MoviesGrid from "./components/Moviefile/MoviesGrid";
import Watchlist from "./components/Moviefile/Watchlist";
import Loginpage from "./components/Login/Loginpage";
import RegisterPage from "./components/Register/RegisterPage";
import MovieDetail from "./components/Moviefile/MovieDetail";
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
  const navigate = useNavigate();

  // Logout: clear everything
  const handleLogout = () => {
    sessionStorage.clear();
    Cookies.remove('username');
    Cookies.remove('isLoggedIn');
    setUser(null);
    setWatchlist([]);
    navigate('/');
  };

  // Fetch movies and watchlist on login/page load
  useEffect(() => {
    const token = sessionStorage.getItem('sessionToken');
    const savedUser = sessionStorage.getItem('user');
    if (token && savedUser) {
      const userObj = JSON.parse(savedUser);
      setUser(userObj);

      // Fetch movies
      fetch("http://localhost:5000/api/movies", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        if (response.status === 401) {
          handleLogout();
          return [];
        }
        return response.json();
      })
      .then((data) => setMovies(Array.isArray(data) ? data : []));

      // Fetch watchlist for this user
      fetch(`http://localhost:5000/api/users/${userObj.id}/watchlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleLogout();
          return { watchlist: [] };
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.watchlist)) {
          setWatchlist(
            data.watchlist.map(m => typeof m === 'object' && m._id ? m._id : m)
          );
        } else {
          setWatchlist([]);
        }
      });
    } else {
      setUser(null);
      setWatchlist([]);
    }
    // eslint-disable-next-line
  }, []);

  // Update watchlist in backend when toggled
  const toggleWatchlist = (movieId) => {
    setWatchlist((prev) => {
      const updated = prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId];

      // Persist to backend
      const token = sessionStorage.getItem('sessionToken');
      const savedUser = sessionStorage.getItem('user');
      if (token && savedUser) {
        const userObj = JSON.parse(savedUser);
        fetch(`http://localhost:5000/api/users/${userObj.id}/watchlist`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ watchlist: updated })
        }).then(res => {
          if (res.status === 401 || res.status === 403) {
            handleLogout();
          }
        });
      }

      return updated;
    });
  };

  // After login, fetch watchlist for that user
  const handleLogin = (userObj) => {
    setUser(userObj);
    setWatchlist([]); // Clear any previous watchlist
    const token = sessionStorage.getItem('sessionToken');
    fetch(`http://localhost:5000/api/users/${userObj.id}/watchlist`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return { watchlist: [] };
      }
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data.watchlist)) {
        setWatchlist(
          data.watchlist.map(m => typeof m === 'object' && m._id ? m._id : m)
        );
      } else {
        setWatchlist([]);
      }
    });
  };

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={<Loginpage onLogin={handleLogin} />}
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
        <Route path="/movie/:id" element={<MovieDetail />} />

      </Routes>
    </Layout>
  );
}

export default App;