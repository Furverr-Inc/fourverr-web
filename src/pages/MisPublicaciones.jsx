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
  const [eliminando, setEliminando] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, producto: null });
  const navigate = useNavigate();

  const cargarProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/productos/mis-publicaciones');
      setProductos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error al cargar tus publicaciones: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  const handleEliminar = async () => {
    if (!deleteDialog.producto) return;
    setEliminando(true);
    try {
      await api.delete(`/productos/${deleteDialog.producto.id}`);
      // Actualizar lista localmente sin recargar para evitar errores de red
      setProductos(prev => prev.filter(p => p.id !== deleteDialog.producto.id));
      setSuccess('Publicación eliminada correctamente');
      setDeleteDialog({ open: false, producto: null });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data || err.message));
      setDeleteDialog({ open: false, producto: null });
      setTimeout(() => setError(''), 4000);
    } finally {
      setEliminando(false);
    }
  };

  const tipoLabel = (tipo) => {
    const tipos = {
      SERVICIO_GIG: 'Servicio', CURSO_DIGITAL: 'Curso', RECURSO_DESCARGABLE: 'Descargable',
      SUSCRIPCION: 'Suscripción', PRODUCTO_FISICO: 'Producto', CONSULTORIA: 'Consultoría',
      DISENO_GRAFICO: 'Diseño', DESARROLLO_WEB: 'Dev Web', MARKETING_DIGITAL: 'Marketing', MUSICA_AUDIO: 'Música',
    };
    return tipos[tipo] || tipo;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StoreIcon sx={{ fontSize: 36, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">Mis Publicaciones</Typography>
              <Typography variant="body2" color="text.secondary">
                {productos.length} publicación{productos.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/nuevo')} sx={{ fontWeight: 'bold' }}>
            Nueva Publicación
          </Button>
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {productos.length === 0 ? (
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
          <StoreIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>Aún no tienes publicaciones</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/nuevo')} sx={{ mt: 2 }}>
            Crear mi primera publicación
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {productos.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
                {producto.urlPortada ? (
                  <CardMedia component="img" height="180" image={producto.urlPortada} alt={producto.titulo} sx={{ objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>{producto.titulo}</Typography>
                    <Chip label={tipoLabel(producto.tipo)} color="primary" size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                    {producto.descripcion}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    ${Number(producto.precio).toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end' }}>
                  <IconButton color="error" title="Eliminar publicación" onClick={() => setDeleteDialog({ open: true, producto })}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteDialog.open} onClose={() => !eliminando && setDeleteDialog({ open: false, producto: null })}>
        <DialogTitle>⚠️ ¿Eliminar publicación?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar <strong>"{deleteDialog.producto?.titulo}"</strong>. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, producto: null })} variant="outlined" disabled={eliminando}>
            Cancelar
          </Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={eliminando}>
            {eliminando ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MisPublicaciones;
