import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Loginpage.css';
import { useNavigate } from 'react-router-dom';

const Loginpage = ({ onLogin }) => {
  const [userData, setUserData] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/userData.json')
      .then(res => res.json())
      .then(data => setUserData(data))
      .catch(err => console.error("Failed to load user data:", err));
    Cookies.set('test', '12345', { expires: 7 });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username required';
    if (!password || password.length < 12) newErrors.password = 'Min 12 chars';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    const user = userData.find(u => u.username === username && u.password === password);
    if (user) {
      const token = `${user.username}-${Date.now()}`;
      sessionStorage.setItem('sessionToken', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      Cookies.set('username', user.username, { expires: 7, path: '/' });
      Cookies.set('isLoggedIn', 'true', { expires: 7, path: '/' });

      onLogin(user);
      navigate('/home');
    } else {
      setErrors({ general: 'Invalid credentials' });
    }
  };

  return (
    <div className="page-container">
      
      <div className="login-box">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h2 className="page-title">Login</h2>
        <div className="input-group">
          <label className="input-label">Username</label>
          <input className="text-input" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input type="password" className="text-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {errors.general && <div className="message-box message-error">{errors.general}</div>}
        <div className="button-group">
          <button className="btn btn-submit" onClick={handleLogin}>Submit</button>
          <button className="btn btn-reset" onClick={() => {
            setUsername('');
            setPassword('');
            setErrors({});
          }}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;