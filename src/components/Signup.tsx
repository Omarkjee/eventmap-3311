import React, { useState } from 'react';
import './Signup.css';
import { signUp } from '../utils/firebaseAuth';  // Import the signUp function from firebaseAuth.js

const Signup = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // For error handling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent page reload

    try {
      // Call the signUp function from firebaseAuth.js
      await signUp(email, password);
      alert("Sign up successful! Please check your email for verification.");
    } catch (error) {
      setError(error.message);  // Set error message if sign-up fails
    }
  };

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}  // Update email state
        />

        <label>Password</label>
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}  // Update password state
        />

        <button type="submit">Sign Up</button>
      </form>

      {/* Display any error messages */}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Signup;
