import { useState, useEffect } from 'react';
import { getDefaultCurrency, getSupportedCurrencies, formatCurrency, Currency } from '@/lib/metadata';

export function useCurrency() {
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>({ code: 'EUR', symbol: '€', name: 'Euro' });
  const [supportedCurrencies, setSupportedCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencyData();
  }, []);

  const loadCurrencyData = async () => {
    try {
      setLoading(true);
      const [defaultCurr, supportedCurr] = await Promise.all([
        getDefaultCurrency(),
        getSupportedCurrencies()
      ]);
      
      setDefaultCurrency(defaultCurr);
      setSupportedCurrencies(supportedCurr);
    } catch (error) {
      console.error('Error loading currency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency?: Currency) => {
    return formatCurrency(amount, currency || defaultCurrency);
  };

  return {
    defaultCurrency,
    supportedCurrencies,
    loading,
    formatAmount,
    refreshCurrencyData: loadCurrencyData
  };
}