import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Loginpage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username required';
    if (!password || password.length < 12) newErrors.password = 'Min 12 chars';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const user = data.user;
        const token = data.token;
        sessionStorage.setItem('sessionToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        Cookies.set('username', user.username, { expires: 7, path: '/', secure: true, sameSite: 'Strict' });
        Cookies.set('isLoggedIn', 'true', { expires: 7, path: '/', secure: true, sameSite: 'Strict' });

        if (onLogin) onLogin(user);
        navigate('/home');
      } else {
        setErrors({ general: data.message || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: 'Server error' });
    }
  };

  return (
    <div className="page-container">
      <video autoPlay loop muted playsInline className="video-background">
        <source src="/videos/Cinematic_Background_Video_Generation_Request.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay"></div>
      <div className="login-box">
        <img src="/logo.png" alt="Logo" className="duck-logo" />
        <h2 className="page-title">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              className="text-input"
              placeholder="e.g. cinephile_42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <div className="message-box message-error">{errors.username}</div>}
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="text-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="message-box message-error">{errors.password}</div>}
          </div>
          {errors.general && <div className="message-box message-error">{errors.general}</div>}
          <div className="button-group">
            <button className="btn btn-submit" type="submit">Login</button>
            <button className="btn btn-reset" type="button" onClick={() => {
              setUsername('');
              setPassword('');
              setErrors({});
            }}>Reset</button>
            <button className="btn btn-reg" type="button" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Loginpage;