'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Phone,
  User,
  Building2,
  FileText,
  Clock,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  CheckCircle,
  Moon,
  Sun,
  X,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import Link from 'next/link';

// Types
interface HistoricEntry {
  id: string;
  nome: string;
  telefone: string;
  empresa: string;
  observacoes: string;
  pdfName: string;
  pdfSize: string;
  timestamp: string;
  favorito: boolean;
  mensagemResolvida: string;
}

// Initial template
const INITIAL_TEMPLATE = `Olá, {{nome}}!

Segue em anexo a proposta comercial do sistema PIGMOBI{{empresa_link}}.

Caso tenha qualquer dúvida, estou à disposição!

Obrigado,
Equipe PIGMOBI`;

export default function WhatsAppDispatcher() {
  const prefersReducedMotion = useReducedMotion();

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Form State
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Template State
  const [template, setTemplate] = useState(INITIAL_TEMPLATE);
  const [importedQuote, setImportedQuote] = useState('');

  // History State
  const [history, setHistory] = useState<HistoricEntry[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Feedback Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Theme, History, Template, and session data
  useEffect(() => {
    // 1. Theme
    const savedTheme = localStorage.getItem('pigmobi_theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. History
    const savedHistory = localStorage.getItem('pigmobi_whatsapp_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Erro ao ler histórico', e);
      }
    }

    // 3. Template
    const savedTemplate = localStorage.getItem('pigmobi_whatsapp_template');
    if (savedTemplate) {
      setTemplate(savedTemplate);
    }

    // 4. Session import from simulator
    const sessionQuote = sessionStorage.getItem('pigmobi_quote_text');
    if (sessionQuote) {
      setImportedQuote(sessionQuote);
      // Automatically focus and show a prompt
      showToast('Orçamento importado do simulador!');
      // Scroll to message text if needed
    }
  }, []);

  // Theme Toggle Action
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('pigmobi_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Helper: Trigger Feedback Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Phone masking
  const handlePhoneInput = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length <= 2) {
      setTelefone(clean);
    } else if (clean.length <= 6) {
      setTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    } else if (clean.length <= 10) {
      setTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`);
    } else {
      setTelefone(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`);
    }
  };

  // Phone Sanitization (removes parens, dashes, spaces, and adds country code 55 if needed)
  const getSanitizedPhone = (rawPhone: string) => {
    const clean = rawPhone.replace(/\D/g, '');
    if (!clean) return '';
    if (clean.length === 10 || clean.length === 11) {
      return '55' + clean;
    }
    return clean;
  };

  // Placeholders mapping helper
  const resolvedMessage = useMemo(() => {
    const empresaLink = empresa ? ` (${empresa})` : '';
    let result = template
      .replace(/\{\{nome\}\}/g, nome || '[Nome do Cliente]')
      .replace(/\{\{empresa\}\}/g, empresa || '')
      .replace(/\{\{empresa_link\}\}/g, empresaLink)
      .replace(/\{\{observacoes\}\}/g, observacoes || '')
      .replace(/\{\{proposta\}\}/g, importedQuote || '[Sem orçamento importado]');
    return result;
  }, [template, nome, empresa, observacoes, importedQuote]);

  // Insert placeholder helper
  const insertPlaceholder = (ph: string) => {
    const textEl = templateTextareaRef.current;
    if (!textEl) return;
    const start = textEl.selectionStart;
    const end = textEl.selectionEnd;
    const nextText = template.substring(0, start) + ph + template.substring(end);
    setTemplate(nextText);
    localStorage.setItem('pigmobi_whatsapp_template', nextText);
    
    // Reset selection/focus in next render tick
    setTimeout(() => {
      textEl.focus();
      textEl.setSelectionRange(start + ph.length, start + ph.length);
    }, 50);
  };

  // Reset Form
  const clearForm = () => {
    setNome('');
    setTelefone('');
    setEmpresa('');
    setObservacoes('');
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit and open WhatsApp
  const handleOpenWhatsApp = () => {
    if (!nome.trim()) {
      showToast('Por favor, informe o Nome do Cliente!');
      return;
    }
    if (!telefone.trim()) {
      showToast('Por favor, informe o Telefone!');
      return;
    }

    const sanitizedPhone = getSanitizedPhone(telefone);
    if (sanitizedPhone.length < 10) {
      showToast('Número de telefone inválido! Deve conter DDD e número.');
      return;
    }

    // 1. Generate WhatsApp Link (using api.whatsapp.com to allow prefilled text)
    const encodedText = encodeURIComponent(resolvedMessage);
    const waUrl = `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodedText}`;

    // 2. Save to history list
    const newEntry: HistoricEntry = {
      id: Date.now().toString(),
      nome,
      telefone,
      empresa,
      observacoes,
      pdfName: pdfFile ? pdfFile.name : 'Nenhum PDF selecionado',
      pdfSize: pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB` : '',
      timestamp: new Date().toLocaleString('pt-BR'),
      favorito: false,
      mensagemResolvida: resolvedMessage
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('pigmobi_whatsapp_history', JSON.stringify(updatedHistory));

    // 3. Open WhatsApp link in new tab
    window.open(waUrl, '_blank');
    showToast('Redirecionando para o WhatsApp...');
  };

  // Copy message to clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(resolvedMessage);
      showToast('Mensagem resolvida copiada com sucesso!');
    } catch (e) {
      showToast('Erro ao copiar mensagem.');
    }
  };

  // Copy phone number to clipboard
  const handleCopyPhone = async (phoneToCopy: string) => {
    try {
      const clean = getSanitizedPhone(phoneToCopy);
      await navigator.clipboard.writeText(clean);
      showToast(`Telefone sanitizado copiado: ${clean}`);
    } catch (e) {
      showToast('Erro ao copiar telefone.');
    }
  };

  // Re-send from history
  const handleResend = (entry: HistoricEntry) => {
    const sanitizedPhone = getSanitizedPhone(entry.telefone);
    const encodedText = encodeURIComponent(entry.mensagemResolvida);
    const waUrl = `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodedText}`;
    window.open(waUrl, '_blank');
    showToast(`Reenviando para ${entry.nome}...`);
  };

  // Favorite toggle
  const toggleFavorite = (id: string) => {
    const updated = history.map(item => {
      if (item.id === id) {
        return { ...item, favorito: !item.favorito };
      }
      return item;
    });
    setHistory(updated);
    localStorage.setItem('pigmobi_whatsapp_history', JSON.stringify(updated));
    showToast('Favoritos atualizados!');
  };

  // Delete from history
  const handleDeleteEntry = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('pigmobi_whatsapp_history', JSON.stringify(updated));
    showToast('Envio excluído do histórico.');
  };

  // Clean imported quote
  const discardImportedQuote = () => {
    sessionStorage.removeItem('pigmobi_quote_text');
    setImportedQuote('');
    showToast('Orçamento importado descartado.');
  };

  // History Filter/Search
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesSearch =
        item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.telefone.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''));
      
      const matchesFavorite = !filterFavorites || item.favorito;
      return matchesSearch && matchesFavorite;
    });
  }, [history, searchQuery, filterFavorites]);

  // Statistics
  const statistics = useMemo(() => {
    const totalEnviado = history.length;
    const contatosUnicos = new Set(history.map(item => getSanitizedPhone(item.telefone))).size;
    const totalFavoritos = history.filter(item => item.favorito).length;
    return { totalEnviado, contatosUnicos, totalFavoritos };
  }, [history]);

  return (
    <main className="relative min-h-screen bg-[#F8F9F7] text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-500 font-sans">
      {/* Background Blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-950/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-100/20 dark:bg-amber-950/5 rounded-full blur-3xl -z-10" />
      <div className="noise-overlay" />

      {/* Header Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md font-sans">
                WHATSAPP
              </span>
              <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                PIGMOBI DISPARADOR
              </h1>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: THE FORM */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Imported Quote Notification Card */}
            {importedQuote && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50 p-3.5 rounded-2xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900 dark:text-emerald-450 block font-bold">
                      Orçamento Importado!
                    </strong>
                    <span className="text-emerald-700 dark:text-emerald-500">
                      Você pode usar a tag <code className="bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded font-mono font-bold text-[10px] text-emerald-800 dark:text-emerald-400">{"{{proposta}}"}</code> no seu template para carregar o orçamento.
                    </span>
                  </div>
                </div>
                <button
                  onClick={discardImportedQuote}
                  className="text-emerald-650 hover:text-emerald-900 dark:text-emerald-500 dark:hover:text-white"
                  title="Descartar"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Main Interactive Dispatcher Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-black uppercase text-slate-800 dark:text-slate-250 tracking-wider">
                  Nova Proposta por WhatsApp
                </h2>
                <button
                  onClick={clearForm}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Limpar Campos
                </button>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nome do Cliente */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client-name" className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Cliente *
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Henrique Hintz"
                    className="p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Telefone com DDD */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client-phone" className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Telefone *
                  </label>
                  <input
                    id="client-phone"
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => handlePhoneInput(e.target.value)}
                    placeholder="Ex: (41) 99999-9999"
                    className="p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Empresa (Opcional) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client-company" className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Empresa (Opcional)
                  </label>
                  <input
                    id="client-company"
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Ex: Pizzaria Mamma Mia"
                    className="p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* PDF selector (NO upload, just display metadata) */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Proposta em PDF
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {pdfFile ? (
                    <div className="flex items-center justify-between p-2 text-xs bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-800/40 rounded-xl">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{pdfFile.name}</p>
                          <p className="text-[9px] text-slate-500 font-mono">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500"
                        title="Remover arquivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-500 dark:text-slate-400 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Selecionar Proposta PDF local</span>
                    </button>
                  )}
                </div>

                {/* Observações internas */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                  <label htmlFor="client-obs" className="text-xs font-bold text-slate-650 dark:text-slate-400">
                    Observações Internas (Opcional)
                  </label>
                  <textarea
                    id="client-obs"
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Ex: Cliente quer desconto se fechar contrato anual."
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Template editor */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b pb-2 border-slate-200/50 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-750 dark:text-slate-350 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Template da Mensagem
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{nome}}')}
                      className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-md text-emerald-800 dark:text-emerald-450"
                      title="Inserir nome do cliente"
                    >
                      {"{{nome}}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{empresa}}')}
                      className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-md text-emerald-800 dark:text-emerald-450"
                      title="Inserir empresa"
                    >
                      {"{{empresa}}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{observacoes}}')}
                      className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-md text-emerald-800 dark:text-emerald-450"
                      title="Inserir observações"
                    >
                      {"{{observacoes}}"}
                    </button>
                    {importedQuote && (
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{{proposta}}')}
                        className="px-2 py-0.5 text-[9px] font-black font-mono bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-850 rounded-md text-emerald-800 dark:text-emerald-400"
                        title="Inserir orçamento importado"
                      >
                        {"{{proposta}}"}
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  ref={templateTextareaRef}
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    localStorage.setItem('pigmobi_whatsapp_template', e.target.value);
                  }}
                  rows={4}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-700 dark:text-slate-300"
                />

                <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 text-left space-y-1 max-h-36 overflow-y-auto">
                  <span className="text-[9px] font-black text-slate-400 font-mono block tracking-wider uppercase">Visualização da Mensagem Resolvida:</span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">
                    {resolvedMessage}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="md:col-span-4 w-full py-3.5 bg-slate-100 hover:bg-slate-250 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Mensagem</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="md:col-span-8 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Abrir no WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 justify-center mt-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>O WhatsApp será aberto na conversa correta. Anexe o PDF manualmente antes de enviar.</span>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: HISTORY & STATS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Statistics Row Card */}
            <section className="grid grid-cols-3 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm text-left">
              <div className="border-r border-slate-100 dark:border-slate-800 pr-2">
                <span className="text-[8px] font-black text-slate-400 font-mono block tracking-wider uppercase">ENVIADOS</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-500 leading-none block mt-1">
                  {statistics.totalEnviado}
                </span>
              </div>
              <div className="border-r border-slate-100 dark:border-slate-800 px-1">
                <span className="text-[8px] font-black text-slate-400 font-mono block tracking-wider uppercase">CLIENTES</span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none block mt-1">
                  {statistics.contatosUnicos}
                </span>
              </div>
              <div className="pl-2">
                <span className="text-[8px] font-black text-slate-400 font-mono block tracking-wider uppercase">FAVORITOS</span>
                <span className="text-xl font-black font-mono text-amber-500 leading-none block mt-1">
                  {statistics.totalFavoritos}
                </span>
              </div>
            </section>

            {/* History Feed Card */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between min-h-[400px]">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                  <h2 className="text-xs font-black uppercase text-slate-800 dark:text-slate-250 tracking-wider">
                    Histórico de Disparos
                  </h2>
                  <span className="text-[9px] font-mono text-slate-400">
                    Listando {filteredHistory.length} envios
                  </span>
                </div>

                {/* Filter and Search actions */}
                <div className="flex items-center gap-2">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar cliente, empresa..."
                      className="w-full py-2 pl-9 pr-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Toggle Favorites filter */}
                  <button
                    onClick={() => setFilterFavorites(!filterFavorites)}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1 ${
                      filterFavorites
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                    title={filterFavorites ? 'Exibindo favoritos' : 'Filtrar por favoritos'}
                  >
                    <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                {/* History List */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className={`p-3 rounded-2xl border text-xs text-left relative flex flex-col justify-between gap-2 transition-colors ${
                            entry.favorito
                              ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-950/10 dark:border-amber-800/20'
                              : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 dark:bg-slate-950/20 dark:hover:bg-slate-950/50 dark:border-slate-800/80'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <strong className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{entry.nome}</strong>
                                {entry.empresa && (
                                  <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">{entry.empresa}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{entry.telefone}</span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-350 shrink-0" />
                                {entry.timestamp}
                              </span>
                            </div>
                            
                            {/* PDF filename display */}
                            <div className="text-[9px] text-slate-400 max-w-[130px] truncate text-right bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-250/30 dark:border-slate-850 shrink-0 font-mono">
                              <p className="truncate font-bold text-slate-800 dark:text-slate-300" title={entry.pdfName}>{entry.pdfName}</p>
                              {entry.pdfSize && <p className="text-[8px] text-slate-400">{entry.pdfSize}</p>}
                            </div>
                          </div>

                          {/* Quick action buttons row */}
                          <div className="flex items-center justify-between border-t pt-2 border-slate-200/40 dark:border-slate-850">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleFavorite(entry.id)}
                                className={`p-1.5 rounded-lg border transition-all ${
                                  entry.favorito
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                    : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                                }`}
                                title={entry.favorito ? 'Remover dos favoritos' : 'Favoritar'}
                              >
                                <Star className={`w-3.5 h-3.5 ${entry.favorito ? 'fill-amber-500' : ''}`} />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleCopyPhone(entry.telefone)}
                                className="p-1.5 rounded-lg border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Copiar telefone limpo"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(entry.mensagemResolvida);
                                    showToast('Mensagem enviada copiada para clipboard!');
                                  } catch (e) {
                                    showToast('Erro ao copiar.');
                                  }
                                }}
                                className="p-1.5 rounded-lg border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Copiar mensagem enviada"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-1.5 rounded-lg border bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-400 hover:text-red-600 transition-colors"
                                title="Excluir do histórico"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleResend(entry)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span>Reenviar</span>
                              <ExternalLink className="w-2.5 h-2.5 text-emerald-200" />
                            </button>
                          </div>

                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-500">Nenhum envio registrado</p>
                          <p className="text-[10px] text-slate-450 mt-1 max-w-[200px] mx-auto leading-normal">Seus disparos de proposta aparecerão aqui para consultas e reenvios rápidos.</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Instructions footer widget */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 mt-4 text-xs space-y-1.5">
                <span className="text-[9px] font-black text-slate-450 dark:text-slate-400 font-mono tracking-wider block uppercase">DICA OPERACIONAL DE VELOCIDADE:</span>
                <ol className="list-decimal pl-4 space-y-1 text-slate-500 leading-relaxed text-[10px]">
                  <li>Cadastre o cliente, selecione o PDF e clique em <strong>Abrir no WhatsApp</strong>.</li>
                  <li>Na aba que se abre, a mensagem já estará colada. Pressione <strong>Enviar</strong>.</li>
                  <li>Clique no clipe (Anexo) do WhatsApp, selecione o PDF (que está no seu download recente) e envie.</li>
                </ol>
              </div>

            </section>
          </div>

        </div>
      </div>

      {/* Dynamic Copy Alert Notification feedback toasting */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full text-xs font-bold font-sans tracking-wide flex items-center gap-2 shadow-xl border border-slate-800 dark:border-slate-200"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
