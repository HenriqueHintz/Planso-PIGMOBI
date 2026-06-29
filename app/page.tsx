'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Check,
  Copy,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Info,
  FileText,
  Tv,
  ShoppingBag,
  Store,
  QrCode,
  CreditCard,
  Sparkles,
  Monitor,
  DollarSign,
  Users,
  PieChart,
  Notebook,
  Lock,
  Tablet,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PLANOS_JSON, PLANS, ALL_ADDITIONAL_ITEMS, formatCurrency, PlanDefinition, AdditionalItemDefinition } from '../lib/data';

// Component to dynamically render Lucide Icons by name
const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'FileText': return <FileText className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Store': return <Store className={className} />;
    case 'QrCode': return <QrCode className={className} />;
    case 'CreditCard': return <CreditCard className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'Users': return <Users className={className} />;
    case 'PieChart': return <PieChart className={className} />;
    case 'Notebook': return <Notebook className={className} />;
    case 'Tablet': return <Tablet className={className} />;
    default: return <Info className={className} />;
  }
};

const INITIAL_OBS_MD = `# Observações Importantes

- **Suporte técnico prioritário** ativo 24/7 incluso na contratação.
- **Treinamento completo** da equipe no dia da implantação (onboarding assistido).
- **Fidelidade de 12 meses** com desconto de 15% já embutido no simulador.

*Prazo estimado para homologação fiscal e liberação do sistema:* 3 dias úteis.`;

