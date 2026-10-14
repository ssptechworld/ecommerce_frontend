export const formatCurrency = (value: number | string | undefined | null, currency: string = "INR") => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
