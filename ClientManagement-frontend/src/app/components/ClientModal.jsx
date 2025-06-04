import React, { useState, useEffect } from 'react';
import '../styles/modal.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { InputMask } from '@react-input/mask';

const ClientModal = ({ show, onClose, message, client = {} }) => {
    // State variables
    const [clientName, setClientName] = useState(client.name || '');
    const [emails, setEmails] = useState(client.emails || []);
    const [emailInput, setEmailInput] = useState('');
    const [telephones, setTelephones] = useState(client.telephones || []);
    const [telephoneInput, setTelephoneInput] = useState('');
    const isCreate = !client.id; // Check if client ID exists

    // Update state when client prop changes
    useEffect(() => {
        setClientName(client.name || '');
        setEmails(client.emails || []);
        setTelephones(client.telephones || []);
    }, [client]);

    // Handlers for adding and removing emails and telephones
    const addTelephone = () => {
        if (telephoneInput && !telephones.includes(telephoneInput)) {
            setTelephones([...telephones, telephoneInput]);
            setTelephoneInput('');
        }
    };

    const addEmail = () => {
        if (emailInput && !emails.includes(emailInput)) {
            setEmails([...emails, emailInput]);
            setEmailInput('');
        }
    };

    const removeTelephone = (telephoneToRemove) => {
        setTelephones(telephones.filter((telephone) => telephone !== telephoneToRemove));
    };

    const removeEmail = (emailToRemove) => {
        setEmails(emails.filter((email) => email !== emailToRemove));
    };

    // Save client data to API
    const handleSave = async () => {
        const clientData = {
            name: clientName,
            emails: emails,
            telephones: telephones,
        };

        try {
            const url = isCreate ? `http://localhost:8080/client` : `http://localhost:8080/client/${client.id}`;
            const method = isCreate ? 'POST' : 'PATCH';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(clientData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Success:', responseData);
            onClose(); // Close the modal after a successful save
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // JSX rendering
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{message}</h2>
                <div>
                    <TextField
                        label="Nome"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </div>
                <div>
                    <TextField
                        label="Email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                        fullWidth
                        margin="normal"
                    />
                    <Button onClick={addEmail}>Adicionar Email</Button>
                    <List className="emails">
                        {emails.map((email, index) => (
                            <ListItem key={index} className="email">
                                <ListItemText primary={email} />
                                <IconButton edge="end" aria-label="delete" onClick={() => removeEmail(email)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </div>
                <div>
                    <InputMask
                        mask="(__) _____-____"
                        replacement={{ _: /\d/ }}
                        value={telephoneInput}
                        className="telephone-input"
                        onChange={(e) => setTelephoneInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTelephone()}
                    />
                    <Button onClick={addTelephone}>Adicionar Telefone</Button>
                    <List className="telephones">
                        {telephones.map((telephone, index) => (
                            <ListItem key={index} className="telephone">
                                <ListItemText primary={telephone} />
                                <IconButton edge="end" aria-label="delete" onClick={() => removeTelephone(telephone)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </div>
                <Button color="success" onClick={handleSave}>
                    {isCreate ? 'CRIAR' : 'SALVAR'}
                </Button>
                <Button color="error" onClick={onClose}>
                    CANCELAR
                </Button>
            </div>
        </div>
    );
};

export default ClientModal;