import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Box, Typography, Grid, Card, CardMedia,
  CardContent, CardActions, Button, CircularProgress, Alert,
  Chip, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, IconButton, TextField, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import StoreIcon from '@mui/icons-material/Store';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TIPOS = [
  { value: 'SERVICIO_GIG',        label: 'Servicio / Gig' },
  { value: 'CURSO_DIGITAL',       label: 'Curso Digital' },
  { value: 'RECURSO_DESCARGABLE', label: 'Recurso Descargable' },
  { value: 'SUSCRIPCION',         label: 'Suscripción' },
  { value: 'PRODUCTO_FISICO',     label: 'Producto Físico' },
  { value: 'CONSULTORIA',         label: 'Consultoría' },
  { value: 'DISENO_GRAFICO',      label: 'Diseño Gráfico' },
  { value: 'DESARROLLO_WEB',      label: 'Desarrollo Web' },
  { value: 'MARKETING_DIGITAL',   label: 'Marketing Digital' },
  { value: 'MUSICA_AUDIO',        label: 'Música / Audio' },
];

const tipoLabel = (tipo) => TIPOS.find(t => t.value === tipo)?.label || tipo;

const PRECIO_MINIMO_MXN = 10;

const MisPublicaciones = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // ── Delete state ──
  const [eliminando, setEliminando] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, producto: null });

  // ── Edit state ──
  const [editDialog, setEditDialog] = useState({ open: false, producto: null });
  const [editForm, setEditForm] = useState({ titulo: '', descripcion: '', precio: '', tipo: '' });
  const [editArchivo, setEditArchivo] = useState(null);
  const [editPortada, setEditPortada] = useState(null);
  const [editPortadaPreview, setEditPortadaPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarProductos = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/productos/mis-publicaciones');
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Error al cargar publicaciones: ' + (err.response?.data || err.message));
    } finally { setLoading(false); }
  };

  useEffect(() => { cargarProductos(); }, []);

  // ── Abrir edición ──
  const abrirEditar = (producto) => {
    setEditForm({
      titulo:      producto.titulo,
      descripcion: producto.descripcion,
      precio:      producto.precio,
      tipo:        producto.tipo,
    });
    setEditArchivo(null);
    setEditPortada(null);
    setEditPortadaPreview(producto.urlPortada || null);
    setEditDialog({ open: true, producto });
  };

  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditPortada(file);
    setEditPortadaPreview(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    if (!editDialog.producto) return;
    const precioNum = parseFloat(String(editForm.precio).replace(',', '.'));
    if (Number.isNaN(precioNum) || precioNum < PRECIO_MINIMO_MXN) {
      setError(`El precio mínimo es ${PRECIO_MINIMO_MXN} MXN.`);
      setTimeout(() => setError(''), 4000);
      return;
    }
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append('titulo',      editForm.titulo);
      fd.append('descripcion', editForm.descripcion);
      fd.append('precio',      editForm.precio);
      fd.append('tipo',        editForm.tipo);
      if (editArchivo) fd.append('archivo', editArchivo);
      if (editPortada) fd.append('portada', editPortada);

      const res = await api.put(`/productos/${editDialog.producto.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProductos(prev => prev.map(p => p.id === editDialog.producto.id ? res.data : p));
      setSuccess('Publicación actualizada correctamente');
      setEditDialog({ open: false, producto: null });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const d = err.response?.data;
      const msg =
        err.response?.status === 400 && typeof d === 'string'
          ? d
          : 'Error al guardar: ' + (d || err.message);
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally { setGuardando(false); }
  };

  // ── Eliminar ──
  const handleEliminar = async () => {
    if (!deleteDialog.producto) return;
    setEliminando(true);
    try {
      await api.delete(`/productos/${deleteDialog.producto.id}`);
      setProductos(prev => prev.filter(p => p.id !== deleteDialog.producto.id));
      setSuccess('Publicación eliminada correctamente');
      setDeleteDialog({ open: false, producto: null });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar: ' + (err.response?.data || err.message));
      setDeleteDialog({ open: false, producto: null });
      setTimeout(() => setError(''), 4000);
    } finally { setEliminando(false); }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
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
      {error   && <Alert severity="error"   sx={{ mb: 3 }}>{error}</Alert>}

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
                <CardActions sx={{ px: 2, pb: 2, justifyContent: 'flex-end', gap: 0.5 }}>
                  <IconButton color="primary" title="Editar publicación" onClick={() => abrirEditar(producto)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" title="Eliminar publicación" onClick={() => setDeleteDialog({ open: true, producto })}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── DIALOG ELIMINAR ── */}
      <Dialog open={deleteDialog.open} onClose={() => !eliminando && setDeleteDialog({ open: false, producto: null })}>
        <DialogTitle>⚠️ ¿Eliminar publicación?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estás a punto de eliminar <strong>"{deleteDialog.producto?.titulo}"</strong>. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, producto: null })} variant="outlined" disabled={eliminando}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" variant="contained" disabled={eliminando}>
            {eliminando ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG EDITAR ── */}
      <Dialog open={editDialog.open} onClose={() => !guardando && setEditDialog({ open: false, producto: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>✏️ Editar publicación</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={editForm.titulo}
              onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))}
            />
            <TextField
              label="Descripción"
              fullWidth multiline rows={3}
              value={editForm.descripcion}
              onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Precio (MXN)"
                type="number"
                sx={{ flex: 1 }}
                value={editForm.precio}
                onChange={e => setEditForm(f => ({ ...f, precio: e.target.value }))}
                inputProps={{ min: PRECIO_MINIMO_MXN, step: 0.01 }}
                helperText={`Mín. ${PRECIO_MINIMO_MXN} MXN`}
              />
              <TextField
                label="Categoría"
                select sx={{ flex: 1 }}
                value={editForm.tipo}
                onChange={e => setEditForm(f => ({ ...f, tipo: e.target.value }))}
              >
                {TIPOS.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Box>

            {/* Portada */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Portada (opcional — reemplaza la actual)</Typography>
              {editPortadaPreview && (
                <Box component="img" src={editPortadaPreview} sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 2, mb: 1 }} />
              )}
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small">
                Cambiar portada
                <input type="file" hidden accept="image/*" onChange={handlePortadaChange} />
              </Button>
            </Box>

            {/* Archivo principal */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Archivo principal (opcional — reemplaza el actual)</Typography>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small">
                Cambiar archivo
                <input type="file" hidden onChange={e => setEditArchivo(e.target.files[0])} />
              </Button>
              {editArchivo && <Typography variant="caption" sx={{ ml: 1 }}>{editArchivo.name}</Typography>}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditDialog({ open: false, producto: null })} variant="outlined" disabled={guardando}>Cancelar</Button>
          <Button onClick={handleGuardar} variant="contained" disabled={guardando || !editForm.titulo || !editForm.precio}>
            {guardando ? <CircularProgress size={20} color="inherit" /> : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MisPublicaciones;
