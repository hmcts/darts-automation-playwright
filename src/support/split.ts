export const splitString = (toSplit: string, index: number): string => {
  if (toSplit.includes('~')) return toSplit.split('~')[index] || '';
  if (toSplit.includes(',')) return toSplit.split(',')[index] || '';
  if (toSplit.includes(' ')) return toSplit.split(' ')[index] || '';
  return '';
};
