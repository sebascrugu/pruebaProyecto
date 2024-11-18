// VerControles.jsx

import React from 'react';
import { Box, Card, CardContent, Typography, Button, useTheme } from "@mui/material";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es'; // Importa el locale español

// Extiende dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

// Establece la zona horaria por defecto a la local
dayjs.tz.setDefault(dayjs.tz.guess());

// Establece el locale a español
dayjs.locale('es');

const VerControles = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const location = useLocation();
    const servicioData = location.state?.servicioData;
    const navigate = useNavigate();

    if (!servicioData) {
        navigate('/controles'); // Redirige si no hay datos
        return null;
    }

    // Función para formatear la fecha, opcionalmente incluyendo la hora
    const formatFecha = (fecha, incluirHora = false) => {
        if (!fecha) return 'Fecha no disponible';
        
        const fechaLocal = dayjs(fecha).tz(dayjs.tz.guess(), true);
        
        if (incluirHora) {
            // Formato en 12 horas con am/pm
            let formatted = `${fechaLocal.format('dddd, D [de] MMMM [de] YYYY')} a las ${fechaLocal.format('h:mm a')}`;
            // Reemplaza 'am' y 'pm' por 'a. m.' y 'p. m.' respectivamente
            formatted = formatted.replace('am', 'a. m.').replace('pm', 'p. m.');
            return formatted;
        }

        return fechaLocal.format('dddd, D [de] MMMM [de] YYYY');
    };

    // Función para formatear el costo
    const formatCosto = (costo) => {
        if (!costo) return '₡0';
        let numero = parseFloat(costo).toFixed(0);
        let numeroReverso = numero.split('').reverse().join('');
        let conPuntos = numeroReverso.match(/.{1,3}/g).join('.').split('').reverse().join('');
        return '₡' + conPuntos;
    };

    const handleBack = () => {
        navigate('/controles');
    };

    const handleEdit = () => {
        navigate(`/edit/editarControl?id=${servicioData.id}`, { state: { controlData: servicioData } });
    };

    return (
        <Box padding={3}>
            <Header
                title="Detalles del Control"
                subtitle="Revise la información detallada del control seleccionado"
            />
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Información General</Typography>
                        <Typography variant="body1"><strong>Paciente:</strong> {servicioData.nombrePaciente}</Typography>
                        <Typography variant="body1"><strong>Categoría:</strong> {servicioData.categoria}</Typography>
                        <Typography variant="body1"><strong>Servicio:</strong> {servicioData.servicio}</Typography>
                        {/* Fecha en la que se agendó la cita */}
                        <Typography variant="body1">
                            <strong>Fecha de Agenda:</strong> {formatFecha(servicioData.fechaCreacionControl)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Detalles Financieros y Fechas</Typography>
                        
                        {/* Fecha de la cita */}
                        <Typography variant="body1">
                            <strong>Fecha del Control:</strong> {formatFecha(servicioData.fechaControlRaw, true)}
                        </Typography>
                        
                        {/* Estado de la cita */}
                        <Typography variant="body1">
                            <strong>Estado:</strong> {servicioData.estadoCita}
                        </Typography>
                        
                        {/* Monto */}
                        <Typography variant="body1">
                            <strong>Monto:</strong> {formatCosto(servicioData.monto_control)}
                        </Typography>
                        
                        {/* Forma de Pago */}
                        <Typography variant="body1">
                            <strong>Forma de Pago:</strong> {servicioData.formaPago}
                        </Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Motivo de Consulta</Typography>
                        <Typography variant="body1">{servicioData.motivo_consulta_control || 'No especificado'}</Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Observaciones</Typography>
                        <Typography variant="body1">{servicioData.observaciones_control || 'No hay observaciones'}</Typography>
                    </CardContent>
                </Card>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt="40px">
                <Button
                    onClick={() => navigate('/controles')}
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
                    onClick={handleEdit}
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

export default VerControles;
