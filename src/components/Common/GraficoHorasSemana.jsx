import { calcularHorasPorSemana } from '@utils/dashboard';
import { GraficoBarras } from './GraficoBarras';

export function GraficoHorasSemana({ dias = [] }) {
    console.log('DIAS RECEBIDOS NO GRAFICO SEMANAL:', dias);

    const dados = calcularHorasPorSemana(dias);

    console.log('DADOS DO GRAFICO SEMANAL:', dados);

    return (
        <GraficoBarras
            titulo="Horas por semana"
            subtitulo="Distribuição semanal das horas trabalhadas"
            dados={dados}
        />
    );
}