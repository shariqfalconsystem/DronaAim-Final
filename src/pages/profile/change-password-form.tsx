import React, { useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { paths } from '../../common/constants/routes';
import { useSelector } from 'react-redux';
import { updatePassword } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

interface ChangePasswordFormProps {}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({}) => {
  const role = useSelector((state: any) => state.auth.currentUserRole);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, message: 'Minimum 8 characters' },
      { regex: /[A-Z]/, message: 'At least 1 uppercase letter' },
      { regex: /[a-z]/, message: 'At least 1 lowercase letter' },
      { regex: /[0-9]/, message: 'At least 1 number' },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'At least 1 special character' },
    ];

    for (const requirement of requirements) {
      if (!requirement.regex.test(password)) {
        return requirement.message;
      }
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully!');
      if (role === 'fleetManager' || role === 'fleetManagerSuperUser') {
        navigate(paths.DASHBOARD);
      } else if (role === 'insurer' || role === 'insurerSuperUser') {
        navigate(paths.INSURERDASHBOARD);
      } else if (role === 'admin') {
        navigate(paths.ADMIN);
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while changing the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, color: 'grey.900' }}>
        Change password
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: 400 }}>
        <TextField
          fullWidth
          type={showOldPassword ? 'text' : 'password'}
          placeholder="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              height: 48,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                  {showOldPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          type={showNewPassword ? 'text' : 'password'}
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{
            mb: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              height: 48,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 3,
            color: 'primary.main',
            fontSize: '0.75rem',
          }}
        >
          Password must be at least 8 characters, with one uppercase letter, one lowercase letter, one number, and one
          special character
        </Typography>

        <TextField
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              height: 48,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            height: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePasswordForm;
