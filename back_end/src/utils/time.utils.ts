/**
 * Converte uma string de tempo para segundos
 * Aceita formatos como "1h", "7d", "30m", "3600s" ou número direto
 * @param timeStr String ou número representando o tempo
 * @return Número em segundos ou undefined se o formato for inválido
 */
export const convertTimeToSeconds = (timeStr: string | number | undefined): number | undefined => {
    if (timeStr === undefined) return undefined;
    if (typeof timeStr === 'number') return timeStr;

    if (typeof timeStr === 'string') {
        const lastChar = timeStr.slice(-1).toLowerCase();
        const amount = parseInt(timeStr.slice(0, -1), 10);

        if (isNaN(amount)) return undefined;

        switch (lastChar) {
            case 's':
                return amount;
            case 'm':
                return amount * 60;
            case 'h':
                return amount * 60 * 60;
            case 'd':
                return amount * 60 * 60 * 24;
            default:
                if (!isNaN(parseInt(timeStr, 10)) && String(parseInt(timeStr, 10)) === timeStr) {
                    return parseInt(timeStr, 10);
                }
                return undefined;
        }
    }
    return undefined;
};
