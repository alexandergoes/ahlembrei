import { supabase } from '@/lib/supabaseClient';

export const fetchMyProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data || null;
};

export const updateMyProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchEmergencyProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      full_name,
      photo_url,
      birth_date,
      health_plan_company,
      health_plan_type,
      health_plan_card_number,
      health_plan_phone,
      emergency_message,
      settings_show_medical,
      settings_show_documents
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchEmergencyContacts = async (userId) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createContact = async (contact) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateContact = async (contactId, updates) => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContact = async (contactId) => {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
};

export const setPrimaryContact = async (userId, contactId) => {
  const { error: unsetError } = await supabase
    .from('emergency_contacts')
    .update({ is_primary: false })
    .eq('user_id', userId);

  if (unsetError) throw unsetError;

  const { error: setError } = await supabase
    .from('emergency_contacts')
    .update({ is_primary: true })
    .eq('id', contactId);

  if (setError) throw setError;
};

export const fetchMedicalRecords = async (userId) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const upsertMedicalRecords = async (userId, records) => {
  const { data, error } = await supabase
    .from('medical_records')
    .upsert({ user_id: userId, ...records })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchDocuments = async (userId) => {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

export const createDocument = async (document) => {
  const { data, error } = await supabase
    .from('user_documents')
    .insert(document)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDocument = async (documentId) => {
  const { data: doc, error: fetchError } = await supabase
    .from('user_documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();

  if (fetchError) throw fetchError;

  if (doc?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([doc.storage_path]);

    if (storageError) throw storageError;
  }

  const { error } = await supabase
    .from('user_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
};

export const getDocumentPublicUrl = (storagePath) => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);

  return data?.publicUrl;
};