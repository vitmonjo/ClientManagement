import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../styles/modal.css';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ContactModal from './ContactModal';

const ClientContactsModal = ({ show, onClose, message, client = {} }) => {
    const [clientName, setClientName] = useState(client.name || '');
    const [contactModalMessage, setContactModalMessage] = useState('');
    const [modalContact, setModalContact] = useState({});
    const [showContactModal, setShowContactModal] = useState(false);
    const [rows, setRows] = useState([]);
    const [isCreate, setIsCreate] = useState(false);

    const columns = [
        { field: 'name', headerName: 'Nome', width: 150 },
        {
            field: 'emails',
            headerName: 'Email(s)',
            width: 220,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 0.5, paddingTop: '8px' }}>
                    {params.value.map((email, index) => (
                        <Chip
                            key={index}
                            label={email}
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box>
            ),
        },
        {
            field: 'telephones',
            headerName: 'Telefone(s)',
            width: 220,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 0.5, paddingTop: '8px' }}>
                    {params.value.map((telephone, index) => (
                        <Chip
                            key={index}
                            label={telephone}
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box>
            ),
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 300,
            renderCell: (params) => (
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
            ),
        },
    ];

    useEffect(() => {
        setClientName(client.name || '');
        if (show && client.id) {
            fetchContacts(client.id);
        } else {
            setRows([]);
        }
    }, [show, client]);

    const handleSave = async () => {
        onClose();
    };

    const handleUpdateButtonClick = (row) => {
        console.log('Update button clicked for row:', row);
        setIsCreate(false);
        handleOpenContactModal('Modificar Contato', row);
    };

    const handleDeleteButtonClick = async (row) => {
        console.log('Delete button clicked for row:', row);
        try {
            const response = await fetch(`http://localhost:8080/contact/${row.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setRows(rows.filter((contact) => contact.id !== row.id));
            } else {
                throw new Error('Failed to delete contact');
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleCreateButtonClick = () => {
        console.log('Create button clicked');
        setIsCreate(true);
        handleOpenContactModal('Criar Contato', {});
    };

    const handleOpenContactModal = (message, contact) => {
        setContactModalMessage(message);
        setModalContact(contact);
        setShowContactModal(true);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
        fetchContacts(client.id); // Fetch clients again after closing the modal
    };

    const fetchContacts = async (clientId) => {
        try {
            const response = await fetch(`http://localhost:8080/contact/client/${clientId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setRows([]);
                } else {
                    throw new Error(`Failed to fetch contacts: ${response.statusText}`);
                }
            } else {
                const data = await response.json();
                const dataWithIds = data.map((item) => ({ id: item._id, ...item }));
                setRows(dataWithIds);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal client-contact-modal">
                <h2>{message}</h2>
                <Typography component="div" variant="h5" sx={{ marginBottom: '15px' }}>
                    {clientName}
                </Typography>
                <div>
                    <DataGrid
                        className='client-contacts-datagrid'
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        paginationModel={{ pageSize: 5, page: 0 }}
                        pageSizeOptions={[5]}
                        components={{
                            Pagination: (props) => <Box>{props.children}</Box>,
                        }}
                    />
                </div>
                <Button color='success' onClick={handleCreateButtonClick} sx={{ marginTop: '15px' }}>
                    CRIAR
                </Button>
                <Button color='error' onClick={handleSave} sx={{ marginTop: '15px' }}>
                    SAIR
                </Button>
                <ContactModal
                    show={showContactModal}
                    onClose={handleCloseContactModal}
                    message={contactModalMessage}
                    contact={modalContact || {}}
                    clientId={client.id}
                    isCreate={isCreate} // Pass the isCreate prop
                />
            </div>
        </div>
    );
};

export default ClientContactsModal;