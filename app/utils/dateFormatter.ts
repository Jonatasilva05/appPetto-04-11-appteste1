export const formatDbDate = (dbDate: string | null): string => {
  if (!dbDate) return 'Data não informada';
  try {
    const [year, month, day] = dbDate.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return 'Data inválida';
  }
};
