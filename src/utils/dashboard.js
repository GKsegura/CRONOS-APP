export const calcularIndicadoresDashboard = (dias = []) => {
    const tarefas = dias.flatMap((dia) => dia.tarefas || []);

    const totalTarefas = tarefas.length;

    const totalTarefasApontadas = tarefas.filter((tarefa) => tarefa.apontado).length;

    const totalMinutos = tarefas.reduce((acc, tarefa) => {
        return acc + (Number(tarefa.duracaoMin) || 0);
    }, 0);

    const contarOcorrencias = (lista) => {
        const mapa = new Map();

        lista.forEach((item) => {
            if (!item || !String(item).trim()) return;
            const chave = String(item).trim();
            mapa.set(chave, (mapa.get(chave) || 0) + 1);
        });

        return mapa;
    };

    const obterMaisRecorrente = (mapa) => {
        let itemMaisRecorrente = '-';
        let maiorQuantidade = 0;

        for (const [chave, quantidade] of mapa.entries()) {
            if (quantidade > maiorQuantidade) {
                itemMaisRecorrente = chave;
                maiorQuantidade = quantidade;
            }
        }

        return itemMaisRecorrente;
    };

    const clientesMap = contarOcorrencias(tarefas.map((tarefa) => tarefa.cliente));
    const categoriasMap = contarOcorrencias(tarefas.map((tarefa) => tarefa.categoria));

    const percentualApontado = totalTarefas
        ? Math.round((totalTarefasApontadas / totalTarefas) * 100)
        : 0;

    return {
        totalMinutos,
        totalTarefas,
        totalTarefasApontadas,
        percentualApontado,
        clienteMaisRecorrente: obterMaisRecorrente(clientesMap),
        categoriaMaisUsada: obterMaisRecorrente(categoriasMap),
    };
};

export const formatarMinutosEmHoras = (minutos = 0) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas}h${String(minutosRestantes).padStart(2, '0')}m`;
};

export const verificarDiasSemApontamento = (dias = [], limiteDias = 3) => {
    if (!dias.length) return false;

    const diasOrdenados = [...dias].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });

    let contador = 0;

    for (const dia of diasOrdenados) {
        const tarefas = dia.tarefas || [];

        const temApontado = tarefas.some((t) => t.apontado);

        if (!tarefas.length) continue; // ignora dias vazios

        if (!temApontado) {
            contador++;
        } else {
            break;
        }

        if (contador >= limiteDias) {
            return true;
        }
    }

    return false;
};