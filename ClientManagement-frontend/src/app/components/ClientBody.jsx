import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import ClientModal from './ClientModal';
import ClientContactsModal from './ClientContactsModal';
import HelpModal from './HelpModal';
import moment from 'moment';

export default function Body() {
    // State variables
    const [searchName, setSearchName] = useState('');
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [clientModalMessage, setClientModalMessage] = useState('');
    const [showClientContactsModal, setShowClientContactsModal] = useState(false);
    const [clientContactsModalMessage, setClientContactsModalMessage] = useState('');
    const [modalClientContacts, setClientContactsModal] = useState({});
    const [modalClient, setClientModal] = useState({});
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // State variable to hold selected ID

    // Columns configuration for DataGrid
    const columns = [
        { field: 'name', headerName: 'Nome', width: 250 },
        {
            field: 'emails',
            headerName: 'Email(s)',
            width: 275,
            renderCell: renderEmailsCell,
        },
        {
            field: 'telephones',
            headerName: 'Telefone(s)',
            width: 275,
            renderCell: renderTelephonesCell,
        },
        {
            field: 'createdAt',
            headerName: 'Criado em',
            width: 180,
            renderCell: renderCreatedAtCell,
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 300,
            renderCell: renderActionsCell,
        },
    ];

    // Fetch clients from API
    const fetchClients = async () => {
        try {
            const response = await fetch(`http://localhost:8080/client`);
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            const data = await response.json();
            const dataWithIds = data.map((item) => ({ id: item._id, ...item }));
            setRows(dataWithIds);
            setFilteredRows(dataWithIds);
        } catch (error) {
            console.error('Error fetching the data:', error);
        }
    };

    // Handlers for modals
    const handleOpenClientModal = (message, client) => {
        setClientModalMessage(message);
        setClientModal(client);
        setShowClientModal(true);
    };

    const handleCloseClientModal = () => {
        setShowClientModal(false);
        fetchClients(); // Fetch clients again after closing the modal
    };

    const handleOpenClientContactsModal = (message, client) => {
        setClientContactsModalMessage(message);
        setClientContactsModal(client);
        setShowClientContactsModal(true);
    };

    const handleCloseClientContactsModal = () => {
        setShowClientContactsModal(false);
        fetchClients(); // Fetch clients again after closing the modal
    };

    // Other event handlers
    const handleCreateButtonClick = () => {
        handleOpenClientModal('Criar Cliente', {});
    };

    const handleUpdateButtonClick = (row) => {
        console.log('Update button clicked for row:', row);
        setSelectedId(row.id); // Set selected ID for update
        handleOpenClientModal('Modificar Cliente', row);
    };

    const handleContactsClick = (row) => {
        console.log('Contacts button clicked for row:', row);
        setClientContactsModalMessage('Contatos');
        setClientContactsModal(row);
        setShowClientContactsModal(true);
    };

    const handleDeleteButtonClick = async (row) => {
        console.log('Delete button clicked for row:', row);
        const idToRemove = row.id;

        try {
            const response = await fetch(`http://localhost:8080/client/${idToRemove}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // If the DELETE request was successful, update the state
                fetchClients();
            } else {
                console.error('Failed to delete the client:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting the client:', error);
        }
    };

    const handleSearchBarChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleTelephoneClick = (telephone) => {
        setSearchName(`#${telephone}`);
    };

    const toggleHelpModal = () => {
        setShowHelpModal(!showHelpModal);
    };

    // Effects
    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        let updatedRows = rows;

        if (searchName.startsWith('#')) {
            const telephoneNames = searchName.slice(1).toLowerCase().split(' #').map(telephone => telephone.trim());
            updatedRows = rows.filter((row) =>
                telephoneNames.every(telephoneName =>
                    row.telephones.some((telephone) => telephone.toLowerCase().includes(telephoneName))
                )
            );
        } else {
            updatedRows = rows.filter((row) =>
                row.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredRows(updatedRows);
    }, [searchName, rows]);

    // Render functions for DataGrid cells
    function renderEmailsCell(params) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 0.5, paddingTop: '8px' }}>
                {params.value.map((email, index) => (
                    <Chip
                        key={index}
                        label={email}
                        sx={{ cursor: 'pointer' }}
                    />
                ))}
            </Box>
        );
    }

    function renderTelephonesCell(params) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 0.5, paddingTop: '8px' }}>
                {params.value.map((telephone, index) => (
                    <Chip
                        key={index}
                        label={telephone}
                        onClick={() => handleTelephoneClick(telephone)}
                        sx={{ cursor: 'pointer' }}
                    />
                ))}
            </Box>
        );
    }

    function renderCreatedAtCell(params) {
        const formattedDate = moment(params.value).format('DD/MM/YYYY - HH:mm');
        return <div>{formattedDate}</div>;
    }

    function renderActionsCell(params) {
        return (
            <Box>
                <Button
                    color="success"
                    onClick={() => handleContactsClick(params.row)}
                    sx={{ marginRight: 1 }}
                >
                    Contatos
                </Button>
                <Button
                    color="primary"
                    onClick={() => handleUpdateButtonClick(params.row)}
                    sx={{ marginRight: 1 }}
                >
                    Modificar
                </Button>
                <Button
                    color="error"
                    onClick={() => handleDeleteButtonClick(params.row)}
                >
                    Apagar
                </Button>
            </Box>
        );
    }

    // JSX rendering
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', marginTop: '62px', marginLeft: '250px' }}>
            <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <TextField
                    sx={{ margin: '8px', width: '60%', alignSelf: 'center' }}
                    id="outlined-basic"
                    label="Buscar clientes"
                    variant="outlined"
                    value={searchName}
                    onChange={handleSearchBarChange}
                />
                <Button
                    variant="outlined"
                    sx={{ height: '60%' }}
                    onClick={handleCreateButtonClick}
                >
                    Criar
                </Button>
                <Button
                    variant="outlined"
                    sx={{ height: '60%', marginLeft: '8px' }}
                    onClick={toggleHelpModal} // Button to toggle HelpModal visibility
                >
                    Ajuda
                </Button>
            </Container>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={10}
                disableSelectionOnClick // Disable row selection
                components={{
                    Toolbar: () => null, // Hide toolbar (including checkboxes)
                }}
            />
            <ClientModal
                show={showClientModal}
                onClose={handleCloseClientModal}
                message={clientModalMessage}
                client={modalClient || {}}
                selectedId={selectedId}
            />
            <ClientContactsModal
                show={showClientContactsModal}
                onClose={handleCloseClientContactsModal}
                message={clientContactsModalMessage}
                client={modalClientContacts || {}}
            />
            <HelpModal show={showHelpModal} onClose={toggleHelpModal} /> {/* HelpModal component */}
        </Box>
    );
}