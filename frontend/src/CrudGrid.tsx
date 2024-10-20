import * as React from 'react';

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

    setRows((oldRows) => [...oldRows, { id, name: '', age: '', role: '', isNew: true }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
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

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const apiRef = useGridApiRef();

  React.useEffect(() => {
    let accessToken = sessionStorage.getItem('accessToken');


    const fetcher = async () => {
      // fetch data from server
      const response = await fetch('http://localhost:3000/api/v0/trades/', {
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
      const data = await response.json();
      console.log('response', response);
      console.log('data', data);
      setRows(data);
    };
    
    fetcher();
  });//, [paginationModel, sortModel, filterModel]);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    let editedRow = apiRef.current.getRow(id);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
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

  const processRowUpdate = (newRow: GridRowModel, originalRow: GridRowModel) => {
    // return with return { ...updatedRow, _action: 'delete' }; for delete, see
    // https://mui.com/x/react-data-grid/editing/#the-processrowupdate-callback
    // return f00alse;
    if(newRow.age < 18) {
        return originalRow;
    }
    else {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    }
    
  };

  const [snackbar, setSnackbar] = React.useState<Pick<
    AlertProps,
    'children' | 'severity'
  > | null>(null);

  const handleCloseSnackbar = () => setSnackbar(null);
  const handleProcessRowUpdateError = React.useCallback((error: Error) => {
    setSnackbar({ children: error.message, severity: 'error' });
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
    //   field: 'age',
    //   headerName: 'Age',
    //   type: 'number',
    //   width: 80,
    //   align: 'left',
    //   headerAlign: 'left',
    //   editable: true
    // },
    // {
    //   field: 'joinDate',
    //   headerName: 'Join date',
    //   type: 'date',
    //   width: 180,
    //   editable: true,
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
    </Box>
  );
}