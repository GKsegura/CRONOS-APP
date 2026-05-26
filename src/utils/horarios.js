const timeToMinutes = (time) => {
    if (!time || !time.includes(':')) return null;

    const [hours, minutes] = time.split(':').map(Number);

    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
    const minutesInDay = 24 * 60;
    const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;

    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const sugerirHorariosPorInicio = (inicioTrabalho) => {
    const inicio = timeToMinutes(inicioTrabalho);

    if (inicio === null) return null;

    const inicioAlmoco = inicio + 4 * 60;
    const fimAlmoco = inicioAlmoco + 60;
    const fimTrabalho = fimAlmoco + 4 * 60;

    return {
        inicioAlmoco: minutesToTime(inicioAlmoco),
        fimAlmoco: minutesToTime(fimAlmoco),
        fimTrabalho: minutesToTime(fimTrabalho),
    };
};

export const sugerirHorariosPorInicioAlmoco = (inicioAlmoco) => {
    const inicio = timeToMinutes(inicioAlmoco);

    if (inicio === null) return null;

    const fimAlmoco = inicio + 60;
    const fimTrabalho = fimAlmoco + 4 * 60;

    return {
        fimAlmoco: minutesToTime(fimAlmoco),
        fimTrabalho: minutesToTime(fimTrabalho),
    };
};

export const sugerirHorariosPorFimAlmoco = (fimAlmoco) => {
    const fim = timeToMinutes(fimAlmoco);

    if (fim === null) return null;

    return {
        fimTrabalho: minutesToTime(fim + 4 * 60),
    };
};