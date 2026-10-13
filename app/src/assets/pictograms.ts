// Acervo curado de pictogramas escolares padronizados (estilo ARASAAC)
// Formato SVG vetorial embutido para independência total de internet (Offline-First)

export interface PictogramaInfo {
  key: string;
  nome: string;
  categoria: string;
  descricaoAcessivel: string;
  svg: string;
}

export const ACERVO_PICTOGRAMAS: Record<string, PictogramaInfo> = {
  acolhimento: {
    key: 'acolhimento',
    nome: 'Entrada e Acolhimento',
    categoria: 'Transição',
    descricaoAcessivel: 'Desenho de escola amigável com porta aberta e sol brilhando suavemente',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#E8F1F5" stroke="#3A6B7E" stroke-width="3"/>
      <path d="M25 45 L50 25 L75 45 L70 80 L30 80 Z" fill="#D9E6ED" stroke="#3A6B7E" stroke-width="3"/>
      <rect x="42" y="55" width="16" height="25" rx="3" fill="#3A6B7E"/>
      <circle cx="53" cy="68" r="2" fill="#FFFFFF"/>
      <polygon points="50,20 62,30 38,30" fill="#E5989B"/>
      <circle cx="50" cy="38" r="4" fill="#3A6B7E"/>
    </svg>`
  },
  roda_conversa: {
    key: 'roda_conversa',
    nome: 'Roda de Conversa',
    categoria: 'Interação',
    descricaoAcessivel: 'Três figuras simplificadas sentadas em círculo conversando amigavelmente',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#EBF5EE" stroke="#5C8374" stroke-width="3"/>
      <circle cx="35" cy="40" r="8" fill="#5C8374"/>
      <circle cx="65" cy="40" r="8" fill="#5C8374"/>
      <circle cx="50" cy="65" r="8" fill="#5C8374"/>
      <path d="M25 58 C25 50, 45 50, 45 58" stroke="#5C8374" stroke-width="3" stroke-linecap="round"/>
      <path d="M55 58 C55 50, 75 50, 75 58" stroke="#5C8374" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 78 C40 72, 60 72, 60 78" stroke="#5C8374" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="46" r="3" fill="#D4A373"/>
    </svg>`
  },
  lanche: {
    key: 'lanche',
    nome: 'Hora do Lanche',
    categoria: 'Alimentação',
    descricaoAcessivel: 'Maçã vermelha suave com uma folha verde e copo de água ao lado',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#FFF1E6" stroke="#D4A373" stroke-width="3"/>
      <path d="M30 45 C30 35, 45 35, 50 42 C55 35, 70 35, 70 45 C70 65, 50 75, 50 75 C50 75, 30 65, 30 45 Z" fill="#E5989B" stroke="#B5828C" stroke-width="3"/>
      <path d="M50 42 C50 30, 56 25, 58 24" stroke="#6B705C" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="62" cy="27" rx="5" ry="3" fill="#B7B7A4" transform="rotate(-20 62 27)"/>
      <rect x="68" y="50" width="14" height="22" rx="3" fill="#D9E6ED" stroke="#3A6B7E" stroke-width="2"/>
    </svg>`
  },
  atividade_mesa: {
    key: 'atividade_mesa',
    nome: 'Atividade no Caderno',
    categoria: 'Pedagógico',
    descricaoAcessivel: 'Caderno aberto com linhas pautadas e um lápis de ponta arredondada',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#F0EFEB" stroke="#6C757D" stroke-width="3"/>
      <rect x="25" y="30" width="42" height="46" rx="4" fill="#FFFFFF" stroke="#3A6B7E" stroke-width="3"/>
      <line x1="33" y1="42" x2="57" y2="42" stroke="#B7B7A4" stroke-width="2" stroke-linecap="round"/>
      <line x1="33" y1="52" x2="57" y2="52" stroke="#B7B7A4" stroke-width="2" stroke-linecap="round"/>
      <line x1="33" y1="62" x2="50" y2="62" stroke="#B7B7A4" stroke-width="2" stroke-linecap="round"/>
      <path d="M55 70 L72 35 L78 38 L61 73 Z" fill="#D4A373" stroke="#B5828C" stroke-width="2"/>
      <polygon points="55,70 52,77 58,74" fill="#3A6B7E"/>
    </svg>`
  },
  parque: {
    key: 'parque',
    nome: 'Parque e Recreio',
    categoria: 'Lazer',
    descricaoAcessivel: 'Escorregador infantil suave e uma flor amigável de primavera',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#E8F8F5" stroke="#52B788" stroke-width="3"/>
      <path d="M25 75 L45 35 L48 35 L48 75" stroke="#3A6B7E" stroke-width="3"/>
      <path d="M45 42 L75 75" stroke="#D4A373" stroke-width="5" stroke-linecap="round"/>
      <circle cx="76" cy="38" r="8" fill="#F4A261"/>
      <circle cx="76" cy="38" r="4" fill="#FFFFFF"/>
      <path d="M20 78 Q50 74 80 78" stroke="#52B788" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
  musica: {
    key: 'musica',
    nome: 'Momento da Música',
    categoria: 'Artes',
    descricaoAcessivel: 'Duas notas musicais harmônicas e um triângulo de percussão suave',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#F3E9D2" stroke="#C67D5A" stroke-width="3"/>
      <ellipse cx="38" cy="65" rx="7" ry="5" fill="#3A6B7E" transform="rotate(-15 38 65)"/>
      <ellipse cx="62" cy="58" rx="7" ry="5" fill="#3A6B7E" transform="rotate(-15 62 58)"/>
      <line x1="43" y1="62" x2="43" y2="35" stroke="#3A6B7E" stroke-width="3"/>
      <line x1="67" y1="55" x2="67" y2="30" stroke="#3A6B7E" stroke-width="3"/>
      <polygon points="43,35 67,30 67,36 43,41" fill="#3A6B7E"/>
    </svg>`
  },
  higiene: {
    key: 'higiene',
    nome: 'Banheiro e Lavar Mãos',
    categoria: 'Autocuidado',
    descricaoAcessivel: 'Duas mãos lavando com gotas de água e bolhas suaves',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#E0F4FF" stroke="#3B82F6" stroke-width="3"/>
      <path d="M30 65 Q30 50 45 50 Q55 50 55 65 Z" fill="#D9E6ED" stroke="#3A6B7E" stroke-width="2"/>
      <path d="M50 65 Q50 45 65 45 Q75 45 75 65 Z" fill="#D9E6ED" stroke="#3A6B7E" stroke-width="2"/>
      <circle cx="45" cy="35" r="4" fill="#38BDF8"/>
      <circle cx="58" cy="28" r="5" fill="#38BDF8"/>
      <circle cx="66" cy="36" r="3" fill="#38BDF8"/>
      <path d="M48 20 C48 16 52 14 52 20 Z" fill="#0284C7"/>
    </svg>`
  },
  guardar_material: {
    key: 'guardar_material',
    nome: 'Guardar Material',
    categoria: 'Organização',
    descricaoAcessivel: 'Mochila escolar com zíper e um livro sendo guardado suavemente',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#F4EEFF" stroke="#7E57C2" stroke-width="3"/>
      <rect x="32" y="38" width="36" height="42" rx="8" fill="#D1C4E9" stroke="#5E35B1" stroke-width="3"/>
      <rect x="38" y="54" width="24" height="20" rx="4" fill="#EDE7F6" stroke="#5E35B1" stroke-width="2"/>
      <path d="M42 38 C42 28, 58 28, 58 38" stroke="#5E35B1" stroke-width="3" fill="none"/>
      <line x1="50" y1="60" x2="50" y2="66" stroke="#5E35B1" stroke-width="2"/>
    </svg>`
  },
  saida: {
    key: 'saida',
    nome: 'Hora da Saída',
    categoria: 'Transição',
    descricaoAcessivel: 'Pessoa acenando com a mão ao lado de um portão amigável',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#FFF8E7" stroke="#F59E0B" stroke-width="3"/>
      <circle cx="45" cy="40" r="9" fill="#3A6B7E"/>
      <path d="M30 75 L45 55 L58 75" stroke="#3A6B7E" stroke-width="3" stroke-linecap="round"/>
      <path d="M45 55 L65 42 L72 45" stroke="#3A6B7E" stroke-width="3" stroke-linecap="round"/>
      <polygon points="68,26 73,31 78,26" fill="#F59E0B"/>
      <circle cx="73" cy="33" r="2" fill="#F59E0B"/>
    </svg>`
  }
};
