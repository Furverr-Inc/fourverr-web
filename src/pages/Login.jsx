import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Typography, Box, Alert, Link, InputAdornment,
  IconButton as MuiIconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../services/api';
import { clearAuthLocalStorage } from '../utils/authLocalStorage';
import { useThemeMode } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import SoporteFloating from '../components/SoporteFloating';
import { GoogleLogin } from '@react-oauth/google';

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

  // Recuperar contraseña
  const [forgotOpen,    setForgotOpen]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError,   setForgotError]   = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useThemeMode();
  const { t, lang } = useLanguage();

  useEffect(() => {
    if (location.state?.mensaje) setMensajeExito(location.state.mensaje);
    clearAuthLocalStorage();
  }, []);

  /* ── Validación al enviar el formulario (vacío + formato) ── */
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
      localStorage.setItem('usuarioUsername', userAlias);
      localStorage.setItem('usuarioRol',   role);
      localStorage.setItem('usuarioId',    id);
      localStorage.setItem('usuarioFoto',  fotoUrl || '');
      if (role === 'ADMIN') { navigate('/admin'); } else { navigate('/home'); }
    } catch (err) {
      const isEn = lang === 'en';
      const status = err.response?.status;
      const raw = err.response?.data;
      const bodyStr = typeof raw === 'string' ? raw : (raw?.message != null ? String(raw.message) : '');

      // Solo 403 con mensaje explícito de deshabilitación (API); otros 403/401 = credenciales u acceso denegado genérico
      const cuentaDeshabilitada =
        status === 403 &&
        bodyStr &&
        /deshabilitad|disabled|habilitad/i.test(bodyStr);

      if (cuentaDeshabilitada) {
        setError(bodyStr);
      } else if (status === 401 || status === 403) {
        setError(isEn ? 'Incorrect username or password.' : 'Usuario o contraseña incorrectos.');
      } else {
        setError(isEn ? 'Could not connect to server.' : 'No se pudo conectar con el servidor.');
      }
    } finally {
      setCargando(false);
    }
  };

  /* ── Recuperar contraseña ── */
  const abrirRecuperar = () => {
    const prefill = RX_EMAIL.test(username) ? username : '';
    setForgotEmail(prefill);
    setForgotError('');
    setForgotSuccess('');
    setForgotOpen(true);
  };

  const enviarRecuperar = async () => {
    const isEn = lang === 'en';
    setForgotError(''); setForgotSuccess('');
    if (!RX_EMAIL.test(forgotEmail)) {
      setForgotError(isEn ? 'Enter a valid email.' : 'Ingresa un correo válido.');
      return;
    }
    setForgotLoading(true);
    try {
      await api.post('/soporte/contacto', {
        nombre:  isEn ? 'Password recovery request' : 'Solicitud de recuperación de contraseña',
        email:   forgotEmail,
        mensaje: isEn
          ? `The user with email ${forgotEmail} forgot their password and is requesting help to recover it.`
          : `El usuario con correo ${forgotEmail} olvidó su contraseña y solicita ayuda para recuperarla.`,
      });
      setForgotSuccess(isEn
        ? 'Request sent. Our team will contact you soon at this email.'
        : 'Solicitud enviada. Nuestro equipo te contactará pronto a este correo.');
      setForgotEmail('');
    } catch {
      setForgotError(isEn
        ? 'Could not send the request. Try again later.'
        : 'No se pudo enviar la solicitud. Inténtalo más tarde.');
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Handler para login con Google (OAuth) ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setCargando(true);
    setError('');
    try {
      const tokenGoogle = credentialResponse.credential;
      
      const response = await api.post('/auth/google', { token: tokenGoogle });

      const { token, username: userAlias, role, id, nombreMostrado, fotoUrl } = response.data;
      localStorage.setItem('token',        token);
      localStorage.setItem('usuarioNombre', nombreMostrado || userAlias);
      localStorage.setItem('usuarioUsername', userAlias);
      localStorage.setItem('usuarioRol',   role);
      localStorage.setItem('usuarioId',    id);
      localStorage.setItem('usuarioFoto',  fotoUrl || '');

      if (role === 'ADMIN') { navigate('/admin'); } else { navigate('/home'); }

    } catch (err) {
      console.error("Error en Google Login:", err);
      const isEn = lang === 'en';
      const status = err.response?.status;
      const raw = err.response?.data;
      const bodyStr = typeof raw === 'string' ? raw : (raw?.message != null ? String(raw.message) : '');

      if (status === 403 && bodyStr && /deshabilitad/i.test(bodyStr)) {
        setError(bodyStr);
      } else {
        setError(isEn ? 'Google login failed.' : 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleError = () => {
    const isEn = lang === 'en';
    setError(isEn ? 'Google Login was canceled.' : 'El inicio de sesión con Google fue cancelado.');
  };

  /* ── Estilos ── */
  const BG_DARK  = '#0D1127';
  const BG_LIGHT = '#F5F5F2';
  const CARD_DARK_TOP    = '#1E2A45';
  const CARD_DARK_BOTTOM = '#0D1127';
  const PERIW = '#8B8FC8';

  const inputSx = {
    mb: 3,
    /* La etiqueta outlined usa translateY negativo al hacer shrink; el overflow:hidden por defecto de MUI recorta el texto. */
    overflow: 'visible',
    '& .MuiOutlinedInput-root': {
      borderRadius: '50px',
      backgroundColor: '#FFFFFF',
      '& fieldset': { borderColor: 'rgba(209,213,219,0.9)' },
      '&:hover fieldset': { borderColor: PERIW },
      '&.Mui-focused fieldset': { borderColor: PERIW },
    },
    '& .MuiInputLabel-root': {
      color: '#9CA3AF',
      overflow: 'visible',
      textOverflow: 'clip',
      zIndex: 1,
      /*
       * Con -2px el texto quedaba demasiado abajo (el borde cortaba las letras).
       * Valor MUI outlined medium: translate(14px, -9px). En píldora elevamos más el shrink
       * para que el label quede claramente sobre el borde y no pise el campo de arriba.
       */
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -20px) scale(0.75)',
      },
      '&.Mui-focused': { color: PERIW },
    },
    '& .MuiOutlinedInput-input': {
      color: '#374151',
      letterSpacing: '0.04em',
    },
  };

  return (
    <>
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
          pt: 3, pb: 2, px: 4, textAlign: 'center',
        }}>
          {mensajeExito && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 3, textAlign: 'left' }}>{mensajeExito}</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3, textAlign: 'left' }}>{error}</Alert>
          )}
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
          px: 4, pt: 4, pb: 4,
          overflow: 'visible',
        }}>
          <Box component="form" noValidate onSubmit={handleLogin}>
            <TextField
              fullWidth
              label={t.userOrEmail || 'USERNAME'}
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setFieldErrors((prev) => ({ ...prev, username: '' }));
              }}
              onFocus={() => setFieldErrors({ username: '', password: '' })}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              autoFocus
              sx={{
                ...inputSx,
                '& .MuiOutlinedInput-input': {
                  ...inputSx['& .MuiOutlinedInput-input'],
                  letterSpacing: '0.06em',
                },
                '& .MuiFormHelperText-root': { color: '#F87171' },
              }}
            />
            {/* Campo contraseña + ojo FUERA del pill */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1 }}>
              <TextField
                fullWidth
                label={t.password || 'PASSWORD'}
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
                onFocus={() => setFieldErrors({ username: '', password: '' })}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                sx={{
                  ...inputSx,
                  mb: 0,
                  '& .MuiOutlinedInput-input': {
                    ...inputSx['& .MuiOutlinedInput-input'],
                    letterSpacing: '0.12em',
                  },
                  '& .MuiFormHelperText-root': { color: '#F87171' },
                }}
              />
              {/* Ojo flotante FUERA del input */}
              <MuiIconButton
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
                size="small"
                sx={{
                  flexShrink: 0,
                  width: 38, height: 38,
                  color: '#6B7280',
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid rgba(209,213,219,0.9)',
                  borderRadius: '50%',
                  '&:hover': {
                    color: PERIW,
                    borderColor: PERIW,
                    bgcolor: 'rgba(139,143,200,0.08)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {showPass
                  ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  : <VisibilityIcon    sx={{ fontSize: 18 }} />}
              </MuiIconButton>
            </Box>
            <Box sx={{ mb: 1.5 }} />

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

            <Box sx={{ 
              my: 3, 
              display: 'flex', 
              alignItems: 'center', 
              '&::before': { content: '""', flex: 1, borderBottom: '1px solid rgba(200,202,212,0.2)' }, 
              '&::after':  { content: '""', flex: 1, borderBottom: '1px solid rgba(200,202,212,0.2)' } 
            }}>
              <Typography variant="caption" sx={{ 
                color: 'rgba(200,202,212,0.5)', 
                px: 2, 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em' 
              }}>
                {lang === 'en' ? 'OR' : 'O'}
              </Typography>
            </Box>

            {/* ── Botón de Google ── */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme={isDark ? 'filled_black' : 'outline'}
                shape="pill"
                size="large"
                text="continue_with"
                width="100%"
              />
            </Box>

            <Box textAlign="center">
              <Link
                component="button"
                type="button"
                onClick={abrirRecuperar}
                underline="hover"
                sx={{
                  color: PERIW,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  p: 0,
                }}
              >
                {lang === 'en' ? 'Forgot your password?' : '¿Olvidaste tu contraseña?'}
              </Link>
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

    {/* ── Diálogo: Recuperar contraseña ── */}
    <Dialog
      open={forgotOpen}
      onClose={() => !forgotLoading && setForgotOpen(false)}
      PaperProps={{ sx: { borderRadius: 3, maxWidth: 440 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '50%',
          bgcolor: 'rgba(139,143,200,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LockResetIcon sx={{ color: PERIW, fontSize: 22 }} />
        </Box>
        {lang === 'en' ? 'Recover password' : 'Recuperar contraseña'}
      </DialogTitle>

      <DialogContent>
        {forgotError   && <Alert severity="error"   sx={{ mb: 2 }}>{forgotError}</Alert>}
        {forgotSuccess && <Alert severity="success" sx={{ mb: 2 }}>{forgotSuccess}</Alert>}
        {!forgotSuccess && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {lang === 'en'
                ? 'Enter the email registered with your account. Our support team will contact you to help you reset your password.'
                : 'Ingresa el correo registrado en tu cuenta. Nuestro equipo de soporte te contactará para ayudarte a restablecerla.'}
            </Typography>
            <TextField
              fullWidth autoFocus
              type="email"
              label={lang === 'en' ? 'Email' : 'Correo electrónico'}
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              disabled={forgotLoading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          fullWidth variant="outlined"
          onClick={() => setForgotOpen(false)}
          disabled={forgotLoading}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {forgotSuccess ? (lang === 'en' ? 'Close' : 'Cerrar') : (lang === 'en' ? 'Cancel' : 'Cancelar')}
        </Button>
        {!forgotSuccess && (
          <Button
            fullWidth variant="contained"
            onClick={enviarRecuperar}
            disabled={forgotLoading}
            startIcon={forgotLoading ? <CircularProgress size={16} color="inherit" /> : <LockResetIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: PERIW, '&:hover': { bgcolor: '#6B6FAE' } }}
          >
            {forgotLoading
              ? (lang === 'en' ? 'Sending...' : 'Enviando...')
              : (lang === 'en' ? 'Send request' : 'Enviar solicitud')}
          </Button>
        )}
      </DialogActions>
    </Dialog>

    <SoporteFloating />
    </>
  );
};

export default Login;
