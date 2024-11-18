// controls/index.jsx

import { 
  Box, 
  Typography, 
  useTheme, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { esES } from '@mui/x-data-grid/locales';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const Controles = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [controles, setControles] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formasDePago, setFormasDePago] = useState([]);
  const [estadosCita, setEstadosCita] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el diálogo de confirmación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Estados para los Snackbars
  const [openDeleteSuccessSnackbar, setOpenDeleteSuccessSnackbar] = useState(false);
  const [openDeleteErrorSnackbar, setOpenDeleteErrorSnackbar] = useState(false);

  const fetchControles = async () => {
    try {
      const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getControlesSubsecuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Fetch Pacientes
      const pacientesResponse = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getPacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const dataPacientes = await pacientesResponse.json();

      // Fetch Servicios
      const serviciosResponse = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getServicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const dataServicios = await serviciosResponse.json();

      // Fetch Categorias Servicio
      const categoriasResponse = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getCategoriasServicio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const dataCategorias = await categoriasResponse.json();

      // Fetch Formas de Pago
      const formasPagoResponse = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getFormasDePago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const dataFormasPago = await formasPagoResponse.json();

      // Fetch Estados Cita
      const estadosCitaResponse = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getEstadosCita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const dataEstadosCita = await estadosCitaResponse.json();

      // Mapear Pacientes
      const pacientesMap = {};
      dataPacientes.forEach(paciente => {
        pacientesMap[paciente.id_paciente] = {
          nombre: `${paciente.nombre_paciente} ${paciente.primer_apellido_paciente} ${paciente.segundo_apellido_paciente || ''}`,
          celular: paciente.numero_celular,
        };
      });

      // Mapear Servicios y Categorías de Servicio
      const serviciosMap = {};
      const servicioCategoriaMap = {}; // id_servicio -> id_categoria
      dataServicios.forEach(servicio => {
        serviciosMap[servicio.id_servicio] = servicio.nombre_servicio;
        servicioCategoriaMap[servicio.id_servicio] = servicio.id_categoria_servicio;
      });

      // Crear Mapa de Categorías con Nombres Personalizados
      const categoriasMap = {};
      // Definir el mapeo personalizado
      const categoriaDisplayMap = {
        'Consulta ginecología': 'Ginecología',
        'Consulta obstetricia': 'Obstetricia',
      };
      dataCategorias.forEach(categoria => {
        categoriasMap[categoria.id_categoria_servicio] = categoriaDisplayMap[categoria.nombre_categoria_servicio] || categoria.nombre_categoria_servicio;
      });

      // Mapear Formas de Pago
      const formasPagoMap = {};
      dataFormasPago.forEach(formaPago => {
        formasPagoMap[formaPago.id_forma_pago] = formaPago.nombre_forma_pago;
      });

      // Mapear Estados Cita
      const estadosCitaMap = {};
      dataEstadosCita.forEach(estadoCita => {
        estadosCitaMap[estadoCita.id_estado_cita] = estadoCita.nombre_estado_cita;
      });

      // Formatear los Datos
      const formattedData = data.map(item => {
        const idCategoriaServicio = servicioCategoriaMap[item.id_servicio]; // Obtener id_categoria_servicio
        const fechaControlDate = new Date(item.fecha_hora_control);
        const opcionesFecha = { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        };
        const formattedFechaControl = fechaControlDate.toLocaleDateString('es-ES', opcionesFecha);

        return {
          id: item.id_control_subsecuente,
          id_paciente: item.id_paciente,             // Agrega id_paciente
          id_servicio: item.id_servicio,             // Agrega id_servicio
          id_categoria_servicio: idCategoriaServicio, // Agrega id_categoria_servicio
          id_forma_pago: item.id_forma_pago,         // Agrega id_forma_pago
          id_estado_cita: item.id_estado_cita,       // Agrega id_estado_cita
          motivo_consulta_control: item.motivo_consulta_control || '',
          observaciones_control: item.observaciones_control || '',
          monto_control: item.monto_control || '',
          // Campos adicionales
          nombrePaciente: pacientesMap[item.id_paciente]?.nombre || 'Desconocido',
          celularPaciente: pacientesMap[item.id_paciente]?.celular || 'Desconocido',
          servicio: serviciosMap[item.id_servicio] || 'Desconocido',
          categoria: categoriasMap[idCategoriaServicio] || 'Desconocido', // Aquí se muestra el nombre personalizado
          fechaControl: formattedFechaControl,
          fechaControlRaw: item.fecha_hora_control, // Añade este campo
          formaPago: formasPagoMap[item.id_forma_pago] || 'Desconocido',
          estadoCita: estadosCitaMap[item.id_estado_cita] || 'Desconocido',
          fechaCreacionControl: item.fecha_creacion_control, // Ya existente
        };
      });

      setControles(formattedData);
    } catch (error) {
      console.error("Error fetching controles: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControles();
  }, []);
  
  // Funciones para manejar el diálogo de eliminación
  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (deleteId !== null) {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/deleteControlesSubsecuentes', {
          method: 'POST', // Asegúrate de que el método coincida con el backend
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_control_subsecuente: deleteId }),
        });

        if (!response.ok) {
          throw new Error(`Error en la eliminación: ${response.statusText}`);
        }

        const result = await response.text();
        console.log(result); // Debería mostrar "se eliminó" si todo va bien

        // Actualizar el estado para reflejar la eliminación en la UI
        setControles((prevControles) => prevControles.filter(control => control.id !== deleteId));

        // Abrir el Snackbar de éxito
        setOpenDeleteSuccessSnackbar(true);

        // Cerrar el diálogo
        handleCloseDeleteDialog();

      } catch (error) {
        console.error("Error al eliminar el control:", error);
        // Abrir el Snackbar de error
        setOpenDeleteErrorSnackbar(true);
      }
    }
  };

  const columns = [
    { field: "nombrePaciente", headerName: "Nombre del Paciente", flex: 2 },
    { field: "categoria", headerName: "Categoría", flex: 1 },
    { field: "servicio", headerName: "Servicio", flex: 1.5 },
    { field: "estadoCita", headerName: "Estado de la Cita", flex: 1 },
    { field: "fechaControl", headerName: "Fecha del Control", flex: 2 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            to={`/view/verControl?id=${params.row.id}`}
            state={{ servicioData: params.row }}
            style={{ textDecoration: 'none' }}
          >
            <Button
              sx={{ 
                minWidth: "40px", 
                marginRight: '5px',
                '& .MuiSvgIcon-root': {
                  color: colors.greenAccent[500],
                  transition: 'all 0.3s ease-in-out',
                },
                '&:hover .MuiSvgIcon-root': {
                  color: '#868dfb',
                  transform: 'scale(1.2)',
                }
              }}
            >
              <VisibilityOutlinedIcon />
            </Button>
          </Link>
    
          <Link
            to={`/edit/editarControl?id=${params.row.id}`}
            state={{ controlData: params.row }}
            style={{ textDecoration: 'none' }}
          >
            <Button 
              sx={{ 
                minWidth: "40px", 
                marginRight: '5px',
                '& .MuiSvgIcon-root': {
                  color: colors.greenAccent[500],
                  transition: 'all 0.3s ease-in-out',
                },
                '&:hover .MuiSvgIcon-root': {
                  color: '#868dfb',
                  transform: 'scale(1.2)',
                }
              }}
            >
              <EditOutlinedIcon />
            </Button>
          </Link>
    
          <Button 
            onClick={() => handleOpenDeleteDialog(params.row.id)} 
            sx={{ 
              minWidth: "40px",
              '& .MuiSvgIcon-root': {
                color: colors.greenAccent[500],
                transition: 'all 0.3s ease-in-out',
              },
              '&:hover .MuiSvgIcon-root': {
                color: '#868dfb',
                transform: 'scale(1.2)',
              }
            }}
          >
            <DeleteOutlineIcon />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Controles Subsecuentes"
          subtitle="Lista de controles subsecuentes registrados en el sistema"
        />
        <Box>
          <Link to="/form/crearControl" style={{ textDecoration: 'none' }}>
            <Button
              sx={{
                backgroundColor: colors.greenAccent[500],
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
              <AddOutlinedIcon 
                sx={{ 
                  mr: "10px",
                  transition: "transform 0.3s ease-in-out"
                }} 
              />
              Agregar Control
            </Button>
          </Link>
        </Box>
      </Box>
      <Box
        m="0 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          rows={controles}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            sorting: {
              sortModel: [
                { field: 'nombrePaciente', sort: 'asc' },
                { field: 'fechaControl', sort: 'desc' }, // Corregido 'des' a 'desc'
                { field: 'estadoCita', sort: 'asc' },
                { field: 'categoria', sort: 'asc' },
                { field: 'servicio', sort: 'asc' }
              ],
            },
          }}
          loading={loading} // Mostrar indicador de carga si es necesario
        />
      </Box>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ m: 0, p: 2 }}>
          Confirmar Eliminación
          <IconButton
            aria-label="close"
            onClick={handleCloseDeleteDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar este control? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de Éxito al Eliminar */}
      <Snackbar
        open={openDeleteSuccessSnackbar}
        autoHideDuration={3000} // Duración de 3 segundos
        onClose={() => setOpenDeleteSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
      >
        <Alert 
          onClose={() => setOpenDeleteSuccessSnackbar(false)}
          severity="success" 
          sx={{ 
            width: '100%', 
            fontSize: '1.2em', // Aumentar tamaño de fuente
            backgroundColor: '#d4edda', // Fondo verde claro
            color: '#155724' // Texto verde oscuro
          }}
        >
          Control eliminado exitosamente.
        </Alert>
      </Snackbar>

      {/* Snackbar de Error al Eliminar */}
      <Snackbar
        open={openDeleteErrorSnackbar}
        autoHideDuration={3000} // Duración de 3 segundos
        onClose={() => setOpenDeleteErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
      >
        <Alert 
          onClose={() => setOpenDeleteErrorSnackbar(false)}
          severity="error" 
          sx={{ 
            width: '100%', 
            fontSize: '1.2em', // Aumentar tamaño de fuente
            backgroundColor: '#f8d7da', // Fondo rojo claro
            color: '#721c24' // Texto rojo oscuro
          }}
        >
          Hubo un error al eliminar el control. Por favor, intenta nuevamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Controles;