const MarkdownRender = ({ content }: { content: string }) => {
  if (!content) return <p className="text-slate-400 italic">Nenhuma observação informada.</p>;

  const parseInline = (text: string) => {
    let parts: (string | ReactNode)[] = [text];
    
    // Bold Regex **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let newParts: (string | ReactNode)[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        let lastIndex = 0;
        let match;
        const tempParts: (string | ReactNode)[] = [];
        while ((match = boldRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push(part.substring(lastIndex, match.index));
          }
          tempParts.push(<strong key={`b-${match.index}`} className="font-extrabold text-slate-900">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          tempParts.push(part.substring(lastIndex));
        }
        newParts.push(...(tempParts.length > 0 ? tempParts : [part]));
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    // Italic Regex *text*
    newParts = [];
    const italicRegex = /\*(.*?)\*/g;
    parts.forEach(part => {
      if (typeof part === 'string') {
        let lastIndex = 0;
        let match;
        const tempParts: (string | ReactNode)[] = [];
        while ((match = italicRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push(part.substring(lastIndex, match.index));
          }
          tempParts.push(<em key={`i-${match.index}`} className="font-medium italic text-slate-800">{match[1]}</em>);
          lastIndex = italicRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          tempParts.push(part.substring(lastIndex));
        }
        newParts.push(...(tempParts.length > 0 ? tempParts : [part]));
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    // Inline code `code`
    newParts = [];
    const codeRegex = /`(.*?)`/g;
    parts.forEach(part => {
      if (typeof part === 'string') {
        let lastIndex = 0;
        let match;
        const tempParts: (string | ReactNode)[] = [];
        while ((match = codeRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push(part.substring(lastIndex, match.index));
          }
          tempParts.push(<code key={`c-${match.index}`} className="px-1.5 py-0.5 bg-slate-100 rounded font-semibold text-xs font-mono text-emerald-750">{match[1]}</code>);
          lastIndex = codeRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          tempParts.push(part.substring(lastIndex));
        }
        newParts.push(...(tempParts.length > 0 ? tempParts : [part]));
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    // Links [text](url)
    newParts = [];
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    parts.forEach(part => {
      if (typeof part === 'string') {
        let lastIndex = 0;
        let match;
        const tempParts: (string | ReactNode)[] = [];
        while ((match = linkRegex.exec(part)) !== null) {
          if (match.index > lastIndex) {
            tempParts.push(part.substring(lastIndex, match.index));
          }
          tempParts.push(
            <a 
              key={`l-${match.index}`} 
              href={match[2]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-700 hover:underline font-bold"
            >
              {match[1]}
            </a>
          );
          lastIndex = linkRegex.lastIndex;
        }
        if (lastIndex < part.length) {
          tempParts.push(part.substring(lastIndex));
        }
        newParts.push(...(tempParts.length > 0 ? tempParts : [part]));
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    return <>{parts}</>;
  };

  const lines = content.split('\n');
  const elements: ReactNode[] = [];

  let currentBlockType: 'list' | 'table' | 'code' | null = null;
  let accumulatedItems: string[] = [];
  let tableRows: string[][] = [];

  const flushBlock = (index: number) => {
    if (currentBlockType === 'list') {
      elements.push(
        <ul key={`list-${index}`} className="list-disc pl-5 my-2 space-y-1">
          {accumulatedItems.map((item, idx) => (
            <li key={idx} className="text-slate-700 leading-relaxed text-xs">{parseInline(item)}</li>
          ))}
        </ul>
      );
      accumulatedItems = [];
    } else if (currentBlockType === 'code') {
      elements.push(
        <pre key={`code-${index}`} className="p-3 my-2 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono border border-slate-800">
          <code>{accumulatedItems.join('\n')}</code>
        </pre>
      );
      accumulatedItems = [];
    } else if (currentBlockType === 'table') {
      if (tableRows.length > 0) {
        const headers = tableRows[0];
        const contentRows = tableRows.slice(1).filter(r => !r.every(cell => cell.trim().match(/^[-:|]+$/)));
        elements.push(
          <div key={`table-${index}`} className="overflow-x-auto my-2 border border-slate-200 rounded-xl max-w-full">
            <table className="w-full text-left text-xs border-collapse divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="p-2 font-bold text-slate-750 uppercase tracking-wider text-[9px]">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {contentRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 text-slate-600 text-xs">{parseInline(cell.trim())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableRows = [];
    }
    currentBlockType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (currentBlockType === 'code') {
        flushBlock(i);
      } else {
        flushBlock(i);
        currentBlockType = 'code';
      }
      continue;
    }

    if (currentBlockType === 'code') {
      accumulatedItems.push(line);
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (currentBlockType !== 'table') {
        flushBlock(i);
        currentBlockType = 'table';
      }
      const cells = line.split('|').map(s => s.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
      const isSeparator = cells.every(c => c.match(/^[- :|]+$/));
      if (!isSeparator) {
        tableRows.push(cells);
      }
      continue;
    } else if (currentBlockType === 'table') {
      flushBlock(i);
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (currentBlockType !== 'list') {
        flushBlock(i);
        currentBlockType = 'list';
      }
      accumulatedItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    } else if (currentBlockType === 'list') {
      flushBlock(i);
    }

    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="text-base font-extrabold text-slate-900 mt-3 mb-1.5 first:mt-0">{parseInline(line.slice(2))}</h2>);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-sm font-extrabold text-slate-800 mt-2.5 mb-1">{parseInline(line.slice(3))}</h3>);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-xs font-bold text-slate-950 mt-2 mb-1">{parseInline(line.slice(4))}</h4>);
    } else if (line.trim().startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="pl-3 border-l-4 border-emerald-500 italic text-slate-600 bg-emerald-50/20 py-2 px-3 rounded-r-xl my-1.5">
          {parseInline(line.replace(/^>\s+/, ''))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(<p key={i} className="text-xs text-slate-600 leading-relaxed my-1">{parseInline(line)}</p>);
    }
  }

  flushBlock(lines.length);

  return <div className="space-y-1 w-full">{elements}</div>;
};

export default function Page() {
  const prefersReducedMotion = useReducedMotion();

  // Selected Section/Tab view: 'simulador' | 'comparativo'
  const [activeTab, setActiveTab ] = useState<'simulador' | 'comparativo'>('simulador');

  // State
  const [selectedPlanId, setSelectedPlanId] = useState<'smart' | 'prime' | 'infinity'>('prime');
  const [additionalAcessos, setAdditionalAcessos] = useState<number>(0);
  const [additionalsState, setAdditionalsState] = useState<{
    [key: string]: { selected: boolean; quantity: number | string; lastValidQuantity: number };
  }>({});
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [expandedPlanIds, setExpandedPlanIds] = useState<{ [key: string]: boolean }>({});

  // Observations State & Tabs (Self-persistent in session / memory)
  const [observations, setObservations] = useState<string>(INITIAL_OBS_MD);
  const [obsTab, setObsTab] = useState<'edit' | 'preview'>('edit');
  const [isObsOpen, setIsObsOpen] = useState(false);

  // URL state loaded tracker
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);

  // Parse URL parameter on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlPlan = params.get('plano') as 'smart' | 'prime' | 'infinity' | null;
    const urlAcessos = params.get('acessos');
    const urlAdicionais = params.get('adicionais');

    if (urlPlan && ['smart', 'prime', 'infinity'].includes(urlPlan)) {
      setSelectedPlanId(urlPlan);
    }
    if (urlAcessos) {
      const parsedAcessos = parseInt(urlAcessos, 10);
      if (!isNaN(parsedAcessos) && parsedAcessos >= 0) {
        setAdditionalAcessos(parsedAcessos);
      }
    }
    if (urlAdicionais) {
      const activeList = urlAdicionais.split(',');
      const initialAddState: { [key: string]: { selected: boolean; quantity: number | string; lastValidQuantity: number } } = {};
      activeList.forEach(itemStr => {
        if (!itemStr) return;
        const [id, qtyStr] = itemStr.split(':');
        let quantity: number = 1;
        if (qtyStr) {
          const parsedQty = parseInt(qtyStr, 10);
          if (!isNaN(parsedQty) && parsedQty >= 1) {
            quantity = parsedQty;
          }
        }
        initialAddState[id] = {
          selected: true,
          quantity,
          lastValidQuantity: quantity
        };
      });
      setAdditionalsState(initialAddState);
    }
    setIsUrlLoaded(true);
  }, []);

  // Update URL parameters when configuration changes
  useEffect(() => {
    if (!isUrlLoaded || typeof window === 'undefined') return;
    const params = new URLSearchParams();
    params.set('plano', selectedPlanId);
    if (additionalAcessos > 0) {
      params.set('acessos', additionalAcessos.toString());
    }

    const activeAdicionais = Object.entries(additionalsState)
      .filter(([_, state]) => state.selected)
      .map(([id, state]) => {
        const qty = state.quantity;
        const parsedQty = typeof qty === 'number' ? qty : parseInt(qty as string, 10);
        return !isNaN(parsedQty) && parsedQty > 1 ? `${id}:${parsedQty}` : id;
      });

    if (activeAdicionais.length > 0) {
      params.set('adicionais', activeAdicionais.join(','));
    }

    const newSearch = params.toString();
    const currentPath = window.location.pathname;
    window.history.replaceState(null, '', newSearch ? `${currentPath}?${newSearch}` : currentPath);
  }, [selectedPlanId, additionalAcessos, additionalsState, isUrlLoaded]);

  // Active Plan Object
  const selectedPlan = useMemo(() => {
    return PLANOS_JSON[selectedPlanId];
  }, [selectedPlanId]);

  // Filtered additionals - only allowed ones of the current plan are shown
  const visibleAdditionals = useMemo(() => {
    return ALL_ADDITIONAL_ITEMS.filter(item => selectedPlan.allowedAdditionals[item.id] !== undefined);
  }, [selectedPlan]);

  // Handle plan switching + clamping of additional accesses
  const changePlan = (planId: 'smart' | 'prime' | 'infinity') => {
    setSelectedPlanId(planId);
    const targetPlan = PLANOS_JSON[planId];
    if (targetPlan.accessControl.maxAdditional !== -1 && additionalAcessos > targetPlan.accessControl.maxAdditional) {
      setAdditionalAcessos(targetPlan.accessControl.maxAdditional);
    }
  };

  // Toggle selection of additional items
  const toggleAdditional = (itemId: string, defaultQty: number = 1) => {
    // If the item is blocked in the selected plan, trigger visual warning / plan upgrade
    const isAllowed = selectedPlan.allowedAdditionals[itemId] !== undefined;
    if (!isAllowed) {
      const requiredPlanId = PLANS.find(p => p.allowedAdditionals[itemId] !== undefined)?.id;
      if (requiredPlanId) {
        changePlan(requiredPlanId);
        setCopyFeedback(`Plano alterado para ${PLANOS_JSON[requiredPlanId].name} para liberar o adicional!`);
        setTimeout(() => setCopyFeedback(null), 3500);
      }
      return;
    }

    setAdditionalsState((prev) => {
      const current = prev[itemId] || { selected: false, quantity: defaultQty, lastValidQuantity: defaultQty };
      return {
        ...prev,
        [itemId]: {
          ...current,
          selected: !current.selected,
          quantity: current.quantity === '' ? (current.lastValidQuantity || defaultQty) : current.quantity,
        },
      };
    });
  };

  // Update quantity of additional items (plus and minus buttons)
  const updateQuantity = (itemId: string, change: number, defaultQty: number = 1) => {
    setAdditionalsState((prev) => {
      const current = prev[itemId] || { selected: false, quantity: defaultQty, lastValidQuantity: defaultQty };
      const currentQty = typeof current.quantity === 'number' ? current.quantity : (parseInt(current.quantity as string, 10) || defaultQty);
      const newQty = Math.max(1, currentQty + change);
      return {
        ...prev,
        [itemId]: {
          selected: true,
          quantity: newQty,
          lastValidQuantity: newQty,
        },
      };
    });
  };

  // Directly input quantity of additional items (with positive integer sanitation)
  const handleQuantityInput = (itemId: string, value: string, defaultQty: number = 1) => {
    if (value === '') {
      setAdditionalsState((prev) => {
        const current = prev[itemId] || { selected: false, quantity: defaultQty, lastValidQuantity: defaultQty };
        return {
          ...prev,
          [itemId]: {
            ...current,
            quantity: '',
            selected: true,
          },
        };
      });
      return;
    }

    const sanitizedString = value.replace(/[^0-9]/g, '');
    if (sanitizedString === '') {
      return;
    }

    const parsedValue = parseInt(sanitizedString, 10);
    
    if (parsedValue === 0) {
      setAdditionalsState((prev) => {
        const current = prev[itemId] || { selected: false, quantity: defaultQty, lastValidQuantity: defaultQty };
        return {
          ...prev,
          [itemId]: {
            ...current,
            quantity: '0',
            selected: true,
          },
        };
      });
      return;
    }

    if (parsedValue >= 1) {
      setAdditionalsState((prev) => {
        const current = prev[itemId] || { selected: false, quantity: defaultQty, lastValidQuantity: defaultQty };
        return {
          ...prev,
          [itemId]: {
            selected: true,
            quantity: parsedValue,
            lastValidQuantity: parsedValue,
          },
        };
      });
    }
  };

  // On blur, revert to last valid quantity or default if value is invalid, empty, or below 1
  const handleQuantityBlur = (itemId: string, defaultQty: number = 1) => {
    setAdditionalsState((prev) => {
      const current = prev[itemId];
      if (!current) return prev;

      const lastValid = current.lastValidQuantity || defaultQty || 1;
      let finalVal = lastValid;

      if (current.quantity !== '') {
        const parsedValue = typeof current.quantity === 'number' ? current.quantity : parseInt(current.quantity as string, 10);
        if (!isNaN(parsedValue) && parsedValue >= 1) {
          finalVal = parsedValue;
        }
      }

      return {
        ...prev,
        [itemId]: {
          ...current,
          quantity: finalVal,
          lastValidQuantity: finalVal,
        },
      };
    });
  };

  // Date strings — computed client-side only to avoid SSR/client hydration mismatch
  const [todayStr, setTodayStr] = useState('');
  const [yearStr, setYearStr] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    const now = new Date();
    setTodayStr(now.toLocaleDateString('pt-BR'));
    setYearStr(String(now.getFullYear()));
    const exp = new Date();
    exp.setDate(exp.getDate() + 10);
    setExpirationDate(exp.toLocaleDateString('pt-BR'));
  }, []);

  // Allow hitting Enter to blur
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // Financial Calculations
  const calculatedValues = useMemo(() => {
    let additionalsTotal = 0;
    const selectedList: { item: AdditionalItemDefinition; qty: number; unitPrice: number; subtotal: number }[] = [];

    // 1. Calculate accesses cost
    const costAcessosAdicionais = additionalAcessos * selectedPlan.accessControl.additionalPrice;
    additionalsTotal += costAcessosAdicionais;

    if (additionalAcessos > 0) {
      selectedList.push({
        item: {
          id: 'acesso_adicional_item',
          name: 'Acesso Adicional',
          description: 'Licenças de acesso adicionais ao painel.',
          iconName: 'Users',
          hasQuantity: true
        },
        qty: additionalAcessos,
        unitPrice: selectedPlan.accessControl.additionalPrice,
        subtotal: costAcessosAdicionais
      });
    }

    // 2. Calculate selectable additions
    ALL_ADDITIONAL_ITEMS.forEach((item) => {
      const state = additionalsState[item.id] || { selected: false, quantity: 1, lastValidQuantity: 1 };
      const allowedPrice = selectedPlan.allowedAdditionals[item.id];

      // Only calculate if selected AND allowed in this plan
      if (state.selected && allowedPrice !== undefined) {
        let qty = 1;
        if (item.hasQuantity) {
          const rawQty = state.quantity;
          const parsedQty = typeof rawQty === 'number' ? rawQty : parseInt(rawQty as string, 10);
          qty = isNaN(parsedQty) || parsedQty < 1 ? (state.lastValidQuantity || 1) : parsedQty;
        }
        const subtotal = allowedPrice * qty;
        additionalsTotal += subtotal;
        selectedList.push({
          item,
          qty,
          unitPrice: allowedPrice,
          subtotal,
        });
      }
    });

    const totalMonthly = selectedPlan.monthlyPrice + additionalsTotal;
    const setupTotal = selectedPlan.setupPrice;
    const totalInvestment = totalMonthly + setupTotal;

    return {
      additionalsTotal,
      selectedList,
      totalMonthly,
      setupTotal,
      totalInvestment,
      costAcessosAdicionais
    };
  }, [selectedPlan, additionalsState, additionalAcessos]);

  // Copy Quote Core Text Generator
  const generateQuoteText = () => {
    const dateFormatted = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const totalAcessos = selectedPlan.accessControl.included + additionalAcessos;
    const acessosTexto = additionalAcessos > 0
      ? `${selectedPlan.accessControl.included} incluso(s) com mais ${additionalAcessos} adicional(is) (Total: ${totalAcessos} acessos)`
      : `${selectedPlan.accessControl.included} incluso(s) (Total: ${totalAcessos} acesso${totalAcessos > 1 ? 's' : ''})`;

    let text = `=====================================\n`;
    text += `*ORÇAMENTO SISTEMA RESTAURANTE*\n`;
    text += `=====================================\n\n`;
    text += `  *Plano Selecionado:* ${selectedPlan.name}\n`;
    text += `  *Acessos no Sistema:* ${acessosTexto}\n`;
    text += `  *Mensalidade Base:* ${formatCurrency(selectedPlan.monthlyPrice)}/mês\n`;
    text += `  *Taxa de Implantação:* ${formatCurrency(selectedPlan.setupPrice)} (Taxa Única)\n\n`;

    if (calculatedValues.selectedList.length > 0) {
      text += `-------------------------------------\n`;
      text += `*Adicionais e Acessos Integrados:*\n`;
      calculatedValues.selectedList.forEach(({ item, qty, unitPrice, subtotal }) => {
        if (item.hasQuantity) {
          text += `  • ${item.name} (${qty}x) — ${formatCurrency(unitPrice)}/un [Subtotal: ${formatCurrency(subtotal)}/mês]\n`;
        } else {
          text += `  • ${item.name} — ${formatCurrency(unitPrice)}/mês \n`;
        }
      });
      text += `\n  ➔ *Total Adicionais:* ${formatCurrency(calculatedValues.additionalsTotal)}/mês\n`;
    } else {
      text += `-------------------------------------\n`;
      text += `*Adicionais:* Nenhum selecionado.\n`;
    }

    text += `\n=====================================\n`;
    text += `*CONSOLIDADO FINANCEIRO*\n`;
    text += `=====================================\n`;
    text += `  *MENSALIDADE TOTAL:* *${formatCurrency(calculatedValues.totalMonthly)}/mês*\n`;
    text += `  *IMPLANTAÇÃO:* *${formatCurrency(calculatedValues.setupTotal)}* (Pago uma única vez no onboarding)\n`;
    text += `=====================================\n\n`;
    text += `  *Gerado em:* ${dateFormatted}\n`;
    text += `  *Orçamento válido por 10 dias. Faça seu pedido já para ativação imediata!*\n`;

    return text;
  };

  // Copy to clipboard Action
  const copyToClipboard = async () => {
    try {
      const text = generateQuoteText();
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Orçamento copiado com sucesso! Prontinho para enviar.');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (err) {
      setCopyFeedback('Erro ao copiar orçamento.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  // WhatsApp Redirect Action
  const sendToWhatsApp = () => {
    const textMessage = generateQuoteText();
    const encodedMessage = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Redirect to Semi-Automated WhatsApp Dispatcher with prefilled quote
  const handleRedirectToDispatcher = () => {
    const textMessage = generateQuoteText();
    sessionStorage.setItem('pigmobi_quote_text', textMessage);
    window.location.href = '/whatsapp';
  };

  // Dynamic background colors according to the selected plan
  const bgClassAndTone = useMemo(() => {
    switch (selectedPlanId) {
      case 'smart': return 'bg-[#F2F4F7]'; // Elegant light cool gray
      case 'prime': return 'bg-[#FAF9F5]'; // Sophisticated warm linen parchment
      case 'infinity': return 'bg-[#EAECEF]'; // Modern technical solid gray
    }
  }, [selectedPlanId]);

  return (
    <main className={`relative min-h-screen ${bgClassAndTone} pt-1 pb-20 lg:pb-4 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto overflow-hidden transition-colors duration-500`}>
      {/* Visual Ambient Elements & Grid Noise */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl -z-10 animate-pulse duration-[10000ms]" />
      <div className="noise-overlay" />

      {/* Brand Header + Nav Tabs — UNIFIED slim topbar */}
      <header className="mb-2 flex items-center justify-between py-1.5 border-b border-slate-200/70">
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex items-center gap-2"
          id="brand-header-icon"
        >
          <Image src="/logo-pigmobi.webp" alt="PIGMOBI" width={120} height={36} className="h-7 w-auto object-contain shrink-0" priority />
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Nav Tabs inline */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-0.5 border border-slate-200">
            <button
              onClick={() => setActiveTab('simulador')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeTab === 'simulador'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>Simulador</span>
            </button>
            <button
              onClick={() => setActiveTab('comparativo')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                activeTab === 'comparativo'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Comparativo</span>
            </button>
          </div>

          <Link
            href="/whatsapp"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer text-center"
          >
            <Share2 className="w-3 h-3 text-white" />
            <span className="hidden sm:inline">Disparador WhatsApp</span>
            <span className="sm:hidden">Disparador</span>
          </Link>
        </div>
      </header>

      {/* CONDITIONAL RENDERING OF TABS */}
      {activeTab === 'simulador' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* STEP 1: Select Plan Cards */}
          <section aria-labelledby="plans-title" className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">1</span>
                <h2 id="plans-title" className="text-sm font-bold text-slate-900">Selecione o Plano Base</h2>
              </div>
              <span className="text-[10px] text-slate-500 italic hidden sm:block">Cada plano libera adicionais específicos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    whileHover={prefersReducedMotion ? {} : { y: -2 }}
                    onClick={() => changePlan(plan.id)}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-row items-center justify-between text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center w-full">
                          <h3 className="font-extrabold text-sm text-slate-900">
                            {plan.name}
                          </h3>
                          <span className="text-xs font-black text-emerald-700">
                            {formatCurrency(plan.monthlyPrice)}<span className="text-[9px] font-normal text-slate-500">/mês</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Setup: {formatCurrency(plan.setupPrice)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* SPLIT SECTION FOR CALCULATOR AND BASKET */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT SIDE: CUSTOM INTEGRATIONS & ADDITIONS */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* STEP 2: DYNAMIC ADICIONAIS & ACESSOS INNER SECTION */}
              <section aria-labelledby="add-items-title" className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-mono">2</span>
                    <h2 id="add-items-title" className="text-base font-bold text-slate-900">
                      Adicionais do Plano
                    </h2>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col divide-y divide-slate-100">
                    
                    {/* Acessos card styled EXACTLY like the others but compact */}
                    <div className={`p-2 flex items-center justify-between transition-colors ${additionalAcessos > 0 ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-3 w-1/2">
                         <div className="shrink-0 flex items-center">
                          <button
                            type="button"
                            role="switch"
                            onClick={(e) => {
                              e.stopPropagation();
                              const limit = selectedPlan.accessControl.maxAdditional;
                              if (selectedPlanId !== 'infinity' && limit === 0) {
                                setCopyFeedback("Acessos adicionais não são permitidos neste plano.");
                                setTimeout(() => setCopyFeedback(null), 3000);
                                return;
                              }
                              setAdditionalAcessos(prev => prev === 0 ? 1 : 0);
                            }}
                            className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              additionalAcessos > 0 ? 'bg-emerald-600' : 'bg-slate-200'
                            }`}
                          >
                            <span aria-hidden="true" className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${additionalAcessos > 0 ? 'translate-x-3' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Acessos Adicionais</span>
                           <span className="text-[9px] text-slate-500 line-clamp-1">{selectedPlan.accessControl.included} incluso(s). {selectedPlanId !== 'infinity' && `Máx extra: ${selectedPlan.accessControl.maxAdditional}`}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 w-1/2">
                         {/* Interactive Counter */}
                        <div className="flex items-center gap-1 bg-white rounded border border-slate-200 overflow-hidden h-6">
                          <button type="button" onClick={() => setAdditionalAcessos(prev => Math.max(0, prev - 1))} className="px-1.5 bg-slate-50 text-slate-600 h-full w-5 flex items-center justify-center font-bold text-xs"><Minus className="w-2.5 h-2.5" /></button>
                          <span className="w-5 text-center text-[10px] font-extrabold font-mono text-slate-800">{additionalAcessos}</span>
                          <button type="button" onClick={() => {
                            const limit = selectedPlan.accessControl.maxAdditional;
                            if (limit === -1 || additionalAcessos < limit) setAdditionalAcessos(prev => prev + 1);
                          }} className="px-1.5 bg-slate-50 text-slate-600 h-full w-5 flex items-center justify-center font-bold text-xs"><Plus className="w-2.5 h-2.5" /></button>
                        </div>
                        <div className="w-20 text-right">
                          <span className="block text-[11px] font-mono font-extrabold text-slate-800">{formatCurrency(selectedPlan.accessControl.additionalPrice)}<span className="text-[9px] font-normal text-slate-500">/un</span></span>
                        </div>
                      </div>
                    </div>

                    {visibleAdditionals.map((item) => {
                      const allowedPrice = selectedPlan.allowedAdditionals[item.id];
                      const isAllowed = allowedPrice !== undefined;
                      const state = additionalsState[item.id] || { selected: false, quantity: 1 };
                      const isSelected = state.selected && isAllowed;

                      return (
                        <div key={item.id} onClick={() => isAllowed && toggleAdditional(item.id)} className={`p-2 flex items-center justify-between transition-colors ${!isAllowed ? 'bg-slate-50/50 opacity-60' : isSelected ? 'bg-emerald-50/40 cursor-pointer' : 'hover:bg-slate-50 cursor-pointer'}`}>
                           <div className="flex items-center gap-3 w-1/2">
                              <div className="shrink-0 flex items-center">
                                {isAllowed ? (
                                  <button
                                    type="button"
                                    role="switch"
                                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSelected ? 'bg-emerald-600' : 'bg-slate-200'}`}
                                  >
                                    <span aria-hidden="true" className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${isSelected ? 'translate-x-3' : 'translate-x-0'}`} />
                                  </button>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-amber-500 ml-1.5 mr-1" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                 <span className={`font-bold text-xs flex items-center gap-1.5 ${!isAllowed ? 'text-slate-500 line-through' : 'text-slate-900'}`}><IconMapper name={item.iconName} className="w-3.5 h-3.5 text-slate-400" /> {item.name}</span>
                                 <span className="text-[9px] text-slate-500 line-clamp-1">{!isAllowed ? `Requer outro plano` : item.description}</span>
                              </div>
                           </div>

                           <div className="flex items-center justify-end gap-3 w-1/2">
                             {item.hasQuantity && isSelected && isAllowed && (
                               <div className="flex items-center gap-1 bg-white rounded border border-slate-200 overflow-hidden h-6" onClick={e => e.stopPropagation()}>
                                 <button type="button" onClick={() => updateQuantity(item.id, -1)} className="px-1.5 bg-slate-50 text-slate-600 h-full w-5 flex items-center justify-center font-bold text-xs"><Minus className="w-2.5 h-2.5" /></button>
                                 <input type="text" value={state.quantity} onChange={(e) => handleQuantityInput(item.id, e.target.value)} onBlur={() => handleQuantityBlur(item.id)} onKeyDown={handleQuantityKeyDown} className="w-6 text-center font-extrabold text-[10px] text-slate-800 bg-white border-none outline-none focus:ring-0 p-0 font-mono" />
                                 <button type="button" onClick={() => updateQuantity(item.id, 1)} className="px-1.5 bg-slate-50 text-slate-600 h-full w-5 flex items-center justify-center font-bold text-xs"><Plus className="w-2.5 h-2.5" /></button>
                               </div>
                             )}
                             <div className="w-20 text-right">
                               {isAllowed ? (
                                  <span className="block text-[11px] font-mono font-extrabold text-slate-800">{formatCurrency(allowedPrice)}{item.hasQuantity && <span className="text-[9px] font-normal text-slate-500">/un</span>}</span>
                               ) : (
                                  <span className="text-[9px] font-bold text-amber-600">Bloqueado</span>
                               )}
                             </div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* STEP 3: OBSERVACÕES DO ORÇAMENTO (ACCORDION) */}
              <section aria-labelledby="obs-title" className="space-y-2 print:hidden">
                <div 
                  className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setIsObsOpen(!isObsOpen)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-mono">3</span>
                    <h2 id="obs-title" className="text-sm font-bold text-slate-900">
                      Observações Adicionais (Opcional)
                    </h2>
                  </div>
                  {isObsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>

                <AnimatePresence>
                  {isObsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 mt-2">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                           <span className="text-[10px] text-slate-500">Anotações serão impressas no PDF.</span>
                           <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                             <button type="button" onClick={() => setObsTab('edit')} className={`px-2 py-1 rounded-md transition-all ${obsTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Editar</button>
                             <button type="button" onClick={() => setObsTab('preview')} className={`px-2 py-1 rounded-md transition-all ${obsTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Ver</button>
                           </div>
                        </div>
                        {obsTab === 'edit' ? (
                          <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full h-32 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-700 resize-none"
                          />
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[8rem] max-h-40 overflow-y-auto text-left">
                            <MarkdownRender content={observations} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* RIGHT SIDE: INTEGRATED VISUAL BASKET / QUOTE BUILDER */}
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-mono">4</span>
                <h2 className="text-lg font-bold text-slate-900">Resultado do Orçamento</h2>
              </div>

              <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden text-left flex flex-col justify-between">
                
                {/* Header widget */}
                <div className="bg-slate-900 p-4 text-white text-left relative">
                  <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    <DollarSign className="w-16 h-16 text-white" />
                  </div>
                  <span className="text-[9px] bg-emerald-600 text-white font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full block w-fit mb-2">
                    SIMULADOR DE CONTRATO
                  </span>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Plano Selecionado:</p>
                  <p className="text-lg font-black tracking-tight flex items-center gap-2">
                    <span>Plano {selectedPlan.name}</span>
                    <span className="text-xs font-semibold opacity-85">({formatCurrency(selectedPlan.monthlyPrice)}/mês)</span>
                  </p>
                </div>

                {/* Body metrics list */}
                <div className="p-4 space-y-3">
                  <div className="space-y-1.5 pb-3 border-b border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mensalidade Base ({selectedPlan.name}):</span>
                      <strong className="font-mono text-slate-900 text-sm">{formatCurrency(selectedPlan.monthlyPrice)}/mês</strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">Acessos no Sistema:</span>
                      <strong className="text-slate-900 font-bold">
                        {selectedPlan.accessControl.included} {additionalAcessos > 0 ? `+ ${additionalAcessos} adicional(is)` : ''} (Total: {selectedPlan.accessControl.included + additionalAcessos})
                      </strong>
                    </div>

                    {additionalAcessos > 0 && (
                      <div className="flex justify-between items-center text-emerald-700">
                        <span className="font-medium">Acessos adicionais ({additionalAcessos}x):</span>
                        <strong className="font-mono text-sm">+{formatCurrency(calculatedValues.costAcessosAdicionais)}/mês</strong>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="font-medium">Adicionais Extras selecionados:</span>
                      <strong className="font-mono text-sm">+{formatCurrency(calculatedValues.additionalsTotal - calculatedValues.costAcessosAdicionais)}/mês</strong>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200">
                      <span className="font-bold text-slate-800">Implantação Única (Setup):</span>
                      <strong className="font-mono text-slate-950 text-sm font-black">{formatCurrency(calculatedValues.setupTotal)}</strong>
                    </div>
                  </div>

                  {/* List of active additions toggled */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 font-mono tracking-wider block mb-1.5 uppercase">
                      Itens Incluídos ({calculatedValues.selectedList.length}):
                    </span>

                    {calculatedValues.selectedList.length > 0 ? (
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {calculatedValues.selectedList.map(({ item, qty, unitPrice, subtotal }) => (
                          <div key={item.id} className="text-[11px] font-semibold text-slate-700 flex flex-col gap-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-center w-full">
                              <span className="truncate max-w-[190px] font-bold text-slate-900 flex items-center gap-1">
                                <span className="text-emerald-600">•</span> {item.name}
                              </span>
                              <strong className="font-mono text-slate-950 font-black">
                                {formatCurrency(subtotal)}/mês
                              </strong>
                            </div>
                            {item.hasQuantity && (
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pl-3">
                                <span>Multiplicador Qtd: <strong className="text-slate-800">{qty}x</strong></span>
                                <span>Valor unitário: R$ {unitPrice.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <span className="text-xs text-slate-400 font-medium italic block">
                          Nenhum opcional selecionado além do plano base.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Pricing Totals (Large cards) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4.5 space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-500 font-black font-mono tracking-wider uppercase block">MENSALIDADE SUB-TOTAL</span>
                        <span className="text-[9px] text-slate-400 block italic leading-tight">(Plano + Adicionais com recorrência)</span>
                      </div>
                      <span className="text-2xl font-black font-mono text-emerald-700 leading-none">
                        {formatCurrency(calculatedValues.totalMonthly)}
                        <span className="text-xs font-normal text-slate-500">/mês</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 font-black font-mono tracking-wider uppercase block">INVESTIMENTO IMPLANTAÇÃO</span>
                        <span className="text-[9px] text-slate-400 block italic leading-tight">(Pago uma única vez no onboarding)</span>
                      </div>
                      <span className="text-2xl font-black font-mono text-slate-900 leading-none">
                        {formatCurrency(calculatedValues.setupTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Operational Export CTA button row */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="col-span-2 w-full py-3.5 px-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg font-sans cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      <span>Copiar Proposta</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRedirectToDispatcher}
                      className="col-span-2 w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 font-sans cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Enviar no WhatsApp (Disparador)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {activeTab === 'comparativo' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* COMPARATIVE GRID TABLE DESIGN COMPONENT */}
          <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4" aria-labelledby="comparison-title">

            {/* DESKTOP TABLE (md+) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-900 font-bold text-xs bg-slate-50">
                    <th className="py-4 px-4 w-[240px] text-slate-500 font-mono text-[10px] uppercase tracking-wider">RECURSO / PARÂMETRO</th>
                    <th className="py-4 px-4 bg-slate-100/40 text-slate-800 font-bold text-center border-r border-slate-100 w-[180px]">PLANO SMART</th>
                    <th className="py-4 px-4 bg-emerald-50/55 text-emerald-900 font-black text-center border-x-2 border-emerald-100/80 w-[200px]">PLANO PRIME</th>
                    <th className="py-4 px-4 bg-zinc-100/70 text-zinc-900 font-black text-center border-l border-zinc-200 w-[180px]">PLANO INFINITY</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Mensalidade</td>
                    <td className="py-3.5 px-4 bg-slate-100/20 text-slate-800 font-extrabold text-center border-r border-slate-100">R$ 119,90/mês</td>
                    <td className="py-3.5 px-4 bg-emerald-50/25 text-emerald-950 font-black text-center border-x-2 border-emerald-100/60 text-sm">R$ 199,90/mês</td>
                    <td className="py-3.5 px-4 bg-zinc-50/30 text-zinc-950 font-extrabold text-center border-l border-zinc-200">R$ 269,90/mês</td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Implantação (Setup)</td>
                    <td className="py-3.5 px-4 bg-slate-100/20 text-slate-700 font-medium text-center border-r border-slate-100">R$ 399,90</td>
                    <td className="py-3.5 px-4 bg-emerald-50/25 text-emerald-900 font-semibold text-center border-x-2 border-emerald-100/60">R$ 799,90</td>
                    <td className="py-3.5 px-4 bg-zinc-50/30 text-zinc-900 font-semibold text-center border-l border-zinc-200">R$ 799,90</td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Dispositivos inclusos</td>
                    <td className="py-3.5 px-4 bg-slate-100/20 text-slate-800 font-bold text-center border-r border-slate-100">1 acesso</td>
                    <td className="py-3.5 px-4 bg-emerald-50/25 text-emerald-950 font-extrabold text-center border-x-2 border-emerald-100/60">3 acessos</td>
                    <td className="py-3.5 px-4 bg-zinc-50/30 text-zinc-950 font-bold text-center border-l border-zinc-200">5 acessos</td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">Acessos Adicionais</td>
                    <td className="py-3.5 px-4 bg-slate-100/20 text-slate-600 text-center border-r border-slate-100">Até 2 (R$ 39,90/cad)</td>
                    <td className="py-3.5 px-4 bg-emerald-50/25 text-emerald-900 text-center border-x-2 border-emerald-100/60">Até 2 (R$ 29,90/cad)</td>
                    <td className="py-3.5 px-4 bg-zinc-50/30 text-zinc-900 text-center border-l border-zinc-200">Ilimitados (R$ 19,90/cad)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4 font-black text-slate-900 uppercase tracking-wider text-[10px]">Recursos Inclusos</td>
                    <td className="py-4 px-3 bg-slate-100/20 leading-relaxed text-slate-500 text-center border-r border-slate-100">
                      Cardápio Digital · Auto-pedido · Garçom App · Pagamento Online · PDV Integrado · Impressão automática · Delivery Próprio · QR Mesa · QR Comanda
                    </td>
                    <td className="py-4 px-3 bg-emerald-50/25 leading-relaxed text-slate-700 font-semibold text-center border-x-2 border-emerald-100/60">
                      Tudo do Smart + Caixa Inteligente · Relatórios Gerenciais · Sincronização de Balanças · Ficha técnica (Manual)
                    </td>
                    <td className="py-4 px-3 bg-zinc-50/30 leading-relaxed text-zinc-800 text-center border-l border-zinc-200">
                      Tudo do Prime + Ficha técnica automatizada · DRE · Fluxo de Caixa completo · NF Devolução fiscal
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2"><QrCode className="w-4 h-4 text-emerald-600 shrink-0" /><div><div className="font-bold">QR code de mesa</div><div className="text-[10px] text-slate-500">Cliente faz autoatendimento</div></div></div>
                    </td>
                    <td className="py-3 px-4 bg-slate-100/20 text-center border-r border-slate-100"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                    <td className="py-3 px-4 bg-emerald-50/25 text-center border-x-2 border-emerald-100/60"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                    <td className="py-3 px-4 bg-zinc-50/30 text-center border-l border-zinc-200"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2"><Tablet className="w-4 h-4 text-emerald-600 shrink-0" /><div><div className="font-bold">QR code comanda física</div><div className="text-[10px] text-slate-500">Garçom abre comanda e cliente lança pedidos</div></div></div>
                    </td>
                    <td className="py-3 px-4 bg-slate-100/20 text-center border-r border-slate-100"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                    <td className="py-3 px-4 bg-emerald-50/25 text-center border-x-2 border-emerald-100/60"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                    <td className="py-3 px-4 bg-zinc-50/30 text-center border-l border-zinc-200"><span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-black"><Check className="w-3.5 h-3.5" /> Incluso</span></td>
                  </tr>
                  {ALL_ADDITIONAL_ITEMS.map((item) => {
                    const priceSmart = PLANOS_JSON.smart.allowedAdditionals[item.id];
                    const pricePrime = PLANOS_JSON.prime.allowedAdditionals[item.id];
                    const priceInfinity = PLANOS_JSON.infinity.allowedAdditionals[item.id];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2"><IconMapper name={item.iconName} className="w-4 h-4 text-emerald-600 shrink-0" /><span>{item.name}</span></div>
                        </td>
                        <td className="py-3 px-4 bg-slate-100/20 text-center border-r border-slate-100">
                          {priceSmart !== undefined ? <span className="text-slate-900 font-black">{formatCurrency(priceSmart)}</span> : <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-black">🔒 Bloqueado</span>}
                        </td>
                        <td className="py-3 px-4 bg-emerald-50/25 text-center border-x-2 border-emerald-100/60">
                          {pricePrime !== undefined ? <span className="text-emerald-950 font-black">{formatCurrency(pricePrime)}</span> : <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-black">🔒 Bloqueado</span>}
                        </td>
                        <td className="py-3 px-4 bg-zinc-50/30 text-center border-l border-zinc-200">
                          {priceInfinity !== undefined ? <span className="text-zinc-950 font-black">{formatCurrency(priceInfinity)}</span> : <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-black">🔒 Bloqueado</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (< md) */}
            <div className="md:hidden space-y-2">
              {/* Sticky plan column headers */}
              <div className="grid grid-cols-3 gap-1.5 sticky top-0 z-10 bg-white pb-1 pt-0.5">
                <div className="bg-slate-100 rounded-xl p-2 text-center border border-slate-200">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">Smart</span>
                  <span className="text-[9px] font-bold text-slate-500">R$ 119,90</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-200">
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Prime ⭐</span>
                  <span className="text-[9px] font-bold text-emerald-600">R$ 199,90</span>
                </div>
                <div className="bg-zinc-100 rounded-xl p-2 text-center border border-zinc-200">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-wider block">Infinity</span>
                  <span className="text-[9px] font-bold text-zinc-500">R$ 269,90</span>
                </div>
              </div>

              {/* Static rows */}
              {[
                { label: 'Implantação (Setup)', sub: 'Pago uma única vez', smart: 'R$ 399,90', prime: 'R$ 799,90', infinity: 'R$ 799,90' },
                { label: 'Dispositivos Inclusos', sub: null, smart: '1 acesso', prime: '3 acessos', infinity: '5 acessos' },
                { label: 'Acessos Adicionais', sub: null, smart: 'Até 2\n(R$ 39,90/un)', prime: 'Até 2\n(R$ 29,90/un)', infinity: 'Ilimitados\n(R$ 19,90/un)' },
              ].map((row) => (
                <div key={row.label} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                    <span className="text-[11px] font-bold text-slate-800">{row.label}</span>
                    {row.sub && <span className="text-[9px] text-slate-500 ml-1">— {row.sub}</span>}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    <div className="p-2 text-center"><span className="text-[11px] font-bold text-slate-800 whitespace-pre-line leading-tight">{row.smart}</span></div>
                    <div className="p-2 text-center bg-emerald-50/20"><span className="text-[11px] font-bold text-emerald-800 whitespace-pre-line leading-tight">{row.prime}</span></div>
                    <div className="p-2 text-center"><span className="text-[11px] font-bold text-zinc-800 whitespace-pre-line leading-tight">{row.infinity}</span></div>
                  </div>
                </div>
              ))}

              {/* Recursos inclusos */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-800">Recursos Inclusos</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  <div className="p-2 text-[9px] text-slate-600 leading-relaxed">Cardápio · Auto-pedido · Garçom App · PDV · Pagamento Online · Delivery · QR Mesa · QR Comanda</div>
                  <div className="p-2 text-[9px] text-emerald-900 leading-relaxed font-medium bg-emerald-50/20">Smart + Caixa Inteligente · Relatórios · Balanças · Ficha Téc. Manual</div>
                  <div className="p-2 text-[9px] text-zinc-800 leading-relaxed">Prime + Ficha Téc. Auto · DRE · Fluxo de Caixa · NF Devolução</div>
                </div>
              </div>

              {/* QR Mesa & Comanda */}
              {[
                { id: 'qr-mesa', label: 'QR code de mesa', sub: 'Autoatendimento', icon: <QrCode className="w-3 h-3 text-emerald-600" /> },
                { id: 'qr-comanda', label: 'QR code comanda', sub: 'Garçom + cliente', icon: <Tablet className="w-3 h-3 text-emerald-600" /> },
              ].map((row) => (
                <div key={row.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5">
                    {row.icon}<div><span className="text-[11px] font-bold text-slate-800">{row.label}</span><span className="text-[9px] text-slate-500 ml-1">— {row.sub}</span></div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-100">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`p-2 text-center ${i === 1 ? 'bg-emerald-50/20' : ''}`}>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full font-black">
                          <Check className="w-2 h-2" /> Incluso
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Dynamic additional items */}
              {ALL_ADDITIONAL_ITEMS.map((item) => {
                const priceSmart = PLANOS_JSON.smart.allowedAdditionals[item.id];
                const pricePrime = PLANOS_JSON.prime.allowedAdditionals[item.id];
                const priceInfinity = PLANOS_JSON.infinity.allowedAdditionals[item.id];
                return (
                  <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center gap-1.5">
                      <IconMapper name={item.iconName} className="w-3 h-3 text-emerald-600" />
                      <span className="text-[11px] font-bold text-slate-800">{item.name}</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                      {[priceSmart, pricePrime, priceInfinity].map((price, i) => (
                        <div key={i} className={`p-2 text-center ${i === 1 ? 'bg-emerald-50/20' : ''}`}>
                          {price !== undefined ? (
                            <span className={`text-[11px] font-black ${i === 0 ? 'text-slate-900' : i === 1 ? 'text-emerald-900' : 'text-zinc-900'}`}>{formatCurrency(price)}</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold">🔒</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </section>
        </motion.div>
      )}








      {/* Dynamic Copy Alert Notification feedback toasting */}
      <AnimatePresence>
        {copyFeedback && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold font-sans tracking-wide flex items-center gap-2 shadow-xl border border-slate-800"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{copyFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIXEL-PERFECT A4 PRINTABLE PROPOSAL SECTION (EXCLUSIVE TO PRINTING) */}
      <div className="hidden print:block text-slate-950 bg-white p-2 w-full text-left font-sans" id="printable-proposta">
        
        {/* Document Header */}
        <div className="border-b-4 border-slate-900 pb-5 mb-6 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Image src="/logo-pigmobi.webp" alt="PIGMOBI" width={160} height={48} className="h-10 w-auto object-contain" />
              <span className="font-mono font-black text-xs uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded text-emerald-800 border border-emerald-100">SIMULADOR DE INVESTIMENTO</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">PROPOSTA COMERCIAL</h1>
            <p className="text-xs text-slate-500 font-medium">Sistema de Gestão Comercial e Operação para Chopp & Autoatendimento</p>
          </div>
          <div className="text-right text-xs space-y-1 font-mono text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div><strong className="text-slate-900">Emissão:</strong> {todayStr}</div>
            <div><strong className="text-slate-900">Ref:</strong> PROP-{yearStr}-CHOPP</div>
            <div><strong className="text-slate-900">Validade:</strong> {expirationDate} (10 dias)</div>
          </div>
        </div>

        {/* Client Metadata Info Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 border border-slate-200 rounded-3xl mb-6 text-xs">
          <div>
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">PREPARADO PARA:</span>
            <strong className="text-sm font-bold text-slate-900">Cliente Especial / Estabelecimento Comercial</strong>
            <p className="text-slate-500 mt-1">Estimativa de custos customizada criada pelo formulário interativo de simulação de plano.</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 font-mono block uppercase">CONTATO E SUPORTE:</span>
            <strong className="text-sm font-bold text-emerald-805">Suporte Comercial por Rico Pompeo</strong>
            <p className="text-slate-500 mt-1">Canal de Whatsapp: (81) 9.9404-5175 | Recife - Pernambuco</p>
          </div>
        </div>

        {/* Plan Section Area */}
        <div className="space-y-3 mb-6 print-avoid-break">
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center">
            <h2 className="font-black text-sm uppercase tracking-wider">1. Plano Principal Selecionado: {selectedPlan.name.toUpperCase()}</h2>
            <span className="text-xs text-emerald-400 font-mono font-bold">Base Contratual Inclusa</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3 text-left">Especificação do Plano Base</th>
                  <th className="p-3 text-center w-[160px]">Taxa Setup (Única)</th>
                  <th className="p-3 text-right w-[160px]">Mensalidade Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="p-3">
                    <strong className="font-bold text-slate-900">{selectedPlan.name} Tier</strong>
                    <p className="text-[10px] text-slate-500 mt-0.5">{selectedPlan.description}</p>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">{formatCurrency(selectedPlan.setupPrice)}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-800">{formatCurrency(selectedPlan.monthlyPrice)}/mês</td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="p-3 text-xs text-slate-700" colSpan={3}>
                    <div className="flex justify-between items-center">
                      <span><strong>Acessos Liberados no Sistema:</strong> {selectedPlan.accessControl.included} incluso(s) {additionalAcessos > 0 ? `com mais ${additionalAcessos} adicional(is)` : ''}</span>
                      <strong className="font-mono text-slate-900">Total: {selectedPlan.accessControl.included + additionalAcessos} acesso(s)</strong>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resources checklist in print document */}
          <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
            <span className="text-[9px] font-black text-slate-400 font-mono block mb-2 uppercase">RECURSOS E DIRETRIZES DESTAQUE DO PLANO BASE:</span>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-slate-700">
              {selectedPlan.recursosInclusos.map((rec, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <span className="text-emerald-600 font-bold shrink-0 mt-0.5">✔</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additionals Section Area */}
        <div className="space-y-3 mb-6 print-avoid-break">
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex justify-between items-center">
            <h2 className="font-black text-sm uppercase tracking-wider">2. Serviços Extra e Opcionais Adicionados</h2>
            <span className="text-xs text-emerald-400 font-mono font-bold">Subtotais Recorrentes</span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {calculatedValues.selectedList.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 text-left">Descrição do Item Opcional</th>
                    <th className="p-3 text-center w-[120px]">Quantidade</th>
                    <th className="p-3 text-center w-[140px]">Valor Unitário</th>
                    <th className="p-3 text-right w-[140px]">Subtotal Mensal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {calculatedValues.selectedList.map(({ item, qty, unitPrice, subtotal }) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <strong className="font-bold text-slate-950">{item.name}</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900">{qty}x</td>
                      <td className="p-3 text-center font-mono">{formatCurrency(unitPrice)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">+{formatCurrency(subtotal)}/mês</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                Nenhum adicional extra ou opcional selecionado nesta proposta.
              </div>
            )}
          </div>
        </div>

        {/* Observations Section Area with avoid-page-break */}
        <div className="space-y-3 mb-6 print-avoid-break">
          <div className="bg-slate-900 text-white p-3.5 rounded-xl">
            <h2 className="font-black text-sm uppercase tracking-wider">3. Observações Especiais e Termos Financeiros</h2>
          </div>
          <div className="border border-slate-200 bg-slate-50/20 p-5 rounded-2xl text-[11px] leading-relaxed text-slate-800">
            <MarkdownRender content={observations} />
          </div>
        </div>

        {/* Final Financial Breakdown Summary Box */}
        <div className="border-2 border-slate-950 rounded-3xl p-5 mb-8 print-avoid-break grid grid-cols-2 gap-4 text-left">
          <div className="border-r border-slate-200 pr-4 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black font-mono text-slate-400 block uppercase tracking-wider">TAXA IMPLANTAÇÃO ÚNICA (SETUP)</span>
              <p className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">Valor a ser pago no onboarding/assinatura e cobrado apenas uma única vez na instalação inicial.</p>
            </div>
            <strong className="text-2xl font-black font-mono text-slate-900 mt-3 block">
              {formatCurrency(calculatedValues.setupTotal)}
            </strong>
          </div>
          <div className="pl-4 flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-black font-mono text-emerald-700 block uppercase tracking-wider">MENSALIDADE RECORRENTE TOTAL</span>
              <p className="text-[10px] text-slate-500 italic mt-0.5 leading-tight">Inclui licenciamento de uso do Plano {selectedPlan.name} base, acessos configurados e todos os opcionais ativos.</p>
            </div>
            <strong className="text-2xl font-black font-mono text-emerald-800 mt-3 block">
              {formatCurrency(calculatedValues.totalMonthly)}<span className="text-xs font-normal text-slate-400">/mês</span>
            </strong>
          </div>
        </div>

        {/* Printable Footer / Terms disclaimers */}
        <div className="border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400 space-y-1.5 font-sans">
          <p className="font-medium text-slate-500">
            * Cotação gerada de forma automatizada pelo simulador interativo de contratação na data informada.
          </p>
          <p>
            Esta proposta não cria um vínculo contratual definitivo e está sujeita a reavaliação cadastral técnica.
          </p>
          <p className="font-mono font-bold uppercase text-[9px] tracking-wider text-slate-500">
            Empresa Licenciadora S.A. | Todos os Direitos Reservados — Suporte Técnico pelo WhatsApp Comercial
          </p>
        </div>

      </div>

      {/* ===== MOBILE STICKY BOTTOM BAR (hidden on lg+, always visible on mobile) ===== */}
      {activeTab === 'simulador' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl px-4 py-2.5 print:hidden">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            {/* Left: plan + total */}
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Plano {selectedPlan.name}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black font-mono text-emerald-700 leading-none">{formatCurrency(calculatedValues.totalMonthly)}</span>
                <span className="text-[9px] text-slate-400">/mês</span>
              </div>
              <span className="text-[9px] text-slate-500">Setup: {formatCurrency(calculatedValues.setupTotal)} | {selectedPlan.accessControl.included + additionalAcessos} acesso(s)</span>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copyToClipboard}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow-md"
              >
                <Copy className="w-3 h-3 text-emerald-400" />
                <span>Copiar</span>
              </button>
              <button
                type="button"
                onClick={handleRedirectToDispatcher}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
