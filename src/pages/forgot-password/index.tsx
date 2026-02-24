import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { resetPassword, type ResetPasswordOutput } from 'aws-amplify/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoginContainer from '../../components/organisms/login-container';
import { paths } from '../../common/constants/routes';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('Invalid email format. Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const output: ResetPasswordOutput = await resetPassword({ username: email });
      if (output.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        toast.success(
          `Verification code sent via ${output.nextStep.codeDeliveryDetails?.deliveryMedium}. Check your email or phone.`
        );

        setSuccess(
          `Verification code sent via ${output.nextStep.codeDeliveryDetails?.deliveryMedium}. Check your email or phone.`
        );

        setTimeout(() => {
          navigate(paths.RESETPASSWORD);
        }, 3000);
      }
    } catch (err: any) {
      toast.error(`An error occurred. Please try again.`);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false); // Stop loading
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
        <Typography variant="h6" align="center" gutterBottom>
          Forgot Password
        </Typography>
        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}

        {success ? (
          <Typography color="green" variant="body2" sx={{ fontWeight: '500', mt: 2 }} gutterBottom>
            {success}
          </Typography>
        ) : (
          <>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
              Submit
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#EBF0F4' }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </>
        )}
      </Box>
    </LoginContainer>
  );
};

export default ForgotPassword;
