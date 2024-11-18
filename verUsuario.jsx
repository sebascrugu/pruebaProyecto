// src/scenes/view/verUsuario.jsx
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton, useTheme } from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { tokens } from '../../theme';

const VerUsuario = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navegar = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData;
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    if (!userData) {
        navigate('/usuarios'); // Redirige si no hay datos
        return null;
    }

    // Obtener el nombre del rol según el ID del rol
    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1:
                return "Administrador";
            case 2:
                return "Doctor";
            case 3:
                return "Asistente";
            default:
                return "No Especificado";
        }
    };

    // Cambiar la visibilidad de la contraseña
    const handleTogglePassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    // Navegar a la página de edición del usuario
    const handleEdit = () => {
        navigate(`/edit/editarUsuario?id=${userData.id_usuario}`, { state: { userData: userData } });
    };

    return (
        <Box padding={3}>
            <Header
                title="Detalles del Usuario"
                subtitle="Revise la información detallada del usuario seleccionado"
            />
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>Detalles del Usuario</Typography>
                    <Typography variant="h6"><strong>Nombre:</strong> {userData.nombre_usuario}</Typography>
                    <Typography variant="h6"><strong>Primer Apellido:</strong> {userData.primer_apellido_usuario}</Typography>
                    <Typography variant="h6"><strong>Segundo Apellido:</strong> {userData.segundo_apellido_usuario || 'No especificado'}</Typography>
                    <Typography variant="h6"><strong>Correo Electrónico:</strong> {userData.correo_electronico_usuario}</Typography>
                    <Typography variant="h6"><strong>Rol:</strong> {getRoleName(userData.id_rol_usuario)}</Typography>
                </CardContent>
            </Card>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt="40px">
  <Button
    onClick={() => navigate('/usuarios')}
    sx={{
      backgroundColor: colors.redAccent[500],
      color: colors.grey[100],
      fontSize: "14px",
      fontWeight: "bold",
      padding: "10px 20px",
      minWidth: "160px",  // Ancho mínimo fijo para ambos botones
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        backgroundColor: "#868dfb",
        "& .MuiSvgIcon-root": {
          transform: "scale(1.2)",
          color: colors.grey[100],
        }
      }
    }}
  >
    <ArrowBackOutlinedIcon 
      sx={{ 
        mr: "10px",
        transition: "transform 0.3s ease-in-out"
      }} 
    />
    Regresar
  </Button>
  <Button
    onClick={handleEdit}
    sx={{
      backgroundColor: colors.greenAccent[500],
      color: colors.grey[100],
      fontSize: "14px",
      fontWeight: "bold",
      padding: "10px 20px",
      minWidth: "160px",  // Ancho mínimo fijo para ambos botones
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        backgroundColor: "#868dfb",
        "& .MuiSvgIcon-root": {
          transform: "scale(1.2)",
          color: colors.grey[100],
        }
      }
    }}
  >
    <EditOutlinedIcon 
      sx={{ 
        mr: "10px",
        transition: "transform 0.3s ease-in-out"
      }} 
    />
    Editar
  </Button>
</Box>
        </Box>
    );
};

export default VerUsuario;
