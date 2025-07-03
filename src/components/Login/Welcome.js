import React from 'react';
import Cookies from 'js-cookie';


const Welcome = ({ user, onNavigate }) => {
  const username = Cookies.get('username');

  const handleLogout = () => {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('user');

    // Remove cookies
    Cookies.remove('username');
    Cookies.remove('isLoggedIn');

    onNavigate('/');
  };

  return (
    <div className="page-container">
      <div className="welcome-box">
        <h2 className="welcome-title">
          {username === 'admin' ? 'Welcome Admin' : `Welcome ${username}`}
        </h2>
        <p className="welcome-text">You have successfully logged in.</p>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Welcome;
