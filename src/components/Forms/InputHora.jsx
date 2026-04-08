import { useState } from 'react';

const InputHora = ({ value, onChange, disabled, className }) => {
    const [display, setDisplay] = useState(value || '');

    const handleChange = (e) => {
        let raw = e.target.value.replace(/\D/g, ''); // só números

        if (raw.length > 4) raw = raw.slice(0, 4);

        // formata enquanto digita: 08 → 08: → 08:3 → 08:30
        let formatted = raw;
        if (raw.length >= 3) {
            formatted = raw.slice(0, 2) + ':' + raw.slice(2);
        }

        setDisplay(formatted);

        // só chama onChange quando tiver hora completa válida
        if (raw.length === 4) {
            const horas = parseInt(raw.slice(0, 2));
            const minutos = parseInt(raw.slice(2));
            if (horas <= 23 && minutos <= 59) {
                onChange(formatted); // ex: "08:30"
            }
        }
    };

    const handleBlur = () => {
        // se sair do campo incompleto, reseta para o valor salvo
        if (display.length < 5) {
            setDisplay(value || '');
        }
    };

    // sincroniza quando o valor externo muda
    const handleFocus = () => {
        setDisplay(value || '');
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            placeholder="HH:MM"
            maxLength={5}
            value={display}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            disabled={disabled}
            className={className}
        />
    );
};

export default InputHora;