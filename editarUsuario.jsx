import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Snackbar, 
  Alert, 
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from '../../theme';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

const EditarUsuario = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navegar = useNavigate();
  const location = useLocation();
  const { userData } = location.state || { userData: null };
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Estados para controlar la visibilidad de los Snackbars
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  // Estados para controlar la visibilidad del diálogo de confirmación
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Estado para manejar la visibilidad de la contraseña (si aún la necesitas para otros propósitos)
  const [showPassword, setShowPassword] = useState(false);

  const [initialValues, setInitialValues] = useState({
    id_usuario: userData ? userData.id_usuario : "",
    nombre_usuario: userData ? userData.nombre_usuario : "",
    primer_apellido_usuario: userData ? userData.primer_apellido_usuario : "",
    segundo_apellido_usuario: userData ? userData.segundo_apellido_usuario : "",
    correo_electronico_usuario: userData ? userData.correo_electronico_usuario : "",
    id_rol_usuario: userData ? userData.id_rol_usuario : "",
    contrasena_usuario: userData ? userData.contrasena_usuario : "", // Incluir la contraseña
  });

  useEffect(() => {
    if (userData) {
      console.log('User data received:', userData);
      setInitialValues({
        id_usuario: userData.id_usuario,
        nombre_usuario: userData.nombre_usuario,
        primer_apellido_usuario: userData.primer_apellido_usuario,
        segundo_apellido_usuario: userData.segundo_apellido_usuario || "",
        correo_electronico_usuario: userData.correo_electronico_usuario,
        id_rol_usuario: userData.id_rol_usuario,
        contrasena_usuario: userData.contrasena_usuario, // Incluir la contraseña
      });
    }
  }, [userData]);

  const validationSchema = yup.object().shape({
    nombre_usuario: yup.string().required("Obligatorio"),
    primer_apellido_usuario: yup.string().required("Obligatorio"),
    correo_electronico_usuario: yup.string().email("Correo electrónico inválido").required("Obligatorio"),
    // Puedes incluir validaciones para contrasena_usuario si decides permitir su edición
  });

  useEffect(() => {
    console.log('Datos del usuario recibidos:', userData);
  }, [userData]);

  // Función para alternar la visibilidad de la contraseña (si aún la necesitas para otros propósitos)
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Función para prevenir el comportamiento por defecto al presionar el mouse sobre el ícono
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleFormSubmit = async (values, { setSubmitting }) => {
    console.log('Form submit started with values:', values);
    setSubmitting(true);
    try {
      // Preparar datos para la API incluyendo contrasena_usuario
      const dataActualizada = {
        id_usuario: values.id_usuario,
        nombre_usuario: values.nombre_usuario,
        primer_apellido_usuario: values.primer_apellido_usuario,
        segundo_apellido_usuario: values.segundo_apellido_usuario,
        correo_electronico_usuario: values.correo_electronico_usuario,
        id_rol_usuario: userData.id_rol_usuario, // Fijar el rol según userData
        contrasena_usuario: userData.contrasena_usuario || "default_password", // Incluir la contraseña existente o un valor por defecto
      };
      console.log('Datos actualizados para enviar al backend:', dataActualizada);

      // Enviar datos actualizados a la API
      const respuesta = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/updateUsuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si tu API requiere autenticación, agrega el token aquí
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataActualizada),
      });

      console.log('Respuesta del backend:', respuesta);
      if (respuesta.ok) {
        const data = await respuesta.text(); // Cambiado a text() en lugar de json()
        console.log('Datos recibidos del backend:', data);
        setSnackbarMessage("Usuario editado exitosamente.");
        setSnackbarSeverity("success");
        setOpenSuccessSnackbar(true);
        setTimeout(() => navegar('/usuarios'), 2000);
      } else {
        const errorText = await respuesta.text();
        console.log('Error del backend:', errorText);
        throw new Error(errorText || "Error al editar usuario en el backend.");
      }
    } catch (error) {
      console.error('Error al editar usuario:', error);
      setSnackbarMessage(error.message || "Error al editar usuario.");
      setSnackbarSeverity("error");
      setOpenErrorSnackbar(true);
    }
    setSubmitting(false);
  };

  // Función para manejar el reseteo de contraseña
  const handleResetPassword = () => {
    setOpenConfirmDialog(true); // Abrir el diálogo de confirmación
  };

  // Función para confirmar el reseteo de contraseña
  const confirmResetPassword = async () => {
    setOpenConfirmDialog(false); // Cerrar el diálogo
    const email = initialValues.correo_electronico_usuario;
    try {
      await sendPasswordResetEmail(auth, email);
      setSnackbarMessage(`Se ha enviado un correo de reseteo de contraseña a ${email}`);
      setSnackbarSeverity("success");
      setOpenSuccessSnackbar(true);
    } catch (error) {
      console.error('Error al enviar el correo de reseteo:', error);
      setSnackbarMessage('Hubo un error al enviar el correo de reseteo.');
      setSnackbarSeverity("error");
      setOpenErrorSnackbar(true);
    }
  };

  // Función para cancelar el reseteo de contraseña
  const cancelResetPassword = () => {
    setOpenConfirmDialog(false); // Cerrar el diálogo
  };

  // **Agregar esta condición para manejar userData nulo**
  if (!userData) {
    return (
      <Box m="20px">
        <Header title="Editar Usuario" subtitle="Actualiza la información del usuario" />
        <Typography variant="h6">Cargando datos del usuario...</Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header title="Editar Usuario" subtitle="Actualiza la información del usuario" />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
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
          dirty, // Añadido para controlar el estado de modificación
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              {/* Nombre */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nombre"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nombre_usuario}
                name="nombre_usuario"
                error={!!touched.nombre_usuario && !!errors.nombre_usuario}
                helperText={touched.nombre_usuario && errors.nombre_usuario}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Primer Apellido */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Primer Apellido"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.primer_apellido_usuario}
                name="primer_apellido_usuario"
                error={!!touched.primer_apellido_usuario && !!errors.primer_apellido_usuario}
                helperText={touched.primer_apellido_usuario && errors.primer_apellido_usuario}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Segundo Apellido */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Segundo Apellido"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.segundo_apellido_usuario || ''}
                name="segundo_apellido_usuario"
                error={!!touched.segundo_apellido_usuario && !!errors.segundo_apellido_usuario}
                helperText={touched.segundo_apellido_usuario && errors.segundo_apellido_usuario}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Campo de Rol Deshabilitado */}
              <TextField
                fullWidth
                variant="filled"
                label="Rol"
                value={userData.id_rol_usuario === 1 ? "Administrador" : "Asistente"}
                disabled
                sx={{ gridColumn: "span 2" }}
              />
              {/* Correo Electrónico */}
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Correo Electrónico"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.correo_electronico_usuario}
                name="correo_electronico_usuario"
                error={!!touched.correo_electronico_usuario && !!errors.correo_electronico_usuario}
                helperText={touched.correo_electronico_usuario && errors.correo_electronico_usuario}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Botón para Resetear Contraseña */}
              <Button
                onClick={handleResetPassword} // Asegúrate de llamar a la función correcta
                sx={{
                  backgroundColor: colors.blueAccent[500],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  minWidth: "700px",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: colors.redAccent[500],
                    "& .MuiSvgIcon-root": {
                      transform: "scale(1.2)",
                      color: colors.grey[100],
                    }
                  }
                }}
              >
                <LockResetOutlinedIcon 
                  sx={{ 
                    mr: "10px",
                    transition: "transform 0.3s ease-in-out"
                  }} 
                />
                Restablecer Contraseña
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" mt="20px">
              {/* Botón de Regresar (Opcional) */}
              <Button
                onClick={() => navegar('/usuarios')}
                sx={{
                  backgroundColor: colors.redAccent[500],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  minWidth: "160px",
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
              
              {/* Botón Guardar Cambios */}
              <Button
                type="submit"
                disabled={isSubmitting || !dirty || !isValid} // Actualizado aquí
                sx={{
                  backgroundColor: colors.greenAccent[500],
                  color: colors.grey[100],
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                  minWidth: "160px",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#868dfb",
                    "& .MuiSvgIcon-root": {
                      transform: "scale(1.2)",
                      color: colors.grey[100],
                    }
                  },
                  "&:disabled": {
                    backgroundColor: colors.grey[500],
                    color: colors.grey[100],
                  }
                }}
              >
                <SaveAsOutlinedIcon 
                  sx={{ 
                    mr: "10px",
                    transition: "transform 0.3s ease-in-out"
                  }} 
                />
                Guardar Cambios
              </Button>
            </Box>
            {/* Snackbars */}
            <Snackbar 
              open={openSuccessSnackbar} 
              autoHideDuration={6000} 
              onClose={() => setOpenSuccessSnackbar(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                onClose={() => setOpenSuccessSnackbar(false)} 
                severity={snackbarSeverity} 
                sx={{ 
                  width: '100%', 
                  fontSize: '1.2em', 
                  backgroundColor: snackbarSeverity === "success" ? '#d4edda' : '#f8d7da', 
                  color: snackbarSeverity === "success" ? '#155724' : '#721c24' 
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
            <Snackbar 
              open={openErrorSnackbar} 
              autoHideDuration={6000} 
              onClose={() => setOpenErrorSnackbar(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                onClose={() => setOpenErrorSnackbar(false)} 
                severity={snackbarSeverity} 
                sx={{ 
                  width: '100%', 
                  fontSize: '1.2em', 
                  backgroundColor: snackbarSeverity === "error" ? '#f8d7da' : '#d4edda', 
                  color: snackbarSeverity === "error" ? '#721c24' : '#155724' 
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>

            {/* Diálogo de Confirmación para Resetear Contraseña */}
            <Dialog
              open={openConfirmDialog}
              onClose={cancelResetPassword}
              aria-labelledby="confirm-reset-dialog-title"
              aria-describedby="confirm-reset-dialog-description"
            >
              <DialogTitle id="confirm-reset-dialog-title">
                {"¿Está seguro que desea restablecer la contraseña?"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="confirm-reset-dialog-description">
                  Al confirmar, se enviará un correo electrónico al usuario para que pueda restablecer su contraseña.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={cancelResetPassword} color="primary">
                  Cancelar
                </Button>
                <Button onClick={confirmResetPassword} color="secondary" autoFocus>
                  Confirmar
                </Button>
              </DialogActions>
            </Dialog>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default EditarUsuario;
