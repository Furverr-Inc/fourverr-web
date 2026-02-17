import React, { useEffect, useState } from 'react';
import { 
  Container, Paper, Box, Typography, Avatar, Button, 
  CircularProgress, Alert, Chip, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/users/perfil');
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

  const handleEditarPerfil = () => {
    navigate('/editar-perfil');
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
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header con avatar y botón de editar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                fontSize: '3rem',
                backgroundColor: '#1dbf73'
              }}
            >
              {perfil?.nombreMostrado?.charAt(0) || perfil?.username?.charAt(0) || 'U'}
            </Avatar>
            
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

        {/* Información del perfil */}
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

          {perfil?.descripcion && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1">
                {perfil.descripcion}
              </Typography>
            </Box>
          )}

          {!perfil?.descripcion && (
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