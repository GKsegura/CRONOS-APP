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

    const obterMaisRecorrente = (mapa, ignorar = []) => {
        const ignorarNormalizado = ignorar.map((item) => String(item).trim().toLowerCase());

        let itemMaisRecorrente = '-';
        let maiorQuantidade = 0;

        for (const [chave, quantidade] of mapa.entries()) {
            const chaveNormalizada = String(chave).trim().toLowerCase();

            if (ignorarNormalizado.includes(chaveNormalizada)) continue;

            if (quantidade > maiorQuantidade) {
                itemMaisRecorrente = chave;
                maiorQuantidade = quantidade;
            }
        }

        return itemMaisRecorrente;
    };

    const obterTopOcorrencias = (mapa, limite = 5, ignorar = []) => {
        const ignorarNormalizado = ignorar.map(item =>
            String(item).trim().toLowerCase()
        );

        const normalizarNome = (nome) => {
            return String(nome)
                .trim()
                .replace(/^sicoob\s+/i, '') // remove "Sicoob " do começo (case insensitive)
                .replace(/\s+/g, ' ')       // remove espaços duplicados
                .trim();
        };

        return [...mapa.entries()]
            .filter(([chave]) => {
                const chaveNormalizada = normalizarNome(chave).toLowerCase();
                return !ignorarNormalizado.includes(chaveNormalizada);
            })
            .sort((a, b) => b[1] - a[1])
            .slice(0, limite)
            .map(([nome, quantidade]) => ({
                nome: normalizarNome(nome),
                quantidade,
            }));
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
    clienteMaisRecorrente: obterMaisRecorrente(clientesMap, ['Nexum']),
    categoriaMaisUsada: obterMaisRecorrente(categoriasMap),
    topClientes: obterTopOcorrencias(clientesMap, 5, ['Nexum']),
    topCategorias: obterTopOcorrencias(categoriasMap, 5),
    horasPorCliente: calcularHorasPorCliente(dias),
    horasPorSemana: calcularHorasPorSemana(dias),
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

        if (!tarefas.length) continue;

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

export const calcularHorasPorCliente = (dias = [], limite = 8) => {
    const tarefas = dias.flatMap((dia) => dia.tarefas || []);
    const mapa = new Map();

    tarefas.forEach((tarefa) => {
        const cliente = String(tarefa.cliente || 'Sem cliente').trim();
        const minutos = Number(tarefa.duracaoMin) || 0;

        if (!cliente || minutos <= 0) return;

        mapa.set(cliente, (mapa.get(cliente) || 0) + minutos);
    });

    return [...mapa.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limite)
        .map(([cliente, minutos]) => ({
            cliente,
            minutos,
            horas: Number((minutos / 60).toFixed(2)),
            label: cliente,
            valor: minutos,
        }));
};

export const calcularHorasPorSemana = (dias = []) => {
    const mapa = new Map();

    dias.forEach((dia) => {
        if (!dia.data) return;

        const data = new Date(dia.data);
        if (Number.isNaN(data.getTime())) return;

        const tarefas = dia.tarefas || [];

        const totalMinutosDia = tarefas.reduce((acc, tarefa) => {
            return acc + (Number(tarefa.duracaoMin) || 0);
        }, 0);

        if (totalMinutosDia <= 0) return;

        const inicioAno = new Date(data.getFullYear(), 0, 1);
        const diasPassados = Math.floor((data - inicioAno) / 86400000);
        const semana = Math.ceil((diasPassados + inicioAno.getDay() + 1) / 7);

        const chave = `${data.getFullYear()}-S${String(semana).padStart(2, '0')}`;

        mapa.set(chave, (mapa.get(chave) || 0) + totalMinutosDia);
    });

    return [...mapa.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([semana, minutos]) => ({
            semana,
            minutos,
            horas: Number((minutos / 60).toFixed(2)),
            label: semana.replace('-S', ' • Semana '),
            valor: minutos,
        }));
};