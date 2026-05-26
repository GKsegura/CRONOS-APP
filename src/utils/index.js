export {
    calcularHorasTrabalhadas,
    calcularMinutosFaltantes,
    calcularTotalTarefas,
    calcularTotalTarefasApontadas,
    calcularTotalTarefasApontadasMinutos,
    converterHorasParaMinutos,
    diaComHorasPendentes,
    formatarDuracao,
    obterDataFormatada,
    ordenarTarefas,
    parseData,
    parseDuracaoParaMinutos
} from './tempo';

export {
    calcularHorasPorCliente,
    calcularHorasPorSemana,
    calcularIndicadoresDashboard,
    formatarMinutosEmHoras,
    verificarDiasSemApontamento
} from './dashboard';

export { temTarefaPadrao } from './tarefaPadrao';

export {
    sugerirHorariosPorFimAlmoco, sugerirHorariosPorInicio,
    sugerirHorariosPorInicioAlmoco
} from './horarios';
