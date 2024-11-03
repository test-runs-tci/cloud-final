import * as React from 'react';

import config from "./config";
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlots,
  GridPreProcessEditCellProps,
  useGridApiRef,
  GridEditInputCell,
} from '@mui/x-data-grid';
import {
  randomCreatedDate,
  randomTraderName,
  randomId,
  randomArrayItem,
} from '@mui/x-data-grid-generator';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { errorMonitor } from 'events';

let apiUrl = config.apiUrl;

const roles = ['Market', 'Finance', 'Development'];
const randomRole = () => {
  return randomArrayItem(roles);
};

const initialRows: GridRowsProp = [];

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();

    setRows((oldRows) => 
      [...oldRows, { id, isNew: true }]
    );
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'ticker' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

class FetchError extends Error {
  constructor(message?: string, public status?: number) {
    super(message);
    this.name = "FetchError";
  }
}

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const apiRef = useGridApiRef();

  const navigate = useNavigate();
  const handleLogout = () => {
    console.log('logging out');
    sessionStorage.clear();
    navigate('/login');
  };

  React.useEffect(() => {
    let accessToken = sessionStorage.getItem('accessToken');

    const fetcher = async () => {
      // fetch data from server
      const response = await fetch(`${apiUrl}/api/v0/trades/`, {
        method: 'GET',
        headers: new Headers({
          'Authorization': accessToken
        })
        // body: JSON.stringify({
        //   page: paginationModel.page,
        //   pageSize: paginationModel.pageSize,
        //   sortModel,
        //   filterModel,
        // }),
      });

      if(response.status === 401) {
        handleLogout();
      }
      else {
        const data = await response.json();

        setRows(data);
      }
    };
    
    fetcher();
  }, [ setRows ]);//, [paginationModel, sortModel, filterModel]);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => async () => {
    let editedRow = apiRef.current.getRow(id);

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });

  };

  const handleDeleteClick =  (id: GridRowId) => async () => {

    let accessToken = sessionStorage.getItem('accessToken');

    const config = {
      method: 'DELETE',
      headers: new Headers({
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      })
    };

    const response = await fetch(`${apiUrl}/api/v0/trades/${id}`, config);

    if(response.status === 401) {
      setSnackbar({ children: "There was an error server-side", severity: 'error' });

      setTimeout(() => {
        handleLogout();
      }, 1000);
    }
    else {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel, originalRow: GridRowModel) => {
    // return with return { ...updatedRow, _action: 'delete' }; for delete, see
    // https://mui.com/x/react-data-grid/editing/#the-processrowupdate-callback
    // return f00alse;
    // if(newRow.age < 18) {
    //     return originalRow;
    // }

// comments
// id
// isNew
// price
// shares
// ticker
// time
    let accessToken = sessionStorage.getItem('accessToken');

    let body = {
      ticker: newRow.ticker,
      price: newRow.price,
      shares: newRow.shares,
      time: newRow.time.toLocaleString(),
      comments: newRow.comments
    };

    let method = 'POST';

    if(!newRow.isNew)
    {
      body['id'] = newRow.id;
      method = 'PUT';
    }

    const config = {
      method: method,
      headers: new Headers({
        'Authorization': accessToken,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body),
    };

    const response = await fetch(`${apiUrl}/api/v0/trades/`, config);

    return new Promise(async (resolve, reject) => {
      if(response.status >= 200 && response.status <= 299)
      {
        let resp = await response.json();
  
        const updatedRow = { ...newRow, isNew: false, id: !newRow.isNew ? newRow.id : resp.inserted_id };
    
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

        setSnackbar({ children: 'Successfully saved', severity: 'success' });

        resolve(updatedRow);
      }
      else
      {
        reject(new FetchError("There was an error server-side.", response.status));
      }
    });
  };

  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);

  const handleCloseSnackbar = () => setSnackbar(null);

  const handleProcessRowUpdateError = React.useCallback((error: FetchError) => {
    setSnackbar({ children: error.message, severity: 'error' });
    
    if(error.status === 401) {
      setTimeout(() => {
        handleLogout();
      }, 1000);

    }
  }, []);

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  let promiseTimeout: ReturnType<typeof setTimeout>;
  function validateName(name: string): Promise<boolean> {
    return new Promise<any>((resolve) => {
      promiseTimeout = setTimeout(
        () => {
          resolve(name.length < 3 ? `${name} must be 3 or more characters.` : null);
        },
        Math.random() * 500 + 100,
      ); // simulate network latency
    });
  }

  const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
  }));

  function NameEditInputCell(props) {
    const { error } = props;
  
    return (
      <StyledTooltip open={!!error} title={error}>
        <GridEditInputCell {...props} />
      </StyledTooltip>
    );
  }
  
  function renderEditName(params) {
    return <NameEditInputCell {...params} />;
  }

  const columns: GridColDef[] = [
    {
        field: 'ticker',
        headerName: 'Ticker Symbol',
        width: 220,
        type: 'string',
        align: 'left',
        headerAlign: 'left',
        editable: true
    },
    {
      field: 'shares',
      headerName: '# Shares',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    {
      field: 'time',
      headerName: 'Time',
      type: 'dateTime',
      valueGetter: (value) => value && new Date(value),
      width: 200,
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 200,
      type: 'string',
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    // { 
    //     field: 'name', 
    //     headerName: 'Name', 
    //     width: 180, 
    //     editable: true, 
    //     flex: 1,
    //     renderEditCell: renderEditName,
    //     preProcessEditCellProps: async (params: GridPreProcessEditCellProps) => {
    //         const hasError: any = params.props.value.length < 3;
    //         // if(hasError) {
    //         //     hasError = "Name must be 3 or more characters";
    //         // }
    //         let errorMsg = await validateName(params.props.value);

    //         return { ...params.props, error: errorMsg };
    //     }
    // },
    // {
    //   field: 'role',
    //   headerName: 'Department',
    //   width: 220,
    //   editable: true,
    //   type: 'singleSelect',
    //   valueOptions: ['','Market', 'Finance', 'Development'],
    // },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        slots={{
          toolbar: EditToolbar as GridSlots['toolbar'],
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}
    </Box>
  );
}