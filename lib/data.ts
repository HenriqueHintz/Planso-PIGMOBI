export interface AdditionalItemDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  hasQuantity: boolean;
}

export interface PlanAccess {
  included: number;
  maxAdditional: number; // e.g., 2, or -1 for unlimited
  additionalPrice: number;
}

export interface PlanDefinition {
  id: 'smart' | 'prime' | 'infinity';
  name: string;
  monthlyPrice: number;
  setupPrice: number;
  description: string;
  tagline: string;
  segments: string[];
  recursosInclusos: string[];
  accessControl: PlanAccess;
  allowedAdditionals: {
    [itemId: string]: number; // itemId -> price
  };
  blockedAdditionals: string[]; // list of itemIds
  specificRules: string[];
}

// Master list of all additionals in the ecosystem
export const ALL_ADDITIONAL_ITEMS: AdditionalItemDefinition[] = [
  { id: 'nota_fiscal', name: 'Nota Fiscal', description: 'Emissão descomplicada de NFC-e e NF-e.', iconName: 'FileText', hasQuantity: false },
  { id: 'painel_atendimento', name: 'Painel de Atendimento', description: 'Senhas de chamada integradas na TV para clientes.', iconName: 'Tv', hasQuantity: true },
  { id: 'ifood', name: 'iFood', description: 'Integração direta e automática com iFood Delivery.', iconName: 'ShoppingBag', hasQuantity: false },
  { id: '99food', name: '99Food', description: 'Integração de pedidos unificados com plataforma 99Food.', iconName: 'Store', hasQuantity: false },
  { id: 'totem_pix', name: 'Totem PIX', description: 'Terminal de autoatendimento focado em PIX dinâmico.', iconName: 'QrCode', hasQuantity: true },
  { id: 'totem_pix_cartoes', name: 'Totem PIX + Cartão', description: 'Integração Tef completa para totem de autoatendimento.', iconName: 'CreditCard', hasQuantity: true },
  { id: 'fidelidade', name: 'Fidelidade', description: 'Programa de pontos com cashback e benefícios exclusivos.', iconName: 'Sparkles', hasQuantity: false },
  { id: 'kds', name: 'KDS', description: 'Kitchen Display System — telas de produção na cozinha.', iconName: 'Monitor', hasQuantity: true },
  { id: 'financeiro', name: 'Financeiro', description: 'Controles de DRE, fluxo de caixa e contas a pagar/receber.', iconName: 'DollarSign', hasQuantity: false },
  { id: 'crm', name: 'CRM', description: 'Disparo de WhatsApp marketing e filtros pós-vendas.', iconName: 'Users', hasQuantity: false },
  { id: 'cmv', name: 'CMV', description: 'CMV dinâmico e rastreio de lucratividade real.', iconName: 'PieChart', hasQuantity: false }
];

export const PLANOS_JSON: { [key in 'smart' | 'prime' | 'infinity']: PlanDefinition } = {
  smart: {
    id: 'smart',
    name: 'Smart',
    monthlyPrice: 119.90,
    setupPrice: 399.90,
    description: 'Inteligência e automação para crescer.',
    tagline: 'Ideal para lanchonetes, food trucks e operações menores.',
    segments: ['Food Truck', 'Lanchonetes', 'Operações menores'],
    recursosInclusos: [
      'Cardápio Digital',
      'Pedido pelo Cliente',
      'App para Garçom',
      'Pagamento Online',
      'Frente de Caixa (PDV)',
      'Impressão Automática de Pedido',
      'Relatórios Operacionais',
      'Delivery Próprio com Televendas',
      'QR code de mesa (cliente faz autoatendimento)',
      'QR code comanda física (Garçom abre comanda e entrega para o cliente lançar pedidos)'
    ],
    accessControl: {
      included: 1,
      maxAdditional: 2,
      additionalPrice: 39.90
    },
    allowedAdditionals: {
      nota_fiscal: 119.90,
      painel_atendimento: 49.90,
      ifood: 49.90,
      '99food': 49.90
    },
    blockedAdditionals: [
      'totem_pix',
      'totem_pix_cartoes',
      'fidelidade',
      'kds',
      'financeiro',
      'crm',
      'cmv'
    ],
    specificRules: [
      'Limite máximo de até 2 acessos adicionais (R$ 39,90 cada).',
      'Adicionais mais complexos (KDS, Totens, Financeiro) são bloqueados.',
      'Sistemas de autoatendimento e produção avançados não estão disponíveis.'
    ]
  },
  prime: {
    id: 'prime',
    name: 'Prime',
    monthlyPrice: 199.90,
    setupPrice: 799.90,
    description: 'Operação profissional completa.',
    tagline: 'Ideal para lanchonetes de fluxo alto, fast foods e restaurantes.',
    segments: ['Fast Food', 'Restaurantes menores', 'Bares menores'],
    recursosInclusos: [
      'Cardápio Digital',
      'Pedido pelo Cliente',
      'App para Garçom',
      'Pagamento Online',
      'Frente de Caixa (PDV)',
      'Impressão Automática de Pedido',
      'Relatórios Operacionais',
      'Delivery Próprio com Televendas',
      'Caixa Inteligente',
      'Relatórios Gerenciais',
      'Integração com Balança',
      'Ficha Técnica (estoque manual)',
      'QR code de mesa (cliente faz autoatendimento)',
      'QR code comanda física (Garçom abre comanda e entrega para o cliente lançar pedidos)'
    ],
    accessControl: {
      included: 3,
      maxAdditional: 2,
      additionalPrice: 29.90
    },
    allowedAdditionals: {
      nota_fiscal: 109.90,
      painel_atendimento: 29.90,
      ifood: 39.90,
      '99food': 39.90,
      totem_pix: 120.00,
      totem_pix_cartoes: 270.00,
      fidelidade: 19.90,
      kds: 49.90,
      financeiro: 139.90
    },
    blockedAdditionals: [
      'crm',
      'cmv'
    ],
    specificRules: [
      'Limite de até 2 acessos adicionais (R$ 29,90 cada).',
      'Acesso liberado a recursos presenciais avançados (KDS, Totens, Fidelidade, Financeiro).',
      'CRM e CMV bloqueados neste plano.'
    ]
  },
  infinity: {
    id: 'infinity',
    name: 'Infinity',
    monthlyPrice: 269.90,
    setupPrice: 799.90,
    description: 'Sem limites para crescer.',
    tagline: 'A solução definitiva para marcas consolidadas e operações volumosas.',
    segments: ['Restaurantes', 'Bares', 'Sushi', 'Pizzarias', 'Operações de alto volume'],
    recursosInclusos: [
      'Cardápio Digital',
      'Pedido pelo Cliente',
      'App para Garçom',
      'Pagamento Online',
      'Frente de Caixa (PDV)',
      'Impressão Automática de Pedido',
      'Relatórios Operacionais',
      'Delivery Próprio com Televendas',
      'Caixa Inteligente',
      'Relatórios Gerenciais',
      'Integração com Balança',
      'Ficha Técnica Completa',
      'Gestão Financeira Avançada',
      'DRE',
      'Fluxo de Caixa',
      'Nota de Devolução',
      'QR code de mesa (cliente faz autoatendimento)',
      'QR code comanda física (Garçom abre comanda e entrega para o cliente lançar pedidos)'
    ],
    accessControl: {
      included: 5,
      maxAdditional: 999999, // Representing unlimited
      additionalPrice: 19.90
    },
    allowedAdditionals: {
      nota_fiscal: 99.90,
      painel_atendimento: 29.90,
      ifood: 29.90,
      '99food': 29.90,
      totem_pix: 100.00,
      totem_pix_cartoes: 250.00,
      fidelidade: 19.90,
      kds: 39.90,
      financeiro: 119.90,
      cmv: 39.90,
      crm: 49.90
    },
    blockedAdditionals: [],
    specificRules: [
      'Acessos adicionais ILIMITADOS pelo menor valor (R$ 19,90 cada).',
      'Sem bloqueios: CRM, CMV, KDS, Totens e Financeiro inclusos como adicionais de menor custo.'
    ]
  }
};

export const PLANS: PlanDefinition[] = [
  PLANOS_JSON.smart,
  PLANOS_JSON.prime,
  PLANOS_JSON.infinity
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
