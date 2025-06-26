// export const formatDateToYYYYMMDD = (date: string | Date) => {
//     const d = new Date(date);
//     if (isNaN(d.getTime())) return ''; // Invalid date, return empty or handle error
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     return `${year}${month}${day}`;
// };

export const formatDateToYYYYMMDD = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};
