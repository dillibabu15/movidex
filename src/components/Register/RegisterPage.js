import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.password || form.password.length < 12)
      newErrors.password = 'Password must be at least 12 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setErrors({ username: data.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ general: 'Server error' });
    }
  };

  return (
    <div className="page-container">
      <div className="login-box">
         <img src="/logo.png" alt="Logo" className="logo" />
        <h2 className="page-title">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              className="text-input"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
            />
            {errors.username && <div className="message-box message-error">{errors.username}</div>}
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="text-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <div className="message-box message-error">{errors.password}</div>}
          </div>
          {errors.general && <div className="message-box message-error">{errors.general}</div>}
          {successMsg && <div className="message-box message-success">{successMsg}</div>}
          <div className="button-group">
            <button className="btn btn-submit" type="submit">Register</button>
            <button className="btn btn-reset" type="button" onClick={() => {
              setForm({ username: '', password: '' });
              setErrors({});
              setSuccessMsg('');
            }}>Reset</button>
             <button className="btn back-button" onClick={() => window.history.back()}>
          Back
        </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;