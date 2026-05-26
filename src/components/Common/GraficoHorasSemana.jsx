import { calcularHorasPorSemana } from '@utils/dashboard';
import { GraficoBarras } from './GraficoBarras';

export function GraficoHorasSemana({ dias = [] }) {
    const dados = calcularHorasPorSemana(dias);

    return (
        <GraficoBarras
            titulo="Horas por semana"
            subtitulo="Distribuição semanal das horas trabalhadas"
            dados={dados}
        />
    );
}