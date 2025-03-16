import { supabase } from './supabase';

export async function getApiKeys() {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('key_name, key_value');

    if (error) throw error;

    // Convertir array a objeto
    const keys = {};
    data.forEach(({ key_name, key_value }) => {
      keys[key_name] = key_value;
    });

    return keys;
  } catch (error) {
    console.error('Error al obtener las claves API:', error);
    return null;
  }
}