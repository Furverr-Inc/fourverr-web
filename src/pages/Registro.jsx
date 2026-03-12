import React, { useState } from 'react';
import {
  TextField, Button, Typography, Box, Alert, Link,
  InputAdornment, IconButton as MuiIconButton, LinearProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon    from '@mui/icons-material/ArrowBack';
import VisibilityIcon   from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage }  from '../LanguageContext';

/* ── Regex ─────────────────────────────────────────────────── */
const RX_NOMBRE   = /^.{2,50}$/;
const RX_USERNAME = /^[a-zA-Z0-9._]{3,20}$/;
const RX_EMAIL    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/* ── Fuerza de contraseña ─────────────────────────────────── */
const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  return score; // 0-4
};
const STRENGTH_LABEL_ES = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
const STRENGTH_LABEL_EN = ['', 'Weak',  'Fair',    'Good',  'Strong'];
const STRENGTH_COLOR = ['', '#F87171', '#FBBF24', '#34D399', '#10b981'];

const Registro = () => {
  const navigate  = useNavigate();
  const { isDark } = useThemeMode();
  const { t, lang } = useLanguage();

  const [form, setForm] = useState({
    nombreMostrado: '', username: '', email: '', password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const strength = passwordStrength(form.password);

  /* ── Validación campo por campo ── */
  const validateField = (name, value) => {
    let msg = '';
    const isEn = lang === 'en';
    if (name === 'nombreMostrado') {
      if (!value.trim()) msg = isEn ? 'Name is required' : 'El nombre es requerido';
      else if (!RX_NOMBRE.test(value)) msg = isEn ? 'Minimum 2 characters' : 'Mínimo 2 caracteres';
    }
    if (name === 'username') {
      if (!value) msg = isEn ? 'Username is required' : 'El usuario es requerido';
      else if (!RX_USERNAME.test(value))
        msg = isEn
          ? '3-20 chars: letters, numbers, dot or underscore. No spaces.'
          : '3-20 caracteres: letras, números, punto o guión bajo. Sin espacios.';
    }
    if (name === 'email') {
      if (!value) msg = isEn ? 'Email is required' : 'El email es requerido';
      else if (!RX_EMAIL.test(value)) msg = isEn ? 'Invalid email format' : 'Formato de email inválido';
    }
    if (name === 'password') {
      if (!value) msg = isEn ? 'Password is required' : 'La contraseña es requerida';
      else if (!RX_PASSWORD.test(value))
        msg = isEn
          ? 'At least 8 characters with 1 letter and 1 number'
          : 'Mínimo 8 caracteres con al menos 1 letra y 1 número';
    }
    setFieldErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = Object.keys(form).every(k => validateField(k, form[k]));
    if (!ok) return;

    setCargando(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { mensaje: '¡Cuenta creada con éxito! Ahora inicia sesión.' } });
    } catch (err) {
      const isEn = lang === 'en';
      setError(err.response?.status === 409
        ? (isEn ? 'Username or email already exists.' : 'El usuario o correo ya existen.')
        : (isEn ? 'Registration failed. Please try again.' : 'Error al registrarse. Intenta nuevamente.')
      );
    } finally {
      setCargando(false);
    }
  };

  /* ── Estilos ── */
  const PERIW     = '#8B8FC8';
  const BG_DARK   = '#0D1127';
  const BG_LIGHT  = '#F5F5F2';

  const inputBase = {
    mb: 0.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,39,0.04)',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(13,17,39,0.15)' },
      '&:hover fieldset': { borderColor: PERIW },
      '&.Mui-focused fieldset': { borderColor: PERIW },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(232,233,240,0.5)' : 'rgba(13,17,39,0.45)',
      '&.Mui-focused': { color: PERIW },
    },
    '& .MuiOutlinedInput-input': { color: isDark ? '#E8E9F0' : '#0D1127' },
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark ? BG_DARK : BG_LIGHT,
      position: 'relative',
    }}>
      {/* Botón volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute', top: 20, left: 20,
          color: isDark ? 'rgba(232,233,240,0.6)' : 'rgba(13,17,39,0.45)',
          textTransform: 'none',
          '&:hover': { color: PERIW, background: 'transparent' },
        }}
      >
        {lang === 'en' ? 'Back' : 'Volver'}
      </Button>

      <Box sx={{
        width: '100%', maxWidth: 440, mx: 2, p: 4, borderRadius: 4,
        background: isDark ? '#141929' : '#FFFFFF',
        border: isDark ? '1px solid rgba(200,202,212,0.08)' : '1px solid #E0E0D8',
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.6)' : '0 16px 60px rgba(13,17,39,0.14)',
      }}>
        {/* Header */}
        <Typography variant="h4" align="center" fontWeight="800" sx={{
          mb: 0.5,
          color: isDark ? '#E8E9F0' : '#0D1127',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Zento
        </Typography>
        <Typography variant="caption" display="block" align="center" sx={{
          mb: 3,
          color: isDark ? 'rgba(200,202,212,0.45)' : 'rgba(13,17,39,0.4)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          {t.createAccountTitle || 'Crear Cuenta'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label={t.fullName || 'Nombre completo'} name="nombreMostrado"
            required value={form.nombreMostrado} onChange={handleChange}
            error={!!fieldErrors.nombreMostrado} helperText={fieldErrors.nombreMostrado}
            sx={{ ...inputBase, mb: fieldErrors.nombreMostrado ? 0.5 : 1.5 }}
          />
          <TextField
            fullWidth label={t.username || 'Nombre de usuario'} name="username"
            required value={form.username} onChange={handleChange}
            error={!!fieldErrors.username} helperText={fieldErrors.username}
            sx={{ ...inputBase, mb: fieldErrors.username ? 0.5 : 1.5 }}
          />
          <TextField
            fullWidth label={t.email || 'Email'} name="email" type="email"
            required value={form.email} onChange={handleChange}
            error={!!fieldErrors.email} helperText={fieldErrors.email}
            sx={{ ...inputBase, mb: fieldErrors.email ? 0.5 : 1.5 }}
          />
          <TextField
            fullWidth label={t.password || 'Contraseña'} name="password"
            type={showPass ? 'text' : 'password'}
            required value={form.password} onChange={handleChange}
            error={!!fieldErrors.password} helperText={fieldErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton
                      onClick={() => setShowPass(p => !p)}
                      edge="end"
                      tabIndex={-1}
                      sx={{
                        color: isDark ? 'rgba(232,233,240,0.6)' : 'rgba(13,17,39,0.4)',
                        mr: -0.5,
                        '&:hover': { color: PERIW, background: 'transparent' },
                      }}
                    >
                      {showPass ? <VisibilityOffIcon sx={{ fontSize: 20 }} /> : <VisibilityIcon sx={{ fontSize: 20 }} />}
                    </MuiIconButton>
                </InputAdornment>
              ),
            }}
            sx={{ ...inputBase, mb: form.password ? 0.5 : 1.5 }}
          />

          {/* Barra fuerza contraseña */}
          {form.password && (
            <Box sx={{ mb: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={(strength / 4) * 100}
                sx={{
                  height: 5, borderRadius: 3,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,39,0.08)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: STRENGTH_COLOR[strength] || PERIW,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: STRENGTH_COLOR[strength], fontWeight: 600 }}>
                {(lang === 'en' ? STRENGTH_LABEL_EN : STRENGTH_LABEL_ES)[strength]}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth variant="contained" size="large" type="submit"
            disabled={cargando}
            sx={{
              mt: 1, mb: 2, py: 1.5,
              fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              borderRadius: '50px',
              backgroundColor: PERIW,
              color: '#fff',
              '&:hover': { backgroundColor: '#6B6FAE' },
              '&:disabled': { backgroundColor: 'rgba(139,143,200,0.4)', color: '#fff' },
            }}
          >
            {cargando ? 'Registrando...' : (t.register || 'Crear cuenta')}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2"
              sx={{ color: isDark ? 'rgba(200,202,212,0.55)' : 'rgba(13,17,39,0.5)' }}>
              {t.alreadyHaveAccount || '¿Ya tienes cuenta?'}{' '}
              <Link component={RouterLink} to="/login" underline="hover"
                sx={{ color: PERIW, fontWeight: 700 }}>
                {t.signIn || 'Inicia sesión'}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Registro;
