import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';

import AddCar from './components/AddCar';
import EditCar from './components/EditCar';

import './App.css';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

function App() {
  const [cars, setCars] = useState([]);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({msg: '', severity: ''});
  const [gridApi, setGridApi] = useState(null);

  const openSnackbar = () => {
    setOpen(true);
  }

  const closeSnackbar = () => {
    setOpen(false);
  }

  useEffect(() => {
    fetchCars();
  }, []);

  const deleteCar = (url) => {
    if (window.confirm('Are you sure?')) {
      fetch(url, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          setAlert({msg: 'Car deleted', severity: 'success'});
          openSnackbar();
          fetchCars();
        }
        else {
          setAlert({msg: 'Something went wrong', severity: 'error'});
          openSnackbar();
        }
      })
      .catch(err => console.error(err))
    }
  }

  const fetchCars = () => {
    fetch('https://carstockrest.herokuapp.com/cars')
    .then(response => response.json())
    .then(data => setCars(data._embedded.cars))
    .catch(err => console.error(err))
  }

  const addCar = (newCar) => {
    fetch('https://carstockrest.herokuapp.com/cars', {
      method: 'POST',
      body: JSON.stringify(newCar),
      headers: { 'Content-type' : 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        setAlert({msg: 'Car added', severity: 'success'});  
        openSnackbar();
        fetchCars();
        gridApi.paginationGoToLastPage();
      }
      else {
        setAlert({msg: 'Something went wrong', severity: 'error'});
        openSnackbar();
      }
    })
    .catch(err => console.error(err))
  }

  const editCar = (url, updatedCar) => {
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify(updatedCar),
      headers: { 'Content-type' : 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        setAlert({msg : 'Car updated', severity: 'success' });
        openSnackbar();
        fetchCars();
      }
      else {
        setAlert({msg: 'Something went wrong', severity: 'error'});
        openSnackbar();
      }
    })
    .catch(err => console.error(err))
  }

  const columns = [
    { field: 'brand', sortable: true, filter: true },
    { field: 'model', sortable: true, filter: true, width: 120 },
    { field: 'color', sortable: true, filter: true, width: 120 },
    { field: 'fuel', sortable: true, filter: true, width: 120 },
    { field: 'year', sortable: true, filter: true, width: 100 },
    { field: 'price', sortable: true, filter: true, width: 120 },
    {
      headerName: '',
      field: '_links.self.href',
      width: 100,
      cellRendererFramework: params => 
        <EditCar link={params.value} car={params.data} editCar={editCar} />
    },
    { 
      headerName: '', 
      field: '_links.self.href',
      width: 100,
      cellRendererFramework: params => 
        <IconButton color='secondary' onClick={() => deleteCar(params.value)}>
          <DeleteIcon />
        </IconButton> 
    }
  ]

  const onFirstDataRendered = (params) => {
    params.api.sizeColumnsToFit();
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const exportCSV = () => {
    var params = {
      skipHeader: false,
      skipFooters: true,
      skipGroups: true,
      fileName: 'export.csv'
    };
    gridApi.exportDataAsCsv(params);
  }

  const btnTheme = {
    marginTop: 10,
    marginRight: 10
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            CarShop
          </Typography>
        </Toolbar>
      </AppBar>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <AddCar style={btnTheme} addCar={addCar}  />
        <Button style={btnTheme} variant="outlined" color="primary" onClick={exportCSV}>
            Export CSV
        </Button>
      </div>
      <div className="ag-theme-material" style={{ width: '90%', margin: 'auto' }}>
        <AgGridReact
          rowData={cars}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={8}
          suppressCellSelection={true}
          onFirstDataRendered={onFirstDataRendered}
          domLayout={'autoHeight'}
          onGridReady={onGridReady}
        />
      </div>
      <Snackbar 
        open={open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
      >
        <Alert severity={alert.severity} onClose={closeSnackbar}>{alert.msg}</Alert>
      </Snackbar>
    </div>
  );
}

export default App;
