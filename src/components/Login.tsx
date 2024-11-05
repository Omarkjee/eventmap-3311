import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../utils/firebaseAuth';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Box, Button, TextField, Typography, Alert, Link, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface LoginProps {
  onLoginSuccess: () => void; 
  clearFormOnUnmount: boolean; 
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, clearFormOnUnmount }) => {
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
      onLoginSuccess();
      navigate('/events');
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

  // Clear form fields on unmount or when clearFormOnUnmount prop changes
  useEffect(() => {
    return () => {
      if (clearFormOnUnmount) {
        setEmail('');
        setPassword('');
      }
    };
  }, [clearFormOnUnmount]);

  // Focus on email input field when dialog opens
  useEffect(() => {
    if (forgotPasswordDialog) {
      const input = document.getElementById('email-input');
      if (input) {
        input.focus(); // Focus the email input field when the dialog opens
      }
    }
  }, [forgotPasswordDialog]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={3} boxShadow={3} borderRadius={2} maxWidth={400} margin="auto">
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          id="email-input" // Added id for focusing
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
      <Link
        component="button"
        variant="body2"
        onClick={(e) => {
          e.preventDefault();
          setForgotPasswordDialog(true);
        }}
        sx={{ mt: 1, textAlign: 'right', display: 'block' }}
      >
        Forgot Password?
      </Link>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

      <Dialog open={forgotPasswordDialog} onClose={() => setForgotPasswordDialog(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address to receive a password reset link.
          </DialogContentText>
          <TextField
            id="email-input" // Added id for focusing
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
