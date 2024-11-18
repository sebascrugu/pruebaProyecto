import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Select, MenuItem, Snackbar, Alert, useTheme, useMediaQuery, 
  FilledInput, InputLabel, FormControl, FormHelperText, CircularProgress, Autocomplete 
} from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';
import { tokens } from '../../theme';
import { NumericFormat } from 'react-number-format';

// Extiende dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

// Establece la zona horaria por defecto a la local
dayjs.tz.setDefault(dayjs.tz.guess());

const CrearControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navegar = useNavigate();
  
  // Estados para controlar la visibilidad de los Snackbars
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [openMissingFieldsSnackbar, setOpenMissingFieldsSnackbar] = useState(false); // Nuevo Snackbar

  const location = useLocation();
  const { editMode, controlData } = location.state || { editMode: false, controlData: null };
  
  const [pacientes, setPacientes] = useState([]);
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [idPaciente, setIdPaciente] = useState(null);

  const [servicioOptions, setServicioOptions] = useState([]);
  const [categoriasServicioOptions, setCategoriasServicioOptions] = useState([]);
  const [formaDePagoOptions, setFormaDePagoOptions] = useState([]);
  const [estadoCitaOptions, setEstadoCitaOptions] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [estadoCitaDeshabilitado, setEstadoCitaDeshabilitado] = useState(true);

  const [controles, setControles] = useState([]); // Estado para almacenar controles existentes
  const [bookedSlotsMap, setBookedSlotsMap] = useState({}); // Mapa de slots reservados

  // Función para redondear la hora hacia abajo al intervalo de media hora
  const getRoundedDownTime = () => {
    const now = dayjs();
    const minutes = now.minute();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    return now.minute(roundedMinutes).second(0).millisecond(0);
  };

  // Esquema de validación sin fecha_creacion_control
  const validationSchema = yup.object().shape({
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
    // Removido fecha_creacion_control
  });

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getPacientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener los pacientes');
        }

        const data = await response.json();
        console.log("Pacientes recibidos:", data);
        setPacientes(data);
        setLoadingPacientes(false);
      } catch (error) {
        console.error('Error al fetch pacientes:', error);
        setLoadingPacientes(false);
      }
    };

    const fetchCategoriasServicio = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getCategoriasServicio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener las categorias servicios');
        }
        const data = await response.json();

        const transformedData = data.map(({ id_categoria_servicio, nombre_categoria_servicio }) => ({
          id: id_categoria_servicio,
          nombre: nombre_categoria_servicio,
        }));

        setCategoriasServicioOptions(transformedData);
      } catch (error) {
        console.error('Error al fetch:', error);
      }
    };

    const fetchServicios = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getServicios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener los servicios');
        }
        const data = await response.json();

        const transformedData = data.map(({ id_servicio, id_categoria_servicio, nombre_servicio }) => ({
          id: id_servicio,
          id_categoria_servicio: id_categoria_servicio,
          nombre: nombre_servicio,
        }));

        setServicioOptions(transformedData);
      } catch (error) {
        console.error('Error al fetch:', error);
      }
    };

    const fetchEstadosCita = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getEstadosCita', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener los estados cita');
        }
        const data = await response.json();

        const transformedData = data.map(({ id_estado_cita, nombre_estado_cita }) => ({
          id: id_estado_cita,
          nombre: nombre_estado_cita,
        }));

        setEstadoCitaOptions(transformedData);
      } catch (error) {
        console.error('Error al fetch:', error);
      }
    };

    const fetchFormasDePago = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getFormasDePago', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Error al obtener las formas de pago');
        }
        const data = await response.json();

        const transformedData = data.map(({ id_forma_pago, nombre_forma_pago }) => ({
          id: id_forma_pago,
          nombre: nombre_forma_pago,
        }));

        setFormaDePagoOptions(transformedData);
      } catch (error) {
        console.error('Error al fetch formas de pago:', error);
      }
    };

    fetchPacientes();
    fetchServicios();
    fetchEstadosCita();
    fetchFormasDePago();
    fetchCategoriasServicio();
  }, []);

  // Fetch controles existentes y crear bookedSlotsMap
  useEffect(() => {
    const fetchControles = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getControlesSubsecuentes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // No enviar parámetros para obtener todos los controles
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setControles(data);

        // Crear un mapa con la fecha como clave y un array de {hora, minuto} reservados
        const map = {};
        data.forEach(control => {
          // Filtrar solo los controles con id_estado_cita en [1, 2, 4]
          if ([1, 2, 4].includes(control.id_estado_cita)) {
            // Asegúrate de parsear la fecha como local
            const controlTime = dayjs(control.fecha_hora_control, 'YYYY-MM-DD HH:mm:ss').tz(dayjs.tz.guess(), true);
            const dateKey = controlTime.format('YYYY-MM-DD');
            if (!map[dateKey]) {
              map[dateKey] = [];
            }
            map[dateKey].push({ hour: controlTime.hour(), minute: controlTime.minute() });
          }
        });
        setBookedSlotsMap(map);
        console.log('bookedSlotsMap:', map); // Para depuración
      } catch (error) {
        console.error("Error fetching controles:", error);
      }
    };

    fetchControles();
  }, []);

  const pacienteOptions = React.useMemo(() => {
    return pacientes.map((paciente) => ({
      label: `${paciente.identificacion_paciente} - ${paciente.nombre_paciente} ${paciente.primer_apellido_paciente} ${paciente.segundo_apellido_paciente || ''}`,
      identificacion_paciente: paciente.identificacion_paciente,
      nombre_completo: `${paciente.nombre_paciente} ${paciente.primer_apellido_paciente} ${paciente.segundo_apellido_paciente || ''}`,
      id_paciente: paciente.id_paciente,
    }));
  }, [pacientes]);

  const initialValues = editMode ? {
    id_paciente: controlData.id_paciente || '',
    id_servicio: controlData.id_servicio || '',
    id_categoria_servicio: controlData.id_categoria_servicio || '',
    fecha_hora_control: dayjs(controlData.fecha_hora_control, 'YYYY-MM-DD HH:mm:ss').tz(dayjs.tz.guess(), true) || dayjs(),
    motivo_consulta_control: controlData.motivo_consulta_control || "",
    observaciones_control: controlData.observaciones_control || "",
    monto_control: controlData.monto_control || "",
    id_forma_pago: controlData.id_forma_pago || "",
    id_estado_cita: controlData.id_estado_cita || '',
  } : {
    id_paciente: '',
    id_servicio: '',
    id_categoria_servicio: '',
    fecha_hora_control: getRoundedDownTime(), // Utiliza la hora redondeada
    motivo_consulta_control: "",
    observaciones_control: "",
    monto_control: "",
    id_forma_pago: "",
    id_estado_cita: '',
  };

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    const formattedFechaControl = values.fecha_hora_control 
      ? values.fecha_hora_control.format('YYYY-MM-DD HH:mm:ss') 
      : '';
    const formattedFechaCreacionControl = dayjs().format('YYYY-MM-DD'); // Establecer la fecha actual

    if (!idPaciente) {
      setOpenErrorSnackbar(true);
      setSubmitting(false);
      return;
    }

    const dataNueva = {
      id_paciente: idPaciente,
      id_servicio: values.id_servicio || 0, // Asigna 0 si no se proporciona
      id_categoria_servicio: values.id_categoria_servicio || 0, // Asigna 0 si no se proporciona
      fecha_hora_control: formattedFechaControl,
      motivo_consulta_control: values.motivo_consulta_control.trim() || "", // Asigna cadena vacía si no se proporciona
      observaciones_control: values.observaciones_control.trim() || "", // Asigna cadena vacía si no se proporciona
      monto_control: values.monto_control ? parseFloat(values.monto_control) : 0, // Asigna 0 si no se proporciona
      id_forma_pago: values.id_forma_pago ? parseInt(values.id_forma_pago) : 2, // Asigna 2 si no se proporciona
      id_estado_cita: values.id_estado_cita || 0, // Asigna 0 si no se proporciona
      fecha_creacion_control: formattedFechaCreacionControl, // Establecer fecha actual
    };

    console.log('Datos enviados al servidor:', dataNueva);
    setSubmitting(true);

    try {
      const respuesta = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/createControlesSubsecuentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataNueva),
      });

      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }

      const data = await respuesta.text();
      console.log('Respuesta del servidor:', data);

      if (data.includes('se agregó')) {
        setOpenSuccessSnackbar(true);
        resetForm();
        // Retrasar la navegación para permitir que el Snackbar se muestre
        setTimeout(() => {
          navegar('/controles');
        }, 3000); // 3 segundos de retraso
      } else {
        console.error('Error en la respuesta del servidor:', data);
        setOpenErrorSnackbar(true);
      }
    } catch (error) {
      console.error('Error al enviar datos al servidor:', error);
      setOpenErrorSnackbar(true);
    }

    setSubmitting(false);
  };

  // Función para verificar si una hora está ya reservada en la fecha seleccionada
  const isTimeSlotBooked = (selectedDate, hour, minute) => {
    const localDate = dayjs(selectedDate).tz(dayjs.tz.guess(), true);
    const dateKey = localDate.format('YYYY-MM-DD');
    const localHour = localDate.hour();
    const localMinute = localDate.minute();
    const isBooked = bookedSlotsMap[dateKey]?.some(slot => slot.hour === localHour && slot.minute === localMinute) || false;
    return isBooked;
  };

  const Form = () => {
    const isNonMobile = useMediaQuery("(min-width:600px)");

    return (
      <Box m="20px">
        <Header title="Crear Control" subtitle="Agregar nuevo control subsecuente a un paciente" />

        <Formik
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
            isValid,
            dirty
          }) => (
            <form onSubmit={handleSubmit}>
              {/* Selección de Paciente */}
              <Box 
                display="grid" 
                gap="30px" 
                gridTemplateColumns="repeat(12, minmax(0, 1fr))" 
                sx={{ "& > div": { gridColumn: isNonMobile ? "span 3" : "span 12" } }}
              >
                <Autocomplete
                  id="autocomplete-cedula-paciente"
                  options={pacienteOptions}
                  loading={loadingPacientes}
                  noOptionsText={loadingPacientes ? 'Cargando...' : 'No hay opciones'}
                  filterOptions={(options, { inputValue }) => {
                    if (!inputValue) {
                      return options.slice(0, 5);
                    }
                    return options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()));
                  }}
                  getOptionLabel={(option) => option.label}
                  value={selectedPaciente}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setNombrePaciente(newValue.nombre_completo);
                      setIdPaciente(newValue.id_paciente);
                      setSelectedPaciente(newValue);
                      console.log('Paciente seleccionado:', newValue);
                    } else {
                      setNombrePaciente('');
                      setIdPaciente(null);
                      setSelectedPaciente(null);
                      console.log('Paciente deseleccionado');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cédula del Paciente*"
                      variant="filled"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingPacientes ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  sx={{ gridColumn: "span 3" }}
                />
                <TextField
                  disabled
                  id="nombre-paciente"
                  label="Nombre del Paciente"
                  variant="filled"
                  InputProps={{ readOnly: true }}
                  value={nombrePaciente}
                  sx={{ gridColumn: "span 3" }}
                />
                <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                  <InputLabel id="categoria_servicio-label">Categoría*</InputLabel>
                  <Select
                    labelId="categoria_servicio-label"
                    id="id_categoria_servicio-select"
                    value={values.id_categoria_servicio || ""}
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue('id_servicio', ''); // Reiniciar el servicio seleccionado al cambiar de categoría
                    }}
                    onBlur={handleBlur}
                    name="id_categoria_servicio"
                    error={!!touched.id_categoria_servicio && !!errors.id_categoria_servicio}
                  >
                    {categoriasServicioOptions.map((categoriasServicio) => (
                      <MenuItem key={categoriasServicio.id} value={categoriasServicio.id}>
                        {categoriasServicio.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.id_categoria_servicio && errors.id_categoria_servicio && (
                    <FormHelperText error>{errors.id_categoria_servicio}</FormHelperText>
                  )}
                </FormControl>
                <FormControl variant="filled" sx={{ gridColumn: "span 3" }} disabled={!values.id_categoria_servicio}>
                  <InputLabel id="servicio-label">Servicio*</InputLabel>
                  <Select
                    labelId="servicio-label"
                    id="id_servicio-select"
                    value={values.id_servicio || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="id_servicio"
                    error={!!touched.id_servicio && !!errors.id_servicio}
                  >
                    {servicioOptions
                      .filter(servicio => servicio.id_categoria_servicio === values.id_categoria_servicio)
                      .map((servicio) => (
                        <MenuItem key={servicio.id} value={servicio.id}>
                          {servicio.nombre}
                        </MenuItem>
                      ))}
                  </Select>
                  {touched.id_servicio && errors.id_servicio && (
                    <FormHelperText error>{errors.id_servicio}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <br />

              {/* Selección de Monto, Forma de Pago, Estado Cita y Fecha/Hora */}
              <Box 
                display="grid" 
                gap="30px" 
                gridTemplateColumns="repeat(12, minmax(0, 1fr))" 
                sx={{ "& > div": { gridColumn: isNonMobile ? "span 3" : "span 12" } }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Seleccionar fecha y hora*"
                    views={['year', 'month', 'day', 'hours']} // Limita la selección hasta las horas
                    value={values.fecha_hora_control}
                    onChange={(newValue) => {
                      // Asegura que los minutos siempre estén en 0
                      const localValue = dayjs(newValue)
                        .tz(dayjs.tz.guess(), true)
                        .minute(0)
                        .second(0)
                        .millisecond(0);
                      setFieldValue('fecha_hora_control', localValue);
                      
                      const now = dayjs();
                      if (localValue.isAfter(now)) {
                        setFieldValue('id_estado_cita', 1);
                        setEstadoCitaDeshabilitado(true);
                      } else {
                        setFieldValue('id_estado_cita', 0);
                        setEstadoCitaDeshabilitado(false);
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
                        sx: { gridColumn: 'span 3' },
                      },
                    }}
                  />
                </LocalizationProvider>

                <FormControl variant="filled" sx={{ gridColumn: "span 3" }} disabled={estadoCitaDeshabilitado}>
                  <InputLabel id="estado-cita-label">Estado Cita*</InputLabel>
                  <Select
                    labelId="estado-cita-label"
                    id="id_estado_cita-select"
                    value={values.id_estado_cita || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="id_estado_cita"
                    error={!!touched.id_estado_cita && !!errors.id_estado_cita}
                  >
                    {estadoCitaOptions.map((estadoCita) => (
                      <MenuItem key={estadoCita.id} value={estadoCita.id}>
                        {estadoCita.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.id_estado_cita && errors.id_estado_cita && (
                    <FormHelperText error>{errors.id_estado_cita}</FormHelperText>
                  )}
                </FormControl>
                <FormControl variant="filled" sx={{ gridColumn: "span 3" }}>
                  <InputLabel id="forma-pago-label">Forma de Pago</InputLabel>
                  <Select
                    labelId="forma-pago-label"
                    id="id_forma_pago-select"
                    value={values.id_forma_pago || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="id_forma_pago"
                    error={!!touched.id_forma_pago && !!errors.id_forma_pago}
                  >
                    {formaDePagoOptions.map((formaDePago) => (
                      <MenuItem key={formaDePago.id} value={formaDePago.id}>
                        {formaDePago.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.id_forma_pago && errors.id_forma_pago && (
                    <FormHelperText error>{errors.id_forma_pago}</FormHelperText>
                  )}
                </FormControl>
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
                  id="motivo_consulta_control-input"
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
                  id="observaciones_control-input"
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
                  type="button" // Cambiado de "submit" a "button"
                  color="secondary"
                  variant="contained"
                  onClick={() => {
                    if (isValid && dirty) {
                      handleSubmit(); // Enviar el formulario si es válido
                    } else {
                      setOpenMissingFieldsSnackbar(true); // Mostrar Snackbar si falta información
                    }
                  }}
                  sx={{
                    backgroundColor: isValid && dirty ? colors.greenAccent[500] : colors.grey[400], // Cambiar color según validez
                    color: colors.grey[100],
                    fontSize: "14px",
                    fontWeight: "bold",
                    padding: "10px 20px",
                    transition: "all 0.3s ease-in-out",
                    minWidth: "160px",
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
                  <AddCircleOutlinedIcon 
                    sx={{ 
                      mr: "10px",
                      transition: "transform 0.3s ease-in-out"
                    }} 
                  />
                  {editMode ? "Actualizar Control" : "Crear Nuevo Control"}
                </Button>
              </Box>
              
              {/* Snackbars Mejorados */}
              
              {/* Snackbar para Errores del Servidor */}
              <Snackbar
                open={openErrorSnackbar}
                autoHideDuration={8000} // Incrementar duración a 8 segundos para errores
                onClose={() => setOpenErrorSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    fontSize: '1.2em', // Aumentar tamaño de fuente
                    backgroundColor: '#f8d7da', // Fondo rojo claro
                    color: '#721c24' // Texto rojo oscuro
                  }}
                >
                  Por favor, revise todos los campos obligatorios.
                </Alert>
              </Snackbar>
              
              {/* Snackbar para Campos Faltantes */}
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
              
              {/* Snackbar para Éxito */}
              <Snackbar
                open={openSuccessSnackbar}
                autoHideDuration={3000} // Cambiar duración a 3 segundos
                onClose={() => setOpenSuccessSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Posición superior central
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    width: '100%', 
                    fontSize: '1.2em', // Aumentar tamaño de fuente
                    backgroundColor: '#d4edda', // Fondo verde claro
                    color: '#155724' // Texto verde oscuro
                  }}
                >
                  Control creado exitosamente.
                </Alert>
              </Snackbar>
            </form>
          )}
        </Formik>
      </Box>
    );
  };

  return <Form />;
};

export default CrearControl;
