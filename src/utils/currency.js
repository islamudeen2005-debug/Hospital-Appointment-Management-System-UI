export const formatINR = (value) => {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
};
