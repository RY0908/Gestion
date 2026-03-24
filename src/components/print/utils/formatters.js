export const formatDA = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 2,
    }).format(amount).replace('DZD', 'DA');
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-DZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
};

export const padNumber = (num, length = 4) => {
    return String(num).padStart(length, '0');
};
