// ─── Formatação ─────────────────────────────────────────────────────────────

export const formatarDuracao = (min) => {
    if (!min || min === 0) return '0h00m';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m.toString().padStart(2, '0')}m`;
};

export const obterDataFormatada = (dia) =>
    dia.dataFormatada || dia.data || '(sem data)';

export const parseData = (dataStr) => {
    if (!dataStr) return new Date(0);
    const [day, month, year] = dataStr.split('/').map(Number);
    return new Date(year, month - 1, day);
};

// ─── Cálculos de tempo ───────────────────────────────────────────────────────

export const calcularHorasTrabalhadas = (dia) => {
    if (!dia.inicioTrabalho || !dia.fimTrabalho) return '00:00';

    try {
        const inicio = new Date(`2000-01-01T${dia.inicioTrabalho}`);
        const fim = new Date(`2000-01-01T${dia.fimTrabalho}`);
        let minutos = (fim - inicio) / 60000;

        if (dia.inicioAlmoco && dia.fimAlmoco) {
            const almIn = new Date(`2000-01-01T${dia.inicioAlmoco}`);
            const almFim = new Date(`2000-01-01T${dia.fimAlmoco}`);
            minutos -= (almFim - almIn) / 60000;
        }

        if (minutos < 0) return '00:00';

        const h = Math.floor(minutos / 60);
        const m = Math.floor(minutos % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } catch {
        return '00:00';
    }
};

export const converterHorasParaMinutos = (horasStr) => {
    if (!horasStr || horasStr === '00:00') return 0;
    const [horas, minutos] = horasStr.split(':').map(Number);
    return horas * 60 + minutos;
};

// ─── Cálculos de tarefas ────────────────────────────────────────────────────

export const calcularTotalTarefas = (tarefas) => {
    if (!tarefas?.length) return '0h00m';
    const total = tarefas.reduce((acc, t) => acc + (t.duracaoMin || 0), 0);
    return formatarDuracao(total);
};

export const calcularTotalTarefasApontadasMinutos = (tarefas) => {
    if (!Array.isArray(tarefas) || tarefas.length === 0) return 0;
    return tarefas
        .filter((t) => t.apontado === true)
        .reduce((acc, t) => acc + (t.duracaoMin ?? 0), 0);
};

export const calcularTotalTarefasApontadas = (tarefas) =>
    formatarDuracao(calcularTotalTarefasApontadasMinutos(tarefas));

// ─── Lógica de status ────────────────────────────────────────────────────────

export const diaComHorasPendentes = (dia) => {
    if (!dia.inicioTrabalho || !dia.fimTrabalho) return true;
    const minutosTrabalho = converterHorasParaMinutos(calcularHorasTrabalhadas(dia));
    const minutosTarefas = dia.tarefas?.reduce((acc, t) => acc + (t.duracaoMin || 0), 0) || 0;
    const minutosApontados = calcularTotalTarefasApontadasMinutos(dia.tarefas || []);

    // Dia completo: Total = Apontado = Horas Trabalhadas
    // Dia pendente: qualquer desvio
    return minutosTrabalho !== minutosTarefas || minutosTarefas !== minutosApontados;
};

// ─── Cálculo de horas pendentes ──────────────────────────────────────────────

export const calcularMinutosFaltantes = (dia) => {
    if (!dia.inicioTrabalho || !dia.fimTrabalho) return 0;
    const minutosTrabalho = converterHorasParaMinutos(calcularHorasTrabalhadas(dia));
    // Calcula o TOTAL de minutos de todas as tarefas (apontadas ou não)
    const minutosTarefas = dia.tarefas?.reduce((acc, t) => acc + (t.duracaoMin || 0), 0) || 0;
    const faltantes = minutosTrabalho - minutosTarefas;
    return faltantes > 0 ? faltantes : 0;
};

// ─── Ordenação ───────────────────────────────────────────────────────────────

export const ordenarTarefas = (tarefas) => {
    if (!tarefas?.length) return tarefas;

    const comparar = (a, b) =>
        (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR');

    return [
        ...tarefas.filter((t) => !t.apontado).sort(comparar),
        ...tarefas.filter((t) => t.apontado).sort(comparar),
    ];
};

export function parseDuracaoParaMinutos(valor) {
    if (!valor) return 0;

    const texto = String(valor).toLowerCase().trim().replace(',', '.');

    // número puro => minutos
    if (/^\d+$/.test(texto)) {
        return Number(texto);
    }

    // formato HH:MM
    if (/^\d{1,2}:\d{2}$/.test(texto)) {
        const [horas, minutos] = texto.split(':').map(Number);
        return horas * 60 + minutos;
    }

    // formato decimal: 1.5h
    if (/^\d+(\.\d+)?h$/.test(texto)) {
        return Math.round(parseFloat(texto) * 60);
    }

    // formatos: 1h / 1h30 / 1h30m / 00h30 / 45m
    const match = texto.match(/^(?:(\d+)h)?\s*(?:(\d+)m?)?$/);

    if (match) {
        const horas = Number(match[1] || 0);
        const minutos = Number(match[2] || 0);
        const total = horas * 60 + minutos;

        return total > 0 ? total : 0;
    }

    return 0;
}