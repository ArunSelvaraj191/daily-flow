import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  Link
} from '@mui/material';
import { loginUser, clearAuthError } from './authSlice.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    dispatch(loginUser(data));
  };

  const handleFillDemo = () => {
    setValue('email', 'alex@dailyflow.app');
    setValue('password', 'FlowPassword123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2.5
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', p: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3.5,
                bgcolor: 'primary.main',
                color: '#FFF',
                fontWeight: 800,
                fontSize: '1.4rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(255, 87, 34, 0.4)',
                mb: 1.5
              }}
            >
              DF
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your DailyFlow account
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              {...register('email')}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register('password')}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ py: 1.2, fontWeight: 700 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={handleFillDemo}
            sx={{ borderRadius: 2.5 }}
          >
            Fill Demo Credentials
          </Button>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" color="primary" sx={{ fontWeight: 700 }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
