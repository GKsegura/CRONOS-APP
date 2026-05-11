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