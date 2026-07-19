import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/docs/termos_de_uso.md')
      .then(r => r.ok ? r.text() : 'Carregando...')
      .then(setContent)
      .catch(() => setContent('Termos não disponíveis no momento.'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AhLembrei</span>
          </Link>
          <Link to="/" className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 prose prose-gray max-w-none">
          {content ? (
            <pre className="whitespace-pre-wrap font-sans text-gray-700">{content}</pre>
          ) : (
            <p className="text-gray-500">Carregando...</p>
          )}
        </div>
      </main>
    </div>
  );
}
