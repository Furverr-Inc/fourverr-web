import React, { useEffect, useState } from 'react';
import { 
  Container, Paper, Box, Typography, Avatar, Button, 
  CircularProgress, Alert, Chip, Divider, IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import api from '../services/api';

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/users/perfil');
      console.log("Contenido del perfil desde el backend:", response.data); // PRUEBA BACKEND
      setPerfil(response.data);
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

  const handleFotoClick = () => {
    document.getElementById('input-foto').click();
  };

  const handleCambiarFoto = async (event) => {
    const archivo = event.target.files[0];
    if (!archivo) return;

    if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
      alert("Solo se permiten imágenes JPG o PNG");
      return;
    }

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      setSubiendo(true);
      const response = await api.post('/users/perfil/foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Actualizamos el estado con la URL que devolvió tu S3Service
      setPerfil({ ...perfil, fotoUrl: response.data.url });
    } catch (err) {
      console.error("Error subiendo foto:", err);
      alert("Error al actualizar la foto");
    } finally {
      setSubiendo(false);
    }
  };

  const handleEditarPerfil = () => {
    navigate('/editar-perfil');
  };

  const handleSolicitarVendedor = async () => {
    try {
      await api.post('/users/solicitar-vendedor');
      setSuccess('Solicitud enviada. Esperando aprobación del Administrador.');
      cargarPerfil(); // Recargar perfil
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Error al enviar la solicitud');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            
            {/* LÓGICA DE FOTO DE PERFIL INTEGRADA */}
            <Box sx={{ position: 'relative' }}>
              <input
                accept="image/jpeg,image/png"
                id="input-foto"
                type="file"
                style={{ display: 'none' }}
                onChange={handleCambiarFoto}
              />
              <IconButton 
                onClick={handleFotoClick}
                disabled={subiendo}
                sx={{ 
                  p: 0,
                  '&:hover .overlay': { opacity: 1 }
                }}
              >
                <Avatar 
                  src={perfil?.fotoUrl} // Aquí se carga la imagen de S3
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '3rem',
                    backgroundColor: '#1dbf73'
                  }}
                >
                  {/* Si no hay fotoUrl, muestra la inicial */}
                  {!perfil?.fotoUrl && (perfil?.nombreMostrado?.charAt(0) || perfil?.username?.charAt(0) || 'U')}
                </Avatar>
                
                {/* Overlay que aparece al pasar el mouse */}
                <Box className="overlay" sx={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s'
                }}>
                  <PhotoCamera sx={{ color: 'white' }} />
                </Box>

                {subiendo && (
                  <CircularProgress 
                    size={120} 
                    sx={{ 
                      position: 'absolute', top: 0, left: 0, 
                      color: '#1dbf73', zIndex: 1 
                    }} 
                  />
                )}
              </IconButton>
            </Box>
            
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {perfil?.nombreMostrado || perfil?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                @{perfil?.username}
              </Typography>
              <Chip 
                label={perfil?.role} 
                color={perfil?.role === 'SELLER' ? 'success' : perfil?.role === 'ADMIN' ? 'error' : 'default'}
                size="small"
              />
            </Box>
          </Box>

          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={handleEditarPerfil}
            sx={{ 
              backgroundColor: '#1dbf73',
              '&:hover': { backgroundColor: '#19a463' }
            }}
          >
            Editar Perfil
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Botón para solicitar ser vendedor */}
        {perfil?.role === 'USER' && !perfil?.solicitudVendedor && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              ¿Quieres vender tus productos o servicios? Solicita convertirte en vendedor.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSolicitarVendedor}
              sx={{ 
                backgroundColor: '#1dbf73',
                '&:hover': { backgroundColor: '#19a463' }
              }}
            >
              Solicitar ser Vendedor
            </Button>
          </Box>
        )}

        {/* Mensaje de solicitud pendiente */}
        {perfil?.solicitudVendedor && perfil?.role === 'USER' && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning">
              Tu solicitud para ser vendedor está pendiente de aprobación por el Administrador.
            </Alert>
          </Box>
        )}

        {/* Botón Mis Publicaciones - solo para vendedores */}
        {perfil?.role === 'SELLER' && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<StorefrontIcon />}
              onClick={() => navigate('/mis-publicaciones')}
              sx={{
                backgroundColor: '#1dbf73',
                '&:hover': { backgroundColor: '#19a463' },
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '1rem'
              }}
            >
              Mis Publicaciones
            </Button>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Información Personal
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {perfil?.email}
            </Typography>
          </Box>

          {perfil?.descripcion ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1">
                {perfil.descripcion}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                Aún no has agregado una descripción a tu perfil. ¡Edita tu perfil para agregar una!
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Perfil;