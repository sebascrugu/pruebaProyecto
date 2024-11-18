// src/scenes/users/index.jsx
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import VaccinesIcon from '@mui/icons-material/Vaccines';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import Header from "../../components/Header";
import { esES } from '@mui/x-data-grid/locales';
import { Link } from 'react-router-dom';

const Usuarios = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [usuarios, setUsuarios] = useState([]);

  const columns = [
    {
      field: "nombre_usuario",
      headerName: "Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "primer_apellido_usuario",
      headerName: "Primer Apellido",
      flex: 1,
    },
    {
      field: "segundo_apellido_usuario",
      headerName: "Segundo Apellido",
      flex: 1,
    },
    {
      field: "correo_electronico_usuario",
      headerName: "Correo electrónico",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            to={`/view/verUsuario?id=${params.row.id}`}
            state={{ userData: params.row }} 
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
      to={`/edit/editarUsuario?id=${params.row.id}`}
      state={{ userData: params.row }} 
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
        </Box>
      ),
    },
    {
      field: "id_rol_usuario",
      headerName: "Tipo de usuario",
      flex: 1,
      renderCell: ({ row }) => {
        let access = '';
        let icon = null;

        switch (row.id_rol_usuario) {
          case 1:
            access = "Administrador";
            icon = <AdminPanelSettingsOutlinedIcon />;
            break;
          case 3:
            access = "Asistente";
            icon = <MedicalInformationOutlinedIcon />;
            break;
          case 2:
            access = "Doctor";
            icon = <VaccinesIcon />;
            break;
          default:
            access = "Usuario";
            break;
        }

        return (
          <Box
            width="60%"
            m="10px"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={colors.greenAccent[600]}
            borderRadius="4px"
          >
            {icon}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('https://dev-sistema-de-gestiones-de-expedientes-api.azurewebsites.net/api/getUsuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Puedes enviar filtros si es necesario
        });
        const data = await response.json();
        // Asegúrate de que los datos estén en el formato adecuado
        setUsuarios(data.map((usuario, index) => ({ id: index + 1, ...usuario })));
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsuarios();
  }, []);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Usuarios"
          subtitle="Lista de usuarios registrados en la base de datos"
        />
        <Box>
          <Link to="/form/crearUsuario" style={{ textDecoration: 'none' }}>
          <Button
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
              <AddOutlinedIcon 
                sx={{ 
                  mr: "10px",
                  transition: "transform 0.3s ease-in-out"
                }} 
              />
              Agregar Usuario
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
          rows={usuarios} 
          columns={columns}
          components={{ Toolbar: GridToolbar }} 
          initialState={{
            sorting: {
              sortModel: [
                { field: 'nombre_usuario', sort: 'asc' },
                { field: 'primer_apellido_usuario', sort: 'asc' },
                { field: 'segundo_apellido_usuario', sort: 'asc' },
                { field: 'id_rol_usuario', sort: 'asc' }
              ],
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Usuarios;
