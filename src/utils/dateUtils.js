// Converte "yyyy-MM-dd" (Spring) para "dd/MM/yyyy" (exibição)
export const formatarData = (data) => {
    if (!data) return '';
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
};

// Converte "dd/MM/yyyy" (exibição) para "yyyy-MM-dd" (Spring)
export const parsearData = (data) => {
    if (!data) return '';
    const [day, month, year] = data.split('/');
    return `${year}-${month}-${day}`;
};