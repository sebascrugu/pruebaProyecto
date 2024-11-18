// src/scenes/create/crearUsuario.jsx
import { Box, Button, TextField, Snackbar, Alert, useTheme, IconButton, InputAdornment, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
// Elimina estas importaciones
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../../firebase';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { tokens } from '../../theme';

const CrearUsuario = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navegar = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  
  // Estados para controlar la visibilidad de los Snackbars
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  
  // Nuevo estado para el Snackbar de campos faltantes
  const [openMissingFieldsSnackbar, setOpenMissingFieldsSnackbar] = useState(false);
  
  // Estados para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  // Función para alternar la visibilidad de la contraseña
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  
  // Función para prevenir el comportamiento por defecto del botón del mouse
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  
  const initialValues = {
    nombre_usuario: "",
    primer_apellido_usuario: "",
    segundo_apellido_usuario: "",
    correo_electronico_usuario: "",
    contrasena_usuario: "",
  };

  const validationSchema = yup.object().shape({
    nombre_usuario: yup.string().required("Obligatorio"),
    primer_apellido_usuario: yup.string().required("Obligatorio"),
    segundo_apellido_usuario: yup.string().required("Obligatorio"),
    correo_electronico_usuario: yup.string().email("Correo inválido").required("Obligatorio"),
    contrasena_usuario: yup.string().required("Obligatorio").min(6, "Mínimo 6 caracteres"),
  });

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      // Enviar datos al backend para crear el usuario
      const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/createUsuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Asegúrate de incluir cualquier token de autenticación necesario
        },
        body: JSON.stringify({
          nombre_usuario: values.nombre_usuario,
          primer_apellido_usuario: values.primer_apellido_usuario,
          segundo_apellido_usuario: values.segundo_apellido_usuario,
          correo_electronico_usuario: values.correo_electronico_usuario,
          id_rol_usuario: 3, // Siempre Asistente
          contrasena_usuario: values.contrasena_usuario, // Nota: Considera manejar esto de forma segura
        })
      });

      if (response.ok) {
        setSnackbarMessage("Usuario creado exitosamente.");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        resetForm();
        // Retrasar la navegación para permitir que el Snackbar se muestre
        setTimeout(() => navegar('/usuarios'), 3000);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || "Error al crear usuario en el backend.");
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      setSnackbarMessage(error.message || "Error al crear usuario.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    setSubmitting(false);
  };

  return (
    <Box m="20px">
      <Header title="Crear Usuario" subtitle="Agregar nuevo usuario a la base de datos" />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isValid,
          isSubmitting,
          dirty,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box display="grid" gap="30px" gridTemplateColumns="repeat(3, minmax(0, 1fr))">
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nombre*"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nombre_usuario}
                name="nombre_usuario"
                error={!!touched.nombre_usuario && !!errors.nombre_usuario}
                helperText={touched.nombre_usuario && errors.nombre_usuario}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Primer Apellido*"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.primer_apellido_usuario}
                name="primer_apellido_usuario"
                error={!!touched.primer_apellido_usuario && !!errors.primer_apellido_usuario}
                helperText={touched.primer_apellido_usuario && errors.primer_apellido_usuario}
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Segundo Apellido*"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.segundo_apellido_usuario}
                name="segundo_apellido_usuario"
                error={!!touched.segundo_apellido_usuario && !!errors.segundo_apellido_usuario}
                helperText={touched.segundo_apellido_usuario && errors.segundo_apellido_usuario}
                sx={{ gridColumn: "span 1" }}
              />
              {/* Campo de Rol Deshabilitado */}
              <TextField
                fullWidth
                variant="filled"
                label="Rol"
                value="Asistente"
                disabled
                sx={{ gridColumn: "span 1" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Correo Electrónico*"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.correo_electronico_usuario}
                name="correo_electronico_usuario"
                error={!!touched.correo_electronico_usuario && !!errors.correo_electronico_usuario}
                helperText={touched.correo_electronico_usuario && errors.correo_electronico_usuario}
                sx={{ gridColumn: "span 1" }}
              />
              <Box sx={{ gridColumn: "span 1" }}>
                <TextField
                  fullWidth
                  variant="filled"
                  type={showPassword ? "text" : "password"}
                  label="Contraseña*"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.contrasena_usuario}
                  name="contrasena_usuario"
                  error={!!touched.contrasena_usuario && !!errors.contrasena_usuario}
                  helperText={touched.contrasena_usuario && errors.contrasena_usuario}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: "100%" }}
                />
                {/* Descripción de Requisitos de Contraseña */}
                <Typography variant="caption" color="textSecondary">
                  La contraseña debe tener al menos 6 caracteres.
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt="40px">
              <Button
                onClick={() => navegar('/usuarios')}
                sx={{
                  backgroundColor: colors.redAccent[500],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
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
                type="button" // Mantén como "button"
                onClick={() => {
                  if (isValid && dirty) {
                    handleSubmit(); // Enviar el formulario si es válido
                  } else {
                    setOpenMissingFieldsSnackbar(true); // Mostrar Snackbar si falta información
                  }
                }}
                disabled={isSubmitting} // Mantener el botón deshabilitado solo durante el envío
                sx={{
                  backgroundColor: isValid && dirty ? colors.greenAccent[500] : colors.grey[400], // Cambiar color según validez
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  transition: "all 0.3s ease-in-out",
                  cursor: isValid && dirty ? 'pointer' : 'not-allowed', // Cambiar cursor según validez
                  "&:hover": {
                    backgroundColor: isValid && dirty ? "#868dfb" : colors.grey[400], // Solo cambiar si es válido
                    "& .MuiSvgIcon-root": {
                      transform: isValid && dirty ? "scale(1.2)" : "scale(1)",
                      color: colors.grey[100],
                    }
                  }
                }}
              >
                <PersonAddAltOutlinedIcon 
                  sx={{ 
                    mr: "10px",
                    transition: "transform 0.3s ease-in-out"
                  }} 
                />
                Crear Nuevo Usuario
              </Button>
            </Box>
            {/* Snackbars Existentes */}
            <Snackbar 
              open={openSnackbar} 
              autoHideDuration={6000} 
              onClose={() => setOpenSnackbar(false)} 
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
            >
              <Alert 
                onClose={() => setOpenSnackbar(false)} 
                severity={snackbarSeverity} 
                sx={{ 
                  width: '100%', 
                  fontSize: '1.2em', // Aumentar tamaño de fuente
                  backgroundColor: snackbarSeverity === "success" ? '#d4edda' : '#f8d7da', // Fondo verde claro o rojo claro
                  color: snackbarSeverity === "success" ? '#155724' : '#721c24' // Texto verde oscuro o rojo oscuro
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
            {/* Nuevo Snackbar para Campos Faltantes */}
            <Snackbar
              open={openMissingFieldsSnackbar}
              autoHideDuration={8000} // Duración de 8 segundos
              onClose={() => setOpenMissingFieldsSnackbar(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
            >
              <Alert 
                severity="warning" 
                sx={{ 
                  width: '100%', 
                  fontSize: '1.2em', // Aumentar tamaño de fuente
                  backgroundColor: '#fff3cd', // Fondo amarillo claro
                  color: '#856404' // Texto amarillo oscuro
                }}
              >
                Faltan campos obligatorios por completar.
              </Alert>
            </Snackbar>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default CrearUsuario;
