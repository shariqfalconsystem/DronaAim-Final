import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { confirmResetPassword } from 'aws-amplify/auth';
import { toast } from 'react-toastify';
import LoginContainer from '../../components/organisms/login-container';
import { paths } from '../../common/constants/routes';

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    const codeParam = queryParams.get('code');
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [location.search]);

  const emailRegex = /^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

  const passwordRequirements = [
    { regex: /.{8,}/, message: 'Minimum 8 characters' },
    { regex: /[A-Z]/, message: 'At least 1 uppercase letter' },
    { regex: /[a-z]/, message: 'At least 1 lowercase letter' },
    { regex: /[0-9]/, message: 'At least 1 number' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'At least 1 special character' },
  ];

  const validatePassword = (password: string) => {
    for (const requirement of passwordRequirements) {
      if (!requirement.regex.test(password)) {
        return requirement.message;
      }
    }
    return '';
  };

  const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please enter a valid email address.');
      toast.error('Invalid email format. Please enter a valid email address.');
      return;
    }

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New Password and Confirm Password do not match.');

      setError('New Password and Confirm Password do not match.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      const message = 'Password reset successfully! You can now log in.';
      setSuccess(message);
      toast.success(message);
      setTimeout(() => {
        navigate(paths.LOGIN);
      }, 3000);
    } catch (err: any) {
      const message = err.message || 'An error occurred. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400,
          mx: 'auto',
          mt: 4,
          p: 3,
          boxShadow: 2,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Reset Password
        </Typography>
        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success" variant="body2" gutterBottom>
            {success}
          </Typography>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
        <TextField
          label="Verification Code"
          type="text"
          fullWidth
          margin="normal"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={handleNewPasswordChange}
          autoComplete="new-password"
          helperText={passwordError || ' '}
          error={!!passwordError}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          Reset Password
        </Button>
      </Box>
    </LoginContainer>
  );
};

export default ResetPassword;
