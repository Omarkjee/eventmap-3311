import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../utils/firebaseAuth';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Box, Button, TextField, Typography, Alert, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordDialog, setForgotPasswordDialog] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate('/events');  // Redirect to event list after successful login

      // Fallback in case navigate does not work as expected
      setTimeout(() => {
        window.location.href = '/events';
      }, 100);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMessage(null);
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
      setForgotPasswordDialog(false);
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
        <Link
          component="button"
          variant="body2"
          onClick={() => setForgotPasswordDialog(true)}
          sx={{ mt: 1, textAlign: 'right', display: 'block' }}
        >
          Forgot Password?
        </Link>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
      </form>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

      <Dialog open={forgotPasswordDialog} onClose={() => setForgotPasswordDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address to receive a password reset link.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleForgotPassword} color="primary">Send Reset Link</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
