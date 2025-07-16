// Currency conversion utilities
export const EXCHANGE_RATES = {
  USD_TO_KES: 129.50, // Updated regularly
  USD_TO_UGX: 3700,
  USD_TO_TZS: 2380,
  USD_TO_NGN: 1540,
};

export const convertUSDToLocal = (usdAmount: number, currency: string): number => {
  switch (currency) {
    case 'KES':
      return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_KES);
    case 'UGX':
      return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_UGX);
    case 'TZS':
      return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_TZS);
    case 'NGN':
      return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_NGN);
    default:
      return usdAmount;
  }
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbols = {
    USD: '$',
    KES: 'KSh ',
    UGX: 'UGX ',
    TZS: 'TSh ',
    NGN: '₦',
  };
  
  return `${symbols[currency as keyof typeof symbols] || ''}${amount.toLocaleString()}`;
};