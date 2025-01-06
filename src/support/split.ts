export const splitString = (toSplit: string, index: number): string => {
  if (!toSplit) return '';
  if (toSplit.includes('~')) return toSplit.split('~')[index] || '';
  if (toSplit.includes(',')) return toSplit.split(',')[index] || '';
  if (toSplit.includes(' ')) return toSplit.split(' ')[index] || '';
  return '';
};
