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
      phone,
      health_plan_company,
      health_plan_type,
      health_plan_card_number,
      health_plan_phone,
      emergency_message,
      settings_show_medical,
      settings_show_documents,
      address_zipcode,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      address_country
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

  if (error) {
    console.warn('fetchMedicalRecords direto falhou (406?), tentando smart-worker...', error);
    return fetchMedicalRecordsPublic(userId);
  }
  return data || null;
};

export const fetchMedicalRecordsPublic = async (userId) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const smartWorkerUrl = `${supabaseUrl}/functions/v1/smart-worker`;
  const res = await fetch(smartWorkerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error('Erro ao buscar dados médicos');
  return res.json();
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

export const fetchAllUsers = async () => {
  const { data, error } = await supabase.rpc('admin_list_all_users');
  if (error) return { success: false, data: [], error };
  return { success: true, data, error: null };
};

export const getDocumentPublicUrl = (storagePath) => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);

  return data?.publicUrl;
};

export const adminListUsers = async (filters = {}) => {
  const { data, error } = await supabase.rpc('admin_list_users', {
    status_filter: filters.status || 'all',
    plan_filter: filters.plan || 'all',
    role_filter: filters.role || 'all',
    sort_by: filters.sortBy || 'created_at',
    sort_dir: filters.sortDir || 'desc',
    search_term: filters.search || '',
  });
  if (error) throw error;
  return data || [];
};

export const adminUpdateUserRole = async (userId, newRole) => {
  const { error } = await supabase.rpc('admin_update_user_role', {
    target_user_id: userId,
    new_role: newRole,
  });
  if (error) throw error;
};

export const adminToggleUserActive = async (userId) => {
  const { error } = await supabase.rpc('admin_toggle_user_active', { target_user_id: userId });
  if (error) throw error;
};

export const adminGetUserAudit = async (userId) => {
  const { data, error } = await supabase.rpc('admin_get_user_audit', { target_user_id: userId });
  if (error) throw error;
  return data || [];
};

export const adminDeleteUser = async (userId) => {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
  if (error) throw error;
};

export const adminListAuditLogs = async () => {
  const { data, error } = await supabase.rpc('admin_list_audit_logs');
  if (error) throw error;
  return data || [];
};

export const adminListEmergencyLogs = async () => {
  const { data, error } = await supabase.rpc('admin_list_emergency_logs');
  if (error) throw error;
  return data || [];
};

export const logEmergencyAccess = async (userId, { method = 'qrcode', status = 'SUCCESS', attempts = 0 } = {}) => {
  const { error } = await supabase.from('emergency_logs').insert({
    user_id: userId,
    ip_address: null,
    user_agent: navigator.userAgent,
    access_method: method,
    status,
    attempt_count: attempts,
  });
  if (error) console.error('Error logging access:', error);
};

export const updateMyAddress = async (address) => {
  const { error } = await supabase.rpc('update_my_address', {
    p_zipcode: address.address_zipcode || null,
    p_street: address.address_street || null,
    p_number: address.address_number || null,
    p_complement: address.address_complement || null,
    p_neighborhood: address.address_neighborhood || null,
    p_city: address.address_city || null,
    p_state: address.address_state || null,
    p_country: address.address_country || 'Brasil',
  });
  if (error) throw error;
};

export const searchByHandle = async (handle) => {
  const clean = handle.replace('@', '').trim().toLowerCase();
  const { data, error } = await supabase.rpc('search_by_handle', { p_handle: clean });
  if (error) throw error;
  return data?.[0] || null;
};

export const getRandomQuestions = async (userId, count = 2) => {
  const { data, error } = await supabase.rpc('get_random_questions', { p_user_id: userId, p_count: count });
  if (error) throw error;
  return data || [];
};

export const verifySecurityAnswer = async (questionId, answer) => {
  const { data, error } = await supabase.rpc('verify_security_answer', {
    p_question_id: questionId,
    p_answer: answer.toLowerCase().trim(),
  });
  if (error) throw error;
  return data;
};

export const logSecurityFailure = async (userId, attempts) => {
  const { error } = await supabase.rpc('log_security_failure', {
    p_user_id: userId,
    p_attempts: attempts,
  });
  if (error) console.error('Error logging security failure:', error);
};

export const fetchSecurityQuestions = async (userId) => {
  const { data, error } = await supabase
    .from('security_questions')
    .select('id, question_text')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const saveSecurityQuestions = async (userId, questions) => {
  const hashed = questions.map(q => ({
    user_id: userId,
    question_text: q.question_text,
    answer_hash: q.answer_hash,
  }));
  const { error: delError } = await supabase
    .from('security_questions')
    .delete()
    .eq('user_id', userId);
  if (delError) throw delError;

  const { error } = await supabase
    .from('security_questions')
    .insert(hashed);
  if (error) throw error;
};