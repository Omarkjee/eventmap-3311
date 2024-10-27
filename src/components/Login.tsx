import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../utils/firebaseAuth';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate('/events');  // Redirect to event list after successful login

      // Fallback to ensure redirection in case navigate does not work as expected
      setTimeout(() => {
        window.location.href = '/events';
      }, 100);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3} boxShadow={3} borderRadius={2} maxWidth={400} margin="auto">
        <Typography variant="h4" gutterBottom>Login</Typography>
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
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
  );
};

export default Login;