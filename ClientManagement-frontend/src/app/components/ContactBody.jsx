import * as React from 'react';
import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import ContactModal from './ContactModal'; // Assuming ContactModal is implemented
import HelpModal from './HelpModal';
import moment from 'moment';

export default function Body() {
    // State variables
    const [searchName, setSearchName] = useState('');
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactModalMessage, setContactModalMessage] = useState('');
    const [modalContact, setModalContact] = useState({});
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [clientNameMap, setClientNameMap] = useState({});
    const [selectedId, setSelectedId] = useState(null); // State variable to hold selected ID

    // Columns configuration for DataGrid
    const columns = [
        { field: 'name', headerName: 'Nome', width: 150 },
        {
            field: 'emails',
            headerName: 'Email(s)',
            width: 300,
            renderCell: renderEmailsCell,
        },
        {
            field: 'telephones',
            headerName: 'Telefone(s)',
            width: 300,
            renderCell: renderTelephonesCell,
        },
        {
            field: 'createdAt',
            headerName: 'Criado em',
            width: 180,
            renderCell: renderCreatedAtCell,
        },
        {
            field: 'pertenceA',
            headerName: 'Pertence a',
            width: 180,
            renderCell: renderPertenceACell,
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 300,
            renderCell: renderActionsCell,
        },
    ];

    // Fetch contacts from API
    const fetchContacts = async () => {
        try {
            const response = await fetch(`http://localhost:8080/contact`);
            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }
            const data = await response.json();
            const dataWithIds = data.map((item) => ({ id: item._id, ...item }));
            setRows(dataWithIds);
            setFilteredRows(dataWithIds);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    // Fetch client name by clientId
    const fetchClientName = async (clientId) => {
        try {
            const response = await fetch(`http://localhost:8080/client/${clientId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch client name');
            }

            // Handle empty or non-JSON responses gracefully
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            const name = data?.name;
            setClientNameMap((prevMap) => ({
                ...prevMap,
                [clientId]: name ?? 'Desconhecido',
            }));

        } catch (error) {
            console.error(`Error fetching client name for clientId ${clientId}:`, error);
            setClientNameMap((prevMap) => ({
                ...prevMap,
                [clientId]: 'Desconhecido',
            }));
        }
    };

    // Handlers for modals
    const handleOpenContactModal = (message, contact) => {
        setContactModalMessage(message);
        setModalContact(contact);
        setShowContactModal(true);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
        fetchContacts(); // Fetch contacts again after closing the modal
    };

    const handleUpdateButtonClick = (row) => {
        console.log('Update button clicked for row:', row);
        setSelectedId(row.id); // Set selected ID for update
        handleOpenContactModal('Update Contact', row);
    };

    const handleDeleteButtonClick = async (row) => {
        console.log('Delete button clicked for row:', row);
        const idToRemove = row.id;

        try {
            const response = await fetch(`http://localhost:8080/contact/${idToRemove}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // If the DELETE request was successful, update the state
                fetchContacts();
            } else {
                console.error('Failed to delete the contact:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting the contact:', error);
        }
    };

    const handleSearchBarChange = (e) => {
        setSearchName(e.target.value);
    };

    const toggleHelpModal = () => {
        setShowHelpModal(!showHelpModal);
    };

    // Effects
    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        // Fetch client names for all unique clientIds in filteredRows
        const uniqueClientIds = new Set(filteredRows.map((row) => row.clientId));
        uniqueClientIds.forEach((clientId) => {
            if (!clientNameMap[clientId]) {
                fetchClientName(clientId);
            }
        });
    }, [filteredRows, clientNameMap]);

    useEffect(() => {
        let updatedRows = rows;

        if (searchName.startsWith('#tel:')) {
            const telQuery = searchName.slice(5).toLowerCase().split(' #tel:').map(t => t.trim());
            updatedRows = rows.filter((row) =>
                telQuery.every(tel =>
                    row.telephones.some((telephone) => telephone.toLowerCase().includes(tel))
                )
            );
        } else if (searchName.startsWith('#email:')) {
            const emailQuery = searchName.slice(7).toLowerCase().split(' #email:').map(e => e.trim());
            updatedRows = rows.filter((row) =>
                emailQuery.every(email =>
                    row.emails.some((em) => em.toLowerCase().includes(email))
                )
            );
        } else {
            updatedRows = rows.filter((row) =>
                row.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredRows(updatedRows);
    }, [searchName, rows]);

    function renderEmailsCell(params) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 0.5, paddingTop: '8px' }}>
                {params.value.map((email, index) => (
                    <Chip
                        key={index}
                        label={email}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSearchName(`#email:${email}`)}
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
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSearchName(`#tel:${telephone}`)}
                    />
                ))}
            </Box>
        );
    }

    function renderCreatedAtCell(params) {
        const formattedDate = moment(params.value).format('DD/MM/YYYY - HH:mm');
        return <div>{formattedDate}</div>;
    }

    function renderPertenceACell(params) {
        const clientId = params.row.clientId;
        const clientName = clientNameMap[clientId];

        // Check if clientName is undefined or null, show 'Desconhecido' or loading state
        if (clientName === undefined || clientName === null) {
            return <div>Carregando...</div>; // or any placeholder text or loading indicator
        }

        return <div>{clientName || 'Desconhecido'}</div>;
    }

    function renderActionsCell(params) {
        return (
            <Box>
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
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        sx={{ margin: '8px', width: '60%', alignSelf: 'center' }}
                        id="outlined-basic"
                        label="Buscar contatos"
                        variant="outlined"
                        value={searchName}
                        onChange={handleSearchBarChange}
                    />
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
                />
            </Box>
            <ContactModal
                show={showContactModal}
                onClose={handleCloseContactModal}
                message={contactModalMessage}
                contact={modalContact || {}}
                selectedId={selectedId}
            />
            <HelpModal show={showHelpModal} onClose={toggleHelpModal} caller="contacts" />
        </Box>
    );
}