// src/scenes/edit/editarControl.jsx
import * as React from 'react';
import { Box, Button, TextField, useTheme, Select, MenuItem, Snackbar, Alert, InputAdornment, FormControl, InputLabel, FormHelperText,FilledInput } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { tokens } from '../../theme';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import { NumericFormat } from 'react-number-format';

// Extiende dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

// Establece la zona horaria por defecto a la local
dayjs.tz.setDefault(dayjs.tz.guess());

const EditarControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navegar = useNavigate();
  const location = useLocation();
  const { controlData } = location.state || { controlData: null };
  const [searchParams] = useSearchParams(); // Para obtener el id desde la URL
  const idControl = searchParams.get("id"); // Obtener el id del control desde la URL
  const [controlInfo, setControlInfo] = useState(
    controlData
      ? { ...controlData, id_control_subsecuente: controlData.id }
      : null
  );  
  const [loading, setLoading] = useState(true); // Controlar la carga de datos
  const [pacienteOptions, setPacienteOptions] = useState([]);
  const [servicioOptions, setServicioOptions] = useState([]);
  const [categoriaOptions, setCategoriaOptions] = useState([]);
  const [formaPagoOptions, setFormaPagoOptions] = useState([]);
  const [estadoCitaOptions, setEstadoCitaOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(true);
  const [bookedSlotsMap, setBookedSlotsMap] = useState({});

  // Estados para controlar la visibilidad de los Snackbars
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = React.useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = React.useState(false);
  
  // Cargar las opciones de pacientes, servicios, categorías, formas de pago y estados de cita
  useEffect(() => {
    console.log('Datos de controlData desde location.state:', controlData);
    console.log('ID del control desde la URL:', idControl);
    const fetchData = async () => {
      try {
        const responsePacientes = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getPacientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const dataPacientes = await responsePacientes.json();
        
        // Mapear y agregar nombreCompleto e identificacion_paciente
        const dataPacientesConNombreCompleto = dataPacientes.map((paciente) => ({
          ...paciente,
          nombreCompleto: `${paciente.nombre_paciente} ${paciente.primer_apellido_paciente} ${paciente.segundo_apellido_paciente || ''}`.trim(),
          identificacion_paciente: paciente.identificacion_paciente, // Asegurar que esté incluido
        }));
        
        setPacienteOptions(dataPacientesConNombreCompleto);        

        const responseServicios = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getServicios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const dataServicios = await responseServicios.json();
        setServicioOptions(dataServicios);

        const responseCategorias = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getCategoriasServicio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const dataCategorias = await responseCategorias.json();
        setCategoriaOptions(dataCategorias);

        const responseFormaPago = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getFormasDePago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const dataFormasPago = await responseFormaPago.json();
        setFormaPagoOptions(dataFormasPago);

        const responseEstadosCita = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getEstadosCita', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const dataEstadosCita = await responseEstadosCita.json();
        setEstadoCitaOptions(dataEstadosCita);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setOptionsLoading(false); // Opciones cargadas
      }
    };
    fetchData();
  }, []);

  
  // Cargar los datos del control si no están en `controlData`
  useEffect(() => {
    console.log('Datos de controlData desde location.state:', controlData);
    console.log('ID del control desde la URL:', idControl);
    if (!controlData && idControl) {
      const fetchControl = async () => {
        try {
          const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getControlesSubsecuentes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_control_subsecuente: idControl }),
          });

          const data = await response.json();
          console.log('Datos del control obtenidos desde la API:', data);
          // Suponiendo que la API devuelve un array con los datos del control
          if (data.length > 0) {
            setControlInfo(data[0]); // Establecer los datos del control
          } else {
            console.log('No se encontraron datos para el control con id:', idControl);
          }

          setLoading(false); // Datos cargados correctamente
        } catch (error) {
          console.error("Error al obtener el control:", error);
        } finally {
          setControlLoading(false); // Control cargado
        }
      };
      fetchControl();
    } else {
      setControlLoading(false); // Si ya tenemos los datos, no necesitamos cargar
    }
  }, [controlData, idControl]);

  // Crear bookedSlotsMap después de tener controlInfo
  useEffect(() => {
    const fetchBookedSlots = async () => {
      try {
        // Obtener todos los controles subsecuentes
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getControlesSubsecuentes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Puedes ajustar el body si la API soporta filtros
        });

        if (!response.ok) {
          throw new Error('Error al obtener los controles subsecuentes');
        }

        const data = await response.json();

        // Filtrar el control actual para evitar considerarlo en los slots reservados
        const filteredData = data.filter(control => control.id_control_subsecuente !== parseInt(idControl));

        // Crear el mapa de slots reservados
        const map = {};
        filteredData.forEach(control => {
          const controlTime = dayjs(control.fecha_hora_control, 'YYYY-MM-DD HH:mm:ss').tz(dayjs.tz.guess(), true);
          const dateKey = controlTime.format('YYYY-MM-DD');
          if (!map[dateKey]) {
            map[dateKey] = [];
          }
          map[dateKey].push({ hour: controlTime.hour(), minute: controlTime.minute() });
        });

        setBookedSlotsMap(map);
        console.log('bookedSlotsMap:', map); // Para depuración
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    if (idControl) {
      fetchBookedSlots();
    }
  }, [idControl]);

  if (optionsLoading || controlLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Definir validaciones con Yup (Alineadas con crearControl.jsx)
  const validationSchema = yup.object().shape({
    // No need to validate id_paciente since it's read-only
    id_servicio: yup.number().required('Servicio es requerido'),
    id_categoria_servicio: yup.number().required('Categoría de Servicio es requerida'),
    fecha_hora_control: yup.date().required('Fecha y Hora son requeridas'),
    motivo_consulta_control: yup.string().nullable(),
    observaciones_control: yup.string().nullable(),
    monto_control: yup
      .number()
      .typeError('Monto debe ser un número')
      .positive('Monto debe ser positivo')
      .nullable(),
    id_forma_pago: yup.number().nullable(),
    id_estado_cita: yup.number().required('Estado de Cita es requerido'),
  });

  // Valores iniciales del formulario
  const initialValues = controlInfo ? {
    id_paciente: controlInfo.id_paciente || '',
    id_servicio: controlInfo.id_servicio || '',
    id_categoria_servicio: controlInfo.id_categoria_servicio || '',
    fecha_hora_control: controlInfo.fechaControlRaw
      ? dayjs(controlInfo.fechaControlRaw, 'YYYY-MM-DD HH:mm:ss').tz(dayjs.tz.guess(), true)
      : dayjs(),
    motivo_consulta_control: controlInfo.motivo_consulta_control || '',
    observaciones_control: controlInfo.observaciones_control || '',
    monto_control: parseFloat(controlInfo.monto_control) || '',
    id_forma_pago: parseInt(controlInfo.id_forma_pago) || '',
    id_estado_cita: parseInt(controlInfo.id_estado_cita) || '',
  } : {
    // Valores por defecto  
    id_paciente: '',
    id_servicio: '',
    id_categoria_servicio: '',
    fecha_hora_control: dayjs(),
    motivo_consulta_control: '',
    observaciones_control: '',
    monto_control: '',
    id_forma_pago: '',
    id_estado_cita: '',
  };
  
  console.log('Valores iniciales para el formulario:', initialValues);


  // Manejar la actualización del control
  const handleFormSubmit = async (values, { setSubmitting }) => {
    const formattedFechaControl = values.fecha_hora_control 
      ? values.fecha_hora_control.format('YYYY-MM-DD HH:mm:ss') 
      : null;

    const dataActualizada = {
      id_control_subsecuente: controlInfo.id_control_subsecuente, // Use the correct field name
      id_paciente: values.id_paciente,
      id_servicio: values.id_servicio,
      id_categoria_servicio: values.id_categoria_servicio,
      fecha_hora_control: formattedFechaControl,
      motivo_consulta_control: values.motivo_consulta_control,
      observaciones_control: values.observaciones_control,
      monto_control: values.monto_control,
      id_forma_pago: values.id_forma_pago,
      id_estado_cita: values.id_estado_cita,
      indicaciones_control: controlInfo.indicaciones_control || '' // Assuming it's part of controlInfo
    };

    console.log('Datos que se enviarán al actualizar:', dataActualizada);

    setSubmitting(true);
    try {
      const respuesta = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/updateControlesSubsecuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataActualizada),
      });

      const resultadoTexto = await respuesta.text();
      console.log('Respuesta del servidor:', resultadoTexto);
  
      if (respuesta.ok && resultadoTexto.includes('se modificó')) {
        // Suponiendo que el servidor retorna un mensaje de éxito
        setOpenSuccessSnackbar(true);
        setTimeout(() => {
          navegar('/controles');
        }, 2000);
      } else {
        // Si el servidor retorna un código de error
        console.error('Error del servidor:', resultadoTexto);
        setOpenErrorSnackbar(true);
      }
    } catch (error) {
      console.error('Error al actualizar el control:', error);
      setOpenErrorSnackbar(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Función para verificar si una hora está ya reservada en la fecha seleccionada
  const isTimeSlotBooked = (selectedDate, hour, minute) => {
    const localDate = dayjs(selectedDate).tz(dayjs.tz.guess(), true);
    const dateKey = localDate.format('YYYY-MM-DD');
    const isBooked = bookedSlotsMap[dateKey]?.some(slot => slot.hour === hour && slot.minute === minute) || false;
    return isBooked;
  };

  return (
    <Box m="20px">
      <Header title="Editar Control" subtitle="Actualiza la información del control subsecuente" />

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
          setFieldValue,
          isSubmitting,
          isValid,
          dirty,
        }) => {
          // Find the selected paciente based on id_paciente
          const selectedPaciente = pacienteOptions.find(p => p.id_paciente === values.id_paciente);

          return (
            <form onSubmit={handleSubmit}>
                <Box 
                  display="grid" 
                  gap="30px" 
                  gridTemplateColumns="repeat(12, minmax(0, 1fr))" 
                  sx={{ "& > div": { gridColumn: isNonMobile ? "span 3" : "span 12" } }}
                >
                  {/* Cédula del Paciente (read-only) */}
                  <TextField
                    disabled
                    label="Cédula del Paciente"
                    variant="filled"
                    value={selectedPaciente?.identificacion_paciente || ''}
                    sx={{ gridColumn: "span 3" }}
                  />
                  {/* Nombre del Paciente (read-only) */}
                  <TextField
                    disabled
                    label="Nombre del Paciente"
                    variant="filled"
                    value={selectedPaciente?.nombreCompleto || ''}
                    sx={{ gridColumn: "span 3" }}
                  />

                  {/* Selección de Categoría de Servicio */}
                  <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                    <InputLabel id="categoria-label">Categoría</InputLabel>
                    <Select
                      labelId="categoria-label"
                      id="id_categoria_servicio-select"
                      name="id_categoria_servicio"
                      value={values.id_categoria_servicio}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldValue('id_servicio', ''); // Reiniciar el servicio seleccionado al cambiar de categoría
                      }}
                      onBlur={handleBlur}
                      error={!!touched.id_categoria_servicio && !!errors.id_categoria_servicio}
                    >
                      {categoriaOptions.map((categoria) => (
                        <MenuItem key={categoria.id_categoria_servicio} value={categoria.id_categoria_servicio}>
                          {categoria.nombre_categoria_servicio}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.id_categoria_servicio && errors.id_categoria_servicio && (
                      <FormHelperText error>{errors.id_categoria_servicio}</FormHelperText>
                    )}
                  </FormControl>

                  {/* Selección de Servicio */}
                  <FormControl variant="filled" sx={{ gridColumn: "span 3" }} disabled={!values.id_categoria_servicio}>
                    <InputLabel id="servicio-label">Servicio</InputLabel>
                    <Select
                      labelId="servicio-label"
                      id="id_servicio-select"
                      name="id_servicio"
                      value={values.id_servicio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.id_servicio && !!errors.id_servicio}
                    >
                      {servicioOptions
                        .filter(servicio => servicio.id_categoria_servicio === values.id_categoria_servicio)
                        .map(servicio => (
                          <MenuItem key={servicio.id_servicio} value={servicio.id_servicio}>
                            {servicio.nombre_servicio}
                          </MenuItem>
                        ))}
                    </Select>
                    {touched.id_servicio && errors.id_servicio && (
                      <FormHelperText error>{errors.id_servicio}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                <br />
                
                <Box 
                  display="grid" 
                  gap="30px" 
                  gridTemplateColumns="repeat(12, minmax(0, 1fr))" 
                  sx={{ "& > div": { gridColumn: isNonMobile ? "span 3" : "span 12" } }}
                >
                  {/* Fecha y Hora del Control */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Fecha y hora del control"
                      views={['year', 'month', 'day', 'hours']} // Limita la selección hasta las horas
                      value={values.fecha_hora_control}
                      onChange={(newValue) => {
                        // Redondear los minutos a 0 o 30
                        const roundedMinutes = newValue.minute() < 30 ? 0 : 30;
                        const localValue = dayjs(newValue)
                          .tz(dayjs.tz.guess(), true)
                          .minute(roundedMinutes)
                          .second(0)
                          .millisecond(0);
                        setFieldValue('fecha_hora_control', localValue);
                        
                        const now = dayjs();
                        if (localValue.isAfter(now)) {
                          setFieldValue('id_estado_cita', 1);
                          // Aquí podrías añadir lógica adicional si es necesario
                        } else {
                          setFieldValue('id_estado_cita', 0);
                          // Aquí podrías añadir lógica adicional si es necesario
                        }
                      }}
                      shouldDisableTime={(value, clockType) => {
                        if (clockType === 'hours') {
                          return isTimeSlotBooked(values.fecha_hora_control, value);
                        }
                        return false;
                      }}
                      slotProps={{
                        textField: {
                          variant: 'filled',
                          sx: { gridColumn: 'span 6' },
                          error: !!touched.fecha_hora_control && !!errors.fecha_hora_control,
                          helperText: touched.fecha_hora_control && errors.fecha_hora_control,
                        },
                      }}
                    />
                  </LocalizationProvider>
                  
                  {/* Estado de la Cita */}
                  <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                    <InputLabel id="estado-cita-label">Estado de la Cita</InputLabel>
                    <Select
                      labelId="estado-cita-label"
                      id="id_estado_cita-select"
                      name="id_estado_cita"
                      value={values.id_estado_cita}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.id_estado_cita && !!errors.id_estado_cita}
                    >
                      {estadoCitaOptions.map((estadoCita) => (
                        <MenuItem key={estadoCita.id_estado_cita} value={estadoCita.id_estado_cita}>
                          {estadoCita.nombre_estado_cita}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.id_estado_cita && errors.id_estado_cita && (
                      <FormHelperText error>{errors.id_estado_cita}</FormHelperText>
                    )}
                  </FormControl>
                  
                  {/* Forma de Pago */}
                  <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                    <InputLabel id="forma-pago-label">Forma de Pago</InputLabel>
                    <Select
                      labelId="forma-pago-label"
                      id="id_forma_pago-select"
                      name="id_forma_pago"
                      value={values.id_forma_pago}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={!!touched.id_forma_pago && !!errors.id_forma_pago}
                    >
                      {formaPagoOptions.map((formaPago) => (
                        <MenuItem key={formaPago.id_forma_pago} value={formaPago.id_forma_pago}>
                          {formaPago.nombre_forma_pago}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.id_forma_pago && errors.id_forma_pago && (
                      <FormHelperText error>{errors.id_forma_pago}</FormHelperText>
                    )}
                  </FormControl>

                  {/* Monto */}
                  <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                  <InputLabel htmlFor="filled-adornment-amount">Monto</InputLabel>
                  <NumericFormat
                    id="monto_control-input"
                    name="monto_control"
                    value={values.monto_control}
                    onValueChange={(values) => {
                      setFieldValue('monto_control', values.floatValue || '');
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    customInput={FilledInput}
                    prefix="₡"
                  />
                  {touched.monto_control && errors.monto_control && (
                    <FormHelperText error>{errors.monto_control}</FormHelperText>
                  )}
                </FormControl>
                </Box>
                <br />
                {/* Motivo y Observaciones */}
                <Box 
                  display="grid" 
                  gap="30px" 
                  gridTemplateColumns="repeat(3, minmax(0, 1fr))" 
                  sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 3" } }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Motivo"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.motivo_consulta_control}
                    name="motivo_consulta_control"
                    error={!!touched.motivo_consulta_control && !!errors.motivo_consulta_control}
                    helperText={touched.motivo_consulta_control && errors.motivo_consulta_control}
                    sx={{ gridColumn: "span 12" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Observaciones"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.observaciones_control}
                    name="observaciones_control"
                    error={!!touched.observaciones_control && !!errors.observaciones_control}
                    helperText={touched.observaciones_control && errors.observaciones_control}
                    sx={{ gridColumn: "span 12" }}
                  />
                </Box>

                {/* Botones y Snackbars */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt="40px">
                  <Button
                    onClick={() => navegar('/controles')}
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
                    severity="success" 
                    sx={{ 
                      width: '100%', 
                      fontSize: '1.2em', 
                      backgroundColor: '#d4edda', 
                      color: '#155724' 
                    }}
                  >
                    Control actualizado exitosamente.
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
                    severity="error" 
                    sx={{ 
                      width: '100%', 
                      fontSize: '1.2em', 
                      backgroundColor: '#f8d7da', 
                      color: '#721c24' 
                    }}
                  >
                    Error al actualizar el control. Por favor revise los campos.
                  </Alert>
                </Snackbar>
              </form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default EditarControl;
