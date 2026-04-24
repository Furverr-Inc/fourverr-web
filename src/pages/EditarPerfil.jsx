import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button,
  Alert, CircularProgress, Divider, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon        from '@mui/icons-material/Save';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import InstagramIcon   from '@mui/icons-material/Instagram';
import TwitterIcon     from '@mui/icons-material/Twitter';
import LinkedInIcon    from '@mui/icons-material/LinkedIn';
import LanguageIcon    from '@mui/icons-material/Language';
import PhoneIcon       from '@mui/icons-material/Phone';
import LocationOnIcon  from '@mui/icons-material/LocationOn';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import LockResetIcon   from '@mui/icons-material/LockReset';
import VisibilityIcon  from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton as MuiIconButton } from '@mui/material';
import api from '../services/api';

const RX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [mensaje,      setMensaje]      = useState('');
  const [esError,      setEsError]      = useState(false);
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [eliminando,   setEliminando]   = useState(false);
  const [confirmText,  setConfirmText]  = useState('');

  // Cambio de contraseña
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdNueva,      setPwdNueva]      = useState('');
  const [pwdConfirmar,  setPwdConfirmar]  = useState('');
  const [pwdLoading,    setPwdLoading]    = useState(false);
  const [pwdError,      setPwdError]      = useState('');
  const [showPwd2, setShowPwd2] = useState(false);
  const [showPwd3, setShowPwd3] = useState(false);

  const [form, setForm] = useState({
    nombreMostrado: '', email: '', descripcion: '',
    telefono: '', ciudad: '', pais: '',
    sitioWeb: '', instagram: '', twitter: '', linkedin: '',
    clabe: '',
  });

  useEffect(() => {
    api.get('/users/perfil').then(res => {
      const d = res.data;
      setForm({
        nombreMostrado: d.nombreMostrado || '',
        email:          d.email          || '',
        descripcion:    d.descripcion    || '',
        telefono:       d.telefono       || '',
        ciudad:         d.ciudad         || '',
        pais:           d.pais           || '',
        sitioWeb:       d.sitioWeb       || '',
        instagram:      d.instagram      || '',
        twitter:        d.twitter        || '',
        linkedin:       d.linkedin       || '',
        clabe:          d.clabe          || '',
      });
    }).catch(() => setEsError(true))
      .finally(() => setLoading(false));
  }, []);

  const f = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleEliminarCuenta = async () => {
    setEliminando(true);
    try {
      await api.delete('/users/perfil/eliminar-cuenta');
      // Limpiar sesión local y redirigir
      localStorage.clear();
      navigate('/', { replace: true });
    } catch {
      setMensaje('Error al eliminar la cuenta. Intenta nuevamente.');
      setEsError(true);
      setDialogOpen(false);
    } finally {
      setEliminando(false);
    }
  };

  const abrirDialogoPassword = () => {
    setPwdNueva(''); setPwdConfirmar('');
    setPwdError(''); setShowPwd2(false); setShowPwd3(false);
    setPwdDialogOpen(true);
  };

  const handleCambiarPassword = async () => {
    setPwdError('');
    if (!pwdNueva || !pwdConfirmar) {
      setPwdError('Completa todos los campos'); return;
    }
    if (!RX_PASSWORD.test(pwdNueva)) {
      setPwdError('La nueva contraseña debe tener mínimo 8 caracteres, con al menos 1 letra y 1 número'); return;
    }
    if (pwdNueva !== pwdConfirmar) {
      setPwdError('Las contraseñas no coinciden'); return;
    }
    setPwdLoading(true);
    try {
      await api.put('/users/perfil/password', {
        passwordNueva: pwdNueva,
      });
      setPwdDialogOpen(false);
      setMensaje('Contraseña actualizada correctamente');
      setEsError(false);
      setTimeout(() => setMensaje(''), 4000);
    } catch (err) {
      const raw = err.response?.data;
      const txt = typeof raw === 'string' ? raw : raw?.message;
      setPwdError(txt || 'No se pudo cambiar la contraseña');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true); setMensaje('');
    try {
      await api.put('/users/perfil', form);
      setMensaje('Perfil actualizado correctamente');
      setEsError(false);
      setTimeout(() => navigate('/perfil'), 1500);
    } catch {
      setMensaje('Error al guardar los cambios'); setEsError(true);
    } finally { setGuardando(false); }
  };

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="sm" sx={{ mt:4, mb:4 }}>
      <Paper elevation={3} sx={{ p:4, borderRadius:3 }}>
        <Box sx={{ display:'flex', alignItems:'center', mb:3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/perfil')}>Volver</Button>
          <Typography variant="h5" fontWeight="bold" sx={{ mx:'auto' }}>Editar Perfil</Typography>
        </Box>

        {mensaje && <Alert severity={esError ? 'error' : 'success'} sx={{ mb:2 }}>{mensaje}</Alert>}

        {/* Info básica */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Información básica</Typography>
        <TextField
          fullWidth label="Nombre mostrado" margin="normal"
          value={form.nombreMostrado} onChange={f('nombreMostrado')}
          autoComplete="name"
        />
        <TextField
          fullWidth label="Email" type="email" margin="normal"
          value={form.email} onChange={f('email')}
          autoComplete="email" inputMode="email"
        />
        <TextField
          fullWidth label="Descripción" margin="normal" multiline rows={3}
          value={form.descripcion} onChange={f('descripcion')}
          placeholder="Cuéntale a todos quién eres y qué haces..."
          inputProps={{ maxLength: 500 }}
          helperText={`${form.descripcion.length}/500`}
        />

        <Divider sx={{ my:3 }} />

        {/* Datos de contacto */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Datos de contacto</Typography>
        <TextField
          fullWidth label="Teléfono" margin="normal"
          value={form.telefono} onChange={f('telefono')}
          autoComplete="tel" inputMode="tel"
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }}
        />
        <Box sx={{ display:'flex', gap:2 }}>
          <TextField
            fullWidth label="Ciudad" margin="normal"
            value={form.ciudad} onChange={f('ciudad')}
            autoComplete="address-level2"
            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField
            fullWidth label="País" margin="normal"
            value={form.pais} onChange={f('pais')}
            autoComplete="country-name"
          />
        </Box>

        <Divider sx={{ my:3 }} />

        {/* Datos bancarios */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Datos bancarios</Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, lineHeight: 1.5 }}>
          Necesaria para recibir el pago cuando solicites un retiro. Solo el administrador la verá al procesar tu solicitud.
        </Typography>
        <TextField
          fullWidth label="CLABE interbancaria (18 dígitos)" margin="normal"
          value={form.clabe} onChange={f('clabe')}
          placeholder="ej. 012345678901234567"
          inputProps={{ maxLength: 18, inputMode: 'numeric', pattern: '[0-9]*' }}
          helperText={form.clabe && form.clabe.length !== 18 ? 'La CLABE debe tener exactamente 18 dígitos' : ' '}
          error={!!form.clabe && form.clabe.length !== 18}
          InputProps={{ startAdornment: <InputAdornment position="start"><span style={{ fontSize: 16 }}>🏦</span></InputAdornment> }}
        />

        <Divider sx={{ my:3 }} />

        {/* Redes sociales */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Redes sociales</Typography>
        <TextField
          fullWidth label="Sitio web" margin="normal"
          value={form.sitioWeb} onChange={f('sitioWeb')}
          placeholder="https://tuweb.com"
          autoComplete="url" inputMode="url"
          InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField
          fullWidth label="Instagram (usuario sin @)" margin="normal"
          value={form.instagram} onChange={f('instagram')}
          InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon fontSize="small" sx={{ color:'#E1306C' }} /></InputAdornment> }}
        />
        <TextField
          fullWidth label="Twitter / X (usuario sin @)" margin="normal"
          value={form.twitter} onChange={f('twitter')}
          InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon fontSize="small" sx={{ color:'#1DA1F2' }} /></InputAdornment> }}
        />
        <TextField
          fullWidth label="LinkedIn (URL completa)" margin="normal"
          value={form.linkedin} onChange={f('linkedin')}
          placeholder="https://linkedin.com/in/tuperfil"
          inputMode="url"
          InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon fontSize="small" sx={{ color:'#0A66C2' }} /></InputAdornment> }}
        />

        <Button fullWidth variant="contained" size="large" startIcon={<SaveIcon />}
          onClick={handleGuardar} disabled={guardando}
          sx={{ mt: 3, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* ── Seguridad ── */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Seguridad</Typography>
        <Button
          fullWidth variant="outlined"
          startIcon={<LockResetIcon />}
          onClick={abrirDialogoPassword}
          sx={{ mt: 1, py: 1.2, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
        >
          Cambiar contraseña
        </Button>

        {/* ── Zona de peligro ── */}
        <Box sx={{
          mt: 4, p: 2.5, borderRadius: 2,
          border: '1.5px solid rgba(239,68,68,0.25)',
          background: 'rgba(239,68,68,0.03)',
        }}>
          <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <WarningAmberIcon sx={{ fontSize: 18 }} /> Zona de peligro
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.82rem' }}>
            Eliminar tu cuenta es <strong>permanente e irreversible</strong>. Se borrarán
            tus publicaciones, compras, reseñas, favoritos y todos tus datos.
          </Typography>
          <Button
            fullWidth variant="outlined" color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => { setConfirmText(''); setDialogOpen(true); }}
            sx={{
              borderRadius: 2, py: 1, fontWeight: 600, textTransform: 'none',
              fontSize: '0.88rem',
              borderColor: 'rgba(239,68,68,0.5)',
              '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' },
            }}
          >
            Eliminar mi cuenta
          </Button>
        </Box>
      </Paper>

      {/* ── Diálogo cambiar contraseña ── */}
      <Dialog open={pwdDialogOpen} onClose={() => !pwdLoading && setPwdDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 440 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LockResetIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          </Box>
          Cambiar contraseña
        </DialogTitle>

        <DialogContent>
          {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Define una nueva contraseña (mínimo 8 caracteres, con letras y números).
          </Typography>
          <TextField
            fullWidth margin="normal"
            label="Nueva contraseña"
            type={showPwd2 ? 'text' : 'password'}
            value={pwdNueva}
            onChange={e => setPwdNueva(e.target.value)}
            disabled={pwdLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton size="small" tabIndex={-1} onClick={() => setShowPwd2(v => !v)}>
                    {showPwd2 ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth margin="normal"
            label="Confirmar nueva contraseña"
            type={showPwd3 ? 'text' : 'password'}
            value={pwdConfirmar}
            onChange={e => setPwdConfirmar(e.target.value)}
            disabled={pwdLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <MuiIconButton size="small" tabIndex={-1} onClick={() => setShowPwd3(v => !v)}>
                    {showPwd3 ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </MuiIconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth variant="outlined"
            onClick={() => setPwdDialogOpen(false)}
            disabled={pwdLoading}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth variant="contained"
            startIcon={pwdLoading ? <CircularProgress size={16} color="inherit" /> : <LockResetIcon />}
            onClick={handleCambiarPassword}
            disabled={pwdLoading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {pwdLoading ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo de confirmación ── */}
      <Dialog open={dialogOpen} onClose={() => !eliminando && setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 420 } }}>
        <DialogTitle sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          pb: 1, color: '#ef4444',
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <DeleteForeverIcon sx={{ color: '#ef4444', fontSize: 22 }} />
          </Box>
          Eliminar cuenta
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta acción eliminará <strong>permanentemente</strong> tu cuenta y
            todos tus datos: publicaciones, compras, reseñas y favoritos.
            <br /><br />
            Para confirmar, escribe <strong>ELIMINAR</strong> en el campo:
          </Typography>
          <TextField
            fullWidth autoFocus
            placeholder='Escribe "ELIMINAR"'
            value={confirmText}
            onChange={e => setConfirmText(e.target.value.toUpperCase())}
            disabled={eliminando}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#ef4444' },
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            fullWidth variant="outlined"
            onClick={() => setDialogOpen(false)}
            disabled={eliminando}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            fullWidth variant="contained" color="error"
            startIcon={eliminando
              ? <CircularProgress size={16} color="inherit" />
              : <DeleteForeverIcon />}
            onClick={handleEliminarCuenta}
            disabled={confirmText !== 'ELIMINAR' || eliminando}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {eliminando ? 'Eliminando...' : 'Sí, eliminar cuenta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditarPerfil;
