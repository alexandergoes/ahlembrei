import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Eye, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { fetchDocuments, createDocument, deleteDocument, getDocumentPublicUrl } from '@/lib/emergencyApi';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const canUpload = user?.plan !== 'free';

  const documentTypes = [
    { id: 'rg', label: 'RG', description: 'Registro Geral', accept: 'image/*,.pdf' },
    { id: 'cnh', label: 'CNH', description: 'Carteira Nacional de Habilitação', accept: 'image/*,.pdf' },
    { id: 'insurance', label: 'Convênio', description: 'Cartão do convênio médico', accept: 'image/*,.pdf' }
  ];

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments(user.id);
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (typeId) => {
    if (!canUpload) {
      toast({ title: "Upgrade necessário", description: "Faça upgrade para o plano Básico ou Premium para fazer upload de documentos.", variant: "destructive" });
      return;
    }
    setUploadTarget(typeId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    setUploading(uploadTarget);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${uploadTarget}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const doc = await createDocument({
        user_id: user.id,
        document_type: uploadTarget,
        name: documentTypes.find(dt => dt.id === uploadTarget)?.label || uploadTarget,
        storage_path: filePath,
        file_url: publicUrl,
        file_size: file.size,
        content_type: file.type
      });

      setDocuments([...documents, doc]);
      toast({ title: "Documento enviado!", description: "Upload realizado com sucesso." });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: "Erro no upload", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleView = (doc) => {
    const url = getDocumentPublicUrl(doc.storage_path);
    if (url) window.open(url, '_blank');
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
      toast({ title: "Documento removido" });
    } catch (err) {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept="image/*,.pdf"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos</h2>
        <p className="text-gray-600">
          {canUpload ? 'Faça upload dos seus documentos importantes para acesso em emergências.' : 'Upgrade para o plano Básico ou Premium para fazer upload de documentos.'}
        </p>
      </motion.div>

      {!canUpload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200"
        >
          <div className="flex items-center space-x-4">
            <Crown className="w-12 h-12 text-yellow-600" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Funcionalidade Premium</h3>
              <p className="text-gray-700 mb-4">O upload de documentos está disponível nos planos Básico e Premium.</p>
              <Button className="gradient-bg text-white hover:opacity-90">
                <Crown className="w-5 h-5 mr-2" /> Fazer Upgrade
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documentTypes.map((type, index) => {
          const hasDocument = documents.find(doc => doc.document_type === type.id);
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${!canUpload ? 'opacity-50' : ''}`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                  hasDocument ? 'bg-green-100 text-green-600' : canUpload ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{type.label}</h3>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>

                {hasDocument ? (
                  <div className="space-y-2">
                    <Button onClick={() => handleView(hasDocument)} variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" /> Visualizar
                    </Button>
                    <Button onClick={() => handleDelete(hasDocument.id)} variant="outline" size="sm"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" /> Remover
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleUploadClick(type.id)} disabled={!canUpload || uploading === type.id}
                    className={`w-full ${canUpload ? 'gradient-bg text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    {uploading === type.id ? (
                      <span className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Enviando...</span>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> {canUpload ? 'Fazer Upload' : 'Upgrade Necessário'}</>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Documentos Enviados</h3>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => handleView(doc)} variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                  <Button onClick={() => handleDelete(doc.id)} variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Segurança dos seus documentos</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Todos os documentos são criptografados</li>
          <li>• Acesso apenas via autenticação segura</li>
          <li>• Armazenamento em servidores certificados</li>
          <li>• Você pode remover os documentos a qualquer momento</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Documents;