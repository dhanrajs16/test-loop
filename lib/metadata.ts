import { supabase } from './supabase';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
}

export interface AppMetadata {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Get metadata by key
export const getMetadata = async (key: string): Promise<any> => {
  const { data, error } = await supabase
    .from('app_metadata')
    .select('value')
    .eq('key', key)
    .eq('is_public', true)
    .single();

  if (error) {
    console.error(`Error fetching metadata for key ${key}:`, error);
    return null;
  }

  return data?.value;
};

// Get multiple metadata keys
export const getMetadataByKeys = async (keys: string[]): Promise<Record<string, any>> => {
  const { data, error } = await supabase
    .from('app_metadata')
    .select('key, value')
    .in('key', keys)
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching metadata:', error);
    return {};
  }

  const result: Record<string, any> = {};
  data?.forEach(item => {
    result[item.key] = item.value;
  });

  return result;
};

// Get all metadata by category
export const getMetadataByCategory = async (category: string): Promise<Record<string, any>> => {
  const { data, error } = await supabase
    .from('app_metadata')
    .select('key, value')
    .eq('category', category)
    .eq('is_public', true);

  if (error) {
    console.error(`Error fetching metadata for category ${category}:`, error);
    return {};
  }

  const result: Record<string, any> = {};
  data?.forEach(item => {
    result[item.key] = item.value;
  });

  return result;
};

// Currency-specific functions
export const getDefaultCurrency = async (): Promise<Currency> => {
  const currency = await getMetadata('default_currency');
  return currency || { code: 'EUR', symbol: '€', name: 'Euro' };
};

export const getSupportedCurrencies = async (): Promise<Currency[]> => {
  const currencies = await getMetadata('supported_currencies');
  return currencies || [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];
};

export const getDefaultCountry = async (): Promise<Country> => {
  const country = await getMetadata('default_country');
  return country || { code: 'DE', name: 'Germany', currency: 'EUR' };
};

// Update metadata (admin only)
export const updateMetadata = async (key: string, value: any): Promise<void> => {
  const { error } = await supabase
    .from('app_metadata')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw new Error(`Failed to update metadata: ${error.message}`);
  }
};

// Format currency amount
export const formatCurrency = (amount: number, currency: Currency): string => {
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback to simple formatting
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
};

// Get currency by code
export const getCurrencyByCode = async (code: string): Promise<Currency | null> => {
  const currencies = await getSupportedCurrencies();
  return currencies.find(c => c.code === code) || null;
};