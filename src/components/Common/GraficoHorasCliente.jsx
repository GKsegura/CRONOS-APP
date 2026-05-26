import { calcularHorasPorCliente } from '@utils/dashboard';
import { GraficoBarras } from './GraficoBarras';

export function GraficoHorasCliente({ dias = [] }) {
    const dados = calcularHorasPorCliente(dias);

    return (
        <GraficoBarras
            titulo="Horas por cliente"
            subtitulo="Clientes com maior volume de horas registradas"
            dados={dados}
        />
    );
}