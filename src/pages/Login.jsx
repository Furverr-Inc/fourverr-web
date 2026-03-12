import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Alert, Link, InputAdornment, IconButton as MuiIconButton } from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../services/api';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

/* ── Regex ─────────────────────────────────────────────────── */
// Username: 3-20 chars, solo letras, números, punto y guión bajo
const RX_USERNAME = /^[a-zA-Z0-9._]{3,20}$/;
const RX_EMAIL    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Password: mínimo 8 caracteres, al menos 1 letra y 1 número
const RX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [showPass, setShowPass] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useThemeMode();
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (location.state?.mensaje) setMensajeExito(location.state.mensaje);
    localStorage.clear();
  }, []);

  /* ── Validación en tiempo real ── */
  const validateField = (name, value) => {
    const isEn = lang === 'en';
    let msg = '';
    if (name === 'username') {
      if (!value) msg = isEn ? 'Username or email is required' : 'El usuario o correo es requerido';
      else if (!RX_USERNAME.test(value) && !RX_EMAIL.test(value))
        msg = isEn
          ? 'Enter a valid username or email'
          : 'Ingresa un usuario o correo válido';
    }
    if (name === 'password') {
      if (!value) msg = isEn ? 'Password is required' : 'La contraseña es requerida';
      else if (!RX_PASSWORD.test(value))
        msg = isEn
          ? 'Minimum 8 characters with at least 1 letter and 1 number'
          : 'Mínimo 8 caracteres, con al menos 1 letra y 1 número';
    }
    setFieldErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const okUser = validateField('username', username);
    const okPass = validateField('password', password);
    if (!okUser || !okPass) return;

    setCargando(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, username: userAlias, role, id, nombreMostrado, fotoUrl } = response.data;
      localStorage.setItem('token',        token);
      localStorage.setItem('usuarioNombre', nombreMostrado || userAlias);
      localStorage.setItem('usuarioRol',   role);
      localStorage.setItem('usuarioId',    id);
      localStorage.setItem('usuarioFoto',  fotoUrl || '');
      if (role === 'ADMIN') { navigate('/admin'); } else { navigate('/home'); }
    } catch (err) {
      const isEn = lang === 'en';
      if (err.response?.status === 403)
        setError(err.response.data || (isEn ? 'Your account has been disabled.' : 'Tu cuenta ha sido deshabilitada.'));
      else if (err.response?.status === 401)
        setError(isEn ? 'Incorrect username or password.' : 'Usuario o contraseña incorrectos.');
      else
        setError(isEn ? 'Could not connect to server.' : 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  /* ── Estilos ── */
  const BG_DARK  = '#0D1127';
  const BG_LIGHT = '#F5F5F2';
  const CARD_DARK_TOP    = '#1E2A45';
  const CARD_DARK_BOTTOM = '#0D1127';
  const PERIW = '#8B8FC8';

  const inputSx = {
    mb: 1.5,
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,17,39,0.06)',
      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(13,17,39,0.15)' },
      '&:hover fieldset': { borderColor: PERIW },
      '&.Mui-focused fieldset': { borderColor: PERIW },
    },
    '& .MuiInputLabel-root': {
      color: isDark ? 'rgba(232,233,240,0.5)' : 'rgba(13,17,39,0.45)',
      '&.Mui-focused': { color: PERIW },
    },
    '& .MuiOutlinedInput-input': {
      color: isDark ? '#E8E9F0' : '#0D1127',
      letterSpacing: '0.04em',
    },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark ? BG_DARK : BG_LIGHT,
      position: 'relative',
    }}>
      {/* Botón volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute', top: 20, left: 20,
          color: isDark ? 'rgba(232,233,240,0.7)' : 'rgba(13,17,39,0.5)',
          textTransform: 'none',
          '&:hover': { color: PERIW, background: 'transparent' },
        }}
      >
        {lang === 'en' ? 'Back' : 'Volver'}
      </Button>

      {/* Card principal */}
      <Box sx={{
        width: '100%', maxWidth: 400, mx: 2,
        borderRadius: 4, overflow: 'hidden',
        boxShadow: isDark
          ? '0 24px 80px rgba(0,0,0,0.7)'
          : '0 16px 60px rgba(13,17,39,0.18)',
      }}>
        {/* Zona superior: logo */}
        <Box sx={{
          background: isDark
            ? `linear-gradient(180deg, ${CARD_DARK_TOP} 0%, ${CARD_DARK_BOTTOM} 100%)`
            : '#FFFFFF',
          py: 5, px: 4, textAlign: 'center',
        }}>
          {/* Logo SVG inline — símbolo Futark adaptado */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="36,4 60,20 60,52 36,68 12,52 12,20"
                fill="none"
                stroke={isDark ? '#C8CAD4' : '#0D1127'}
                strokeWidth="3"
              />
              <text
                x="36" y="46"
                textAnchor="middle"
                fontSize="28"
                fontWeight="800"
                fontFamily="Inter, sans-serif"
                fill={isDark ? '#C8CAD4' : '#0D1127'}
              >Z</text>
            </svg>
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{
            color: isDark ? '#E8E9F0' : '#0D1127',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            Zento
          </Typography>
          <Typography variant="caption" sx={{
            color: isDark ? 'rgba(200,202,212,0.55)' : 'rgba(13,17,39,0.4)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {lang === 'en' ? 'Marketplace' : 'Mercado Digital'}
          </Typography>
        </Box>

        {/* Zona inferior: formulario */}
        <Box sx={{
          background: isDark ? CARD_DARK_BOTTOM : '#0D1127',
          px: 4, py: 4,
        }}>
          {mensajeExito && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{mensajeExito}</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label={t.userOrEmail || 'USERNAME'}
              required
              value={username}
              onChange={e => { setUsername(e.target.value); validateField('username', e.target.value); }}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              autoFocus
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  ...inputSx['& .MuiOutlinedInput-root'],
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(200,202,212,0.5)',
                  '&.Mui-focused': { color: PERIW },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#E8E9F0',
                  textAlign: 'center',
                  letterSpacing: '0.06em',
                },
                '& .MuiFormHelperText-root': { color: '#F87171' },
              }}
            />
            <TextField
              fullWidth
              label={t.password || 'PASSWORD'}
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: 0.5 }}>
                    <MuiIconButton
                      onClick={() => setShowPass(p => !p)}
                      tabIndex={-1}
                      size="small"
                      sx={{
                        width: 30, height: 30,
                        color: isDark ? 'rgba(232,233,240,0.5)' : 'rgba(13,17,39,0.35)',
                        borderRadius: '50%',
                        '&:hover': {
                          color: PERIW,
                          bgcolor: isDark ? 'rgba(139,143,200,0.15)' : 'rgba(139,143,200,0.12)',
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      {showPass
                        ? <VisibilityOffIcon sx={{ fontSize: 17 }} />
                        : <VisibilityIcon    sx={{ fontSize: 17 }} />}
                    </MuiIconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-root': {
                  ...inputSx['& .MuiOutlinedInput-root'],
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(200,202,212,0.5)',
                  '&.Mui-focused': { color: PERIW },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#E8E9F0',
                  letterSpacing: '0.12em',
                  paddingLeft: '16px',
                },
                '& .MuiFormHelperText-root': { color: '#F87171' },
              }}
            />

            <Button
              fullWidth variant="contained" size="large" type="submit"
              disabled={cargando}
              sx={{
                mt: 2, mb: 2, py: 1.5,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                borderRadius: '50px',
                backgroundColor: PERIW,
                color: '#fff',
                fontSize: '0.95rem',
                '&:hover': { backgroundColor: '#6B6FAE' },
                '&:disabled': { backgroundColor: 'rgba(139,143,200,0.4)', color: '#fff' },
              }}
            >
              {cargando ? (t.loggingIn || 'Ingresando...') : (t.login || 'LOGIN')}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: 'rgba(200,202,212,0.55)' }}>
                {lang === 'en' ? 'Forgot your password?' : '¿Olvidaste tu contraseña?'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(200,202,212,0.55)' }}>
                {t.newHere || (lang === 'en' ? "Don't have an account?" : '¿No tienes cuenta?')}{' '}
                <Link component={RouterLink} to="/registro" underline="hover"
                  sx={{ color: PERIW, fontWeight: 700 }}>
                  {t.createAccount || (lang === 'en' ? 'Sign up' : 'Regístrate')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
