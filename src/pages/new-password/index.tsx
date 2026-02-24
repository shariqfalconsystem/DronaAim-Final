import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Container, Box } from '@mui/material';
import { toast } from 'react-toastify';

interface NewPasswordComponentProps {
  onSubmit: (newPassword: string) => Promise<void>;
}

const NewPasswordComponent: React.FC<NewPasswordComponentProps> = ({ onSubmit }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Password Validation Regex
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await onSubmit(newPassword);
    } catch (err: any) {
      toast.error(`An error occurred. Please try again.`);
      setError(err.message || 'Failed to set new password. Please try again.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        boxShadow: 2,
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      <Typography variant="h6" gutterBottom textAlign="center">
        Change Password
      </Typography>
      <TextField
        id="newPassword"
        label="New Password"
        type="password"
        variant="outlined"
        fullWidth
        value={newPassword}
        onChange={handleNewPasswordChange}
        margin="normal"
        required
        helperText={passwordError || ' '}
        error={!!passwordError}
      />
      <TextField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        margin="normal"
        required
        helperText={error || ' '}
        error={!!error}
      />
      <Grid container sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <Button variant="contained" color="primary" type="submit" disabled={!!passwordError}>
          Submit
        </Button>
      </Grid>
    </Box>
  );
};

export default NewPasswordComponent;
