import React from 'react';
import '../styles/helpModal.css';
import Button from '@mui/material/Button';

const HelpModal = ({ show, onClose, caller }) => {
    if (!show) {
        return null;
    }

    let additionalText = null;
    if (caller === 'contacts') {
        additionalText = (
            <p className="help-modal-text">
                Para adicionar um novo Contato, vá para a aba de Clientes, escolha o Cliente desejado e
                pressione o botão "CONTATOS". Nesta tela só é possível Consultar, Modificar ou Apagar um
                Contato.
            </p>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal">
                <h2>Ajuda</h2>
                <p className="help-modal-text">
                    Digite para procurar por um nome, ou use # para procurar por um telefone específico. Você
                    pode procurar por múltiplos telefones separando-os por um espaço.
                </p>
                {additionalText}
                <Button sx={{ marginTop: '15px' }} color="error" onClick={onClose}>
                    Fechar
                </Button>
            </div>
        </div>
    );
};

export default HelpModal;