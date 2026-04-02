import { AlertCircle, X } from 'lucide-react';
import './ErrorAlert.css';

const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="error-alert-container">
            <div className="error-alert">
                <AlertCircle className="error-icon" />
                <span className="error-message">{error}</span>
                <button onClick={onClose} className="error-close">
                    <X className="icon-sm" />
                </button>
            </div>
        </div>
    );
};

export default ErrorAlert;