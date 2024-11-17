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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  const allowedDomains = ["@mavs.uta.edu", "@uta.edu"]; // Allowed domains

  // Check if the email domain is valid
  const isEmailAllowed = allowedDomains.some((domain) => email.endsWith(domain));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    if (!isEmailAllowed) {
      setError("Only UTA email addresses are allowed (e.g., @mavs.uta.edu or @uta.edu).");
      setIsSubmitting(false);
      return;
    }

    if (!passwordRequirements.test(password)) {
      setError("Password must contain at least 8 characters, one capital letter, one number, and one special character.");
      setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false); // Re-enable form inputs
    }
  };

  return (
      <>
        {/* Display success or error messages outside the signup box */}
        {successMessage && (
            <Alert severity="success" sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, maxWidth: '90%' }}>
              {successMessage}
            </Alert>
        )}
        {error && (
            <Alert severity="error" sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, maxWidth: '90%' }}>
              {error}
            </Alert>
        )}

        {/* Signup form */}
        <Box display="flex" flexDirection="column" alignItems="center" p={3} boxShadow={3} borderRadius={2} maxWidth={400} margin="auto">
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helperText="Must register with a valid UTA student or faculty Email Address"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!isEmailAllowed || isSubmitting}
            >
              {isSubmitting ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Box>
      </>
  );
};

export default Signup;
