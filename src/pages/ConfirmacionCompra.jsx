import React, { useEffect, useState } from 'react';
import { Container, Paper, Box, Typography, Button, Divider, Chip, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import { useThemeMode } from '../ThemeContext';

const ConfirmacionCompra = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isDark } = useThemeMode();
  const [count, setCount] = useState(8);

  // Datos del pedido pasados por navigate state
  const pedido = location.state?.pedido || null;

  // Auto-redirect countdown
  useEffect(() => {
    if (count <= 0) { navigate('/home'); return; }
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [count, navigate]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0d0d1a 0%, #1e0a3c 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0f4ff 100%)',
      p: 2,
    }}>
      <Paper elevation={isDark ? 0 : 4} sx={{
        maxWidth: 520, width: '100%', borderRadius: 4, overflow: 'hidden',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
        background: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
        backdropFilter: 'blur(20px)',
      }}>

        {/* Header verde */}
        <Box sx={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          py: 4, px: 3, textAlign: 'center',
        }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
          }}>
            <CheckCircleIcon sx={{ fontSize: 44, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
            ¡Compra realizada!
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
            Tu pago fue procesado correctamente
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>

          {/* Detalle del pedido */}
          {pedido ? (
            <Box sx={{
              borderRadius: 3, border: '1px solid', borderColor: 'divider',
              overflow: 'hidden', mb: 3,
            }}>
              <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                <Avatar
                  src={pedido.producto?.urlPortada || pedido.producto?.urlArchivo}
                  variant="rounded"
                  sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                >
                  {pedido.producto?.titulo?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {pedido.producto?.titulo || 'Producto'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vendedor: {pedido.producto?.vendedor?.nombreMostrado || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pedido.fechaPedido ? new Date(pedido.fechaPedido).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, bgcolor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)' }}>
                <Typography variant="body2" color="text.secondary">Total pagado</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  ${pedido.producto?.precio}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{
              borderRadius: 3, border: '1px dashed', borderColor: 'divider',
              p: 3, textAlign: 'center', mb: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body1" fontWeight="bold">Pedido confirmado</Typography>
              <Typography variant="body2" color="text.secondary">
                Puedes ver el detalle en tu perfil
              </Typography>
            </Box>
          )}

          {/* Info adicional */}
          <Box sx={{
            borderRadius: 2, bgcolor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
            border: '1px solid', borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
            p: 2, mb: 3,
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DownloadIcon sx={{ fontSize: 16 }} />
              El vendedor recibirá tu compra y te entregará el servicio.
            </Typography>
          </Box>

          {/* Botones */}
          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained" fullWidth startIcon={<HomeIcon />}
              onClick={() => navigate('/home')}
              sx={{
                borderRadius: 2, py: 1.2, fontWeight: 'bold',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                '&:hover': { background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' },
              }}
            >
              Seguir explorando
            </Button>
            <Button
              variant="outlined" fullWidth startIcon={<PersonIcon />}
              onClick={() => navigate('/perfil')}
              sx={{ borderRadius: 2, py: 1.2 }}
            >
              Mis compras
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Redirigiendo al inicio en {count}s...
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfirmacionCompra;
