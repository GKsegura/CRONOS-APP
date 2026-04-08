export const temTarefaPadrao = (dia) => {
    return dia.tarefas?.some(
        (t) => t.categoria === 'SUPORTE'
            && t.cliente === "Nexum"
            && t.descricao === 'ACOMPANHAMENTO E GESTÃO DE CHAMADOS COMO N1, INCLUINDO ANÁLISE DE E-MAILS E WHATSAPP DO SUPORTE, APOIO AO TIME, IDENTIFICAÇÃO DE DIFICULDADES, ORIENTAÇÕES E REALOCAÇÃO DE CHAMADOS.'
    )
};