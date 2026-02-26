import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Grid, Card, CardMedia,
  CardContent, CardActions, Button, CircularProgress, Alert,
  Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StoreIcon from '@mui/icons-material/Store';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MisPublicaciones = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, producto: null });
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      const response = await api.get('/productos/mis-publicaciones');
      setProductos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error al cargar tus publicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleEliminar = async () => {
    if (!deleteDialog.producto) return;
    try {
      await api.delete(`/productos/${deleteDialog.producto.id}`);
      setSuccess('Publicación eliminada correctamente');
      setDeleteDialog({ open: false, producto: null });
      cargarProductos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar la publicación');
      setTimeout(() => setError(''), 3000);
    }
  };

  const tipoLabel = (tipo) => {
    const tipos = { DIGITAL: 'Digital', SERVICIO: 'Servicio', FISICO: 'Físico' };
    return tipos[tipo] || tipo;
  };

  const tipoColor = (tipo) => {
    const colores = { DIGITAL: 'primary', SERVICIO: 'success', FISICO: 'warning' };
    return colores[tipo] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1dbf73' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>

      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StoreIcon sx={{ fontSize: 36, color: '#1dbf73' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Mis Publicaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {productos.length} publicación{productos.length !== 1 ? 'es' : ''} activa{productos.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/nuevo')}
            sx={{ backgroundColor: '#1dbf73', '&:hover': { backgroundColor: '#19a463' }, fontWeight: 'bold' }}
          >
            Nueva Publicación
          </Button>
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Sin publicaciones */}
      {productos.length === 0 ? (
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <StoreIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aún no tienes publicaciones
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comparte tus productos o servicios con la comunidad
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/nuevo')}
            sx={{ backgroundColor: '#1dbf73', '&:hover': { backgroundColor: '#19a463' } }}
          >
            Crear mi primera publicación
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>

                {/* Portada o placeholder */}
                {producto.urlPortada ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={producto.urlPortada}
                    alt={producto.titulo}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ height: 180, bgcolor: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon sx={{ fontSize: 60, color: '#1dbf73', opacity: 0.4 }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3, flex: 1, mr: 1 }}>
                      {producto.titulo}
                    </Typography>
                    <Chip label={tipoLabel(producto.tipo)} color={tipoColor(producto.tipo)} size="small" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2
                  }}>
                    {producto.descripcion}
                  </Typography>

                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1dbf73' }}>
                    ${Number(producto.precio).toFixed(2)}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                  <IconButton
                    color="error"
                    title="Eliminar publicación"
                    onClick={() => setDeleteDialog({ open: true, producto })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, producto: null })}>
        <DialogTitle>⚠️ ¿Eliminar publicación?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar <strong>"{deleteDialog.producto?.titulo}"</strong>.
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, producto: null })} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default MisPublicaciones;
