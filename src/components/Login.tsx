import React from 'react';
import './Login.css';

const Login = () => {
  return (
    <div className="login">
      <h2>Login</h2>
      <form>
        <label>Email</label>
        <input type="email" placeholder="Email" />

        <label>Password</label>
        <input type="password" placeholder="Password" />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
