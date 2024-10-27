import React, { useState } from 'react';
import { signUp } from '../utils/firebaseAuth';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);  // Clear previous errors
    setSuccessMessage(null);  // Clear previous success messages

    try {
      await signUp(email, password);
      setSuccessMessage("Sign up successful! Please check your email for verification.");
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3} boxShadow={3} borderRadius={2} maxWidth={400} margin="auto">
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />
          <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
      </Box>
  );
};

export default Signup;
