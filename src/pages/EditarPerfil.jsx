import React, { useEffect, useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField, Button, 
  CircularProgress, Alert, Avatar, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import api from '../services/api';

const EditarPerfil = () => {
  const [perfil, setPerfil] = useState({
    nombreMostrado: '',
    email: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para el diálogo de cambio de contraseña
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/users/perfil');
      setPerfil({
        nombreMostrado: response.data.nombreMostrado || '',
        email: response.data.email || '',
        descripcion: response.data.descripcion || ''
      });
    } catch (err) {
      console.error("Error cargando perfil:", err);
      setError("No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const handleChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value
    });
  };

  const handleGuardar = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/users/perfil', {
        nombreMostrado: perfil.nombreMostrado,
        email: perfil.email,
        descripcion: perfil.descripcion
      });
      
      // Actualizar localStorage si se cambió el nombre
      if (perfil.nombreMostrado) {
        localStorage.setItem('usuarioNombre', perfil.nombreMostrado);
      }
      
      setSuccess("Perfil actualizado correctamente");
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 1500);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      const mensajeServidor = err.response?.data?.message || err.response?.data || "Error al guardar los cambios";
      setError(mensajeServidor); // Esto mostrará el error real en tu UI
      console.log("Detalle técnico del error:", err.response);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handleCambiarPassword = async () => {
    // Validaciones
    if (!passwordData.passwordActual || !passwordData.passwordNueva || !passwordData.passwordConfirm) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }

    if (passwordData.passwordNueva !== passwordData.passwordConfirm) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.passwordNueva.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setChangingPassword(true);
    setPasswordError('');

    try {
      await api.put('/users/perfil/password', {
        passwordActual: passwordData.passwordActual,
        passwordNueva: passwordData.passwordNueva
      });

      setSuccess("Contraseña actualizada correctamente");
      setOpenPasswordDialog(false);
      setPasswordData({ passwordActual: '', passwordNueva: '', passwordConfirm: '' });
    } catch (err) {
      console.error("Error cambiando contraseña:", err);
      if (err.response?.data) {
        setPasswordError(err.response.data);
      } else {
        setPasswordError("Error al cambiar la contraseña");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/perfil')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Editar Perfil
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        {/* Avatar (solo visual, sin funcionalidad de cambio) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 150, 
              height: 150, 
              fontSize: '4rem',
              backgroundColor: '#1dbf73'
            }}
          >
            {perfil.nombreMostrado?.charAt(0) || 'U'}
          </Avatar>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Formulario */}
        <Box component="form" sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Nombre a Mostrar"
            name="nombreMostrado"
            value={perfil.nombreMostrado}
            onChange={handleChange}
            margin="normal"
            helperText="Este es el nombre que verán otros usuarios"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={perfil.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Descripción"
            name="descripcion"
            value={perfil.descripcion}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            helperText="Cuéntanos un poco sobre ti"
          />

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleGuardar}
              disabled={saving}
              sx={{ 
                backgroundColor: '#1dbf73',
                '&:hover': { backgroundColor: '#19a463' }
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setOpenPasswordDialog(true)}
              color="secondary"
            >
              Cambiar Contraseña
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Diálogo para cambiar contraseña */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Contraseña Actual"
            name="passwordActual"
            type="password"
            value={passwordData.passwordActual}
            onChange={handlePasswordChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Nueva Contraseña"
            name="passwordNueva"
            type="password"
            value={passwordData.passwordNueva}
            onChange={handlePasswordChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Confirmar Nueva Contraseña"
            name="passwordConfirm"
            type="password"
            value={passwordData.passwordConfirm}
            onChange={handlePasswordChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCambiarPassword} 
            disabled={changingPassword}
            variant="contained"
          >
            {changingPassword ? 'Cambiando...' : 'Cambiar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditarPerfil;