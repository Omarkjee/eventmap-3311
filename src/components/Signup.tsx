import React, { useState } from 'react';
import { signUp } from '../utils/firebaseAuth';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';

interface SignupProps {
  onSignUpSuccess?: () => void | undefined;
  clearFormOnUnmount?: boolean;
}

const Signup: React.FC<SignupProps> = ({ onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  const allowedDomains = ["@mavs.uta.edu", "@uta.edu"]; // Allowed domains

  // Check if the email domain is valid
  const isEmailAllowed = allowedDomains.some((domain) => email.endsWith(domain));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isEmailAllowed) {
      setError("Only UTA email addresses are allowed (e.g., @mavs.uta.edu or @uta.edu).");
      return;
    }

    if (!passwordRequirements.test(password)) {
      setError("Password must contain at least 8 characters, one capital letter, one number, and one special character.");
      return;
    }

    try {
      await signUp(email, password);
      setSuccessMessage("Sign up successful! Please check your email for verification.");
      if (onSignUpSuccess) {
        onSignUpSuccess(); // Call the success handler
      }
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
              helperText="Password must be at least 8 characters long, contain one capital letter, one number, and one special character."
          />
          <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!isEmailAllowed} // Disable the button if the email is invalid
          >
            Sign Up
          </Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
      </Box>
  );
};

export default Signup;
