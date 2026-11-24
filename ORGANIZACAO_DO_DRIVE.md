# Organização do Drive e histórico do projeto — RotinaTEA

Atualizado em 24/11/2026. Este documento tem uma cópia no Drive, na pasta raiz do RotinaTEA (`00_Indice_e_Historico_RotinaTEA.docx`). Serve para qualquer pessoa da equipe ou da orientação achar cada documento e entender o que já foi feito.

## 1. Mapa das pastas

A pasta do projeto segue o padrão das outras equipes (KIRA, PEI Vivo e demais): quatro pastas, cada uma com um tipo de conteúdo.

| Pasta | O que guarda | Critério de uso |
|---|---|---|
| **Documentação** | Documentos de planejamento, requisitos e pesquisa | Texto de projeto: pré-projeto, cronograma, requisitos e regras, protocolo do SUS, formulário e resultados da validação |
| **Desenvolvimento** | Material técnico de modelagem e de interface | Diagramas UML, avaliação heurística, padrões de projeto, documento de interface (wireframes); o código fica no GitHub |
| **Entrega Parcial** | O que foi pedido para a etapa parcial | Relatório de revisão ABNT (como o KIRA); a pré-banca de 22/10 não deixou arquivos próprios aqui |
| **Entrega Final** | O que a orientação pede para a banca final | Artigo, banner e pitch, cada um em editável e PDF, mais o vídeo de demonstração |

Regra para novos arquivos: um arquivo por versão atual; ao subir uma nova versão, a anterior vai para a lixeira, para ninguém abrir o arquivo errado.

## 2. Inventário por pasta (24/11/2026)

### Documentação
| Arquivo | Conteúdo |
|---|---|
| Pré Projeto RotinaTEA.docx | Pré-projeto de agosto (registro histórico: ainda cita a API Node.js e o JWT do desenho inicial) |
| Cronograma_RotinaTEA (.docx e .pdf) | Cronograma de entregas e situação; a data da banca fica em branco |
| RotinaTEA - Requisitos e Regras de Negocio.docx | 12 RF, 7 RNF e 5 RN, com situação, prioridade (proposta) e matriz de rastreabilidade |
| RotinaTEA - Protocolo de Avaliacao SUS.docx | Protocolo de aplicação do SUS com educadores (ainda não aplicado) |
| Validação do RotinaTEA (formulário) | Formulário de validação com usuários (22 respostas) |
| Resultados_Validacao_RotinaTEA (.pptx e .pdf) | Apresentação dos resultados das 22 respostas e dos limites |

### Desenvolvimento
| Arquivo | Conteúdo |
|---|---|
| RotinaTEA_DiagramaCasosDeUso.pdf, RotinaTEA_DiagramaClasses.pdf, RotinaTEA_DiagramaSequencia.pdf | Diagramas UML de setembro |
| RotinaTEA_DiagramaAtividades.pdf | Diagrama de atividades do registro de crise e do envio ao servidor |
| RotinaTEA - Heuristica.docx | Avaliação heurística (Nielsen) |
| RotinaTEA - Padroes de Projeto.docx | Padrões de projeto aplicados |
| RotinaTEA - Documento de Interface.docx | Wireframes e descrição das telas |

### Entrega Parcial
| Arquivo | Conteúdo |
|---|---|
| Relatorio_ABNT_RotinaTEA.docx | Relatório de revisão do artigo conforme a ABNT e o guia de IA da orientadora |

### Entrega Final
| Arquivo | Conteúdo |
|---|---|
| Artigo_RotinaTEA_v11 (.docx e .pdf) | Artigo com os resultados reais da validação (22 respostas), figuras, gráficos, quadros e Anexo A |
| Banner_RotinaTEA_v11 (.pptx e .pdf) | Banner de 90 × 120 cm no modelo da orientadora |
| Pitch_Final_RotinaTEA_v11 (.pptx e .pdf) | Pitch de 7 slides e 7 minutos, com o tempo de cada slide nas notas |
| RotinaTEA Web.mp4 | Vídeo de demonstração (plano B da apresentação) |

### Fora do Drive
Código, testes, migrações e toda a documentação em Markdown estão no GitHub: https://github.com/caiovgn-sudo/RotinaTEA. O sistema publicado está em https://rotinatea.vercel.app.

## 3. O que foi feito (histórico por frente)

| Frente (pilar) | O que foi feito | Quando |
|---|---|---|
| Sistema (1) | Prancha visual, temporizador, registro de crise em 1 clique, painel do PEI com gráficos, formulário SUS gravado, consentimento LGPD com bloqueio ao revogar | até 29/10 |
| Interface e acessibilidade (1 e 2) | Orientação por visão, painel de sincronização, selos de envio, registro de atividades, contraste medido nos 3 modos | 28/10 |
| Banco e segurança (3) | Perfil fixado no servidor, RLS de crises e do SUS, função `resumo_sus`, dados de exemplo (7 migrações) | 28 e 29/10 |
| Pré-banca (1) | Slides, roteiro de 7 minutos e vídeo de demonstração | 29/10 |
| Documentos de desenvolvimento (1 e 2) | Requisitos e regras, padrões de projeto, heurística, documento de interface, ODS 4 e 3, cronograma | 16 a 17/11 |
| Artigo, banner e pitch (1) | Artigo v1 a v11, banner e pitch nos modelos da orientadora, relatório ABNT | 29/10 a 24/11 |
| Validação com usuários (2 e 3) | Formulário anônimo de 7 perguntas; 22 respostas; resultados em `VALIDACAO_PRODUTO.md`; números sem comprovação (46 respostas, 85%, 92%) retirados de todos os documentos | 23 e 24/11 |
| Qualidade (2) | 121 testes em 10 arquivos, integração contínua no GitHub, ESLint, auditoria de acessibilidade (axe-core e Lighthouse: acessibilidade 100 em produção após corrigir o contraste do cartão concluído) | 24/11 |
| Publicação (1) | Site na Vercel com deploy automático pela `main` e Supabase Auth configurado | 24/11 |
| Governança (3) | Protocolo do SUS com termo em rascunho, roteiro da banca final, plano de testes com evidências e lacunas declaradas | 24/11 |
| Comparação com os modelos da orientadora | Diagrama de atividades, prioridades, rastreabilidade, gráficos, wireframes, referência da adaptação do SUS e Anexo A no artigo | 24/11 |

## 4. Substituições e remoções

- Removida a pesquisa antiga "Pesquisa: RotinaTEA" (4 respostas) da Entrega Parcial; não é usada no projeto.
- Versões anteriores do artigo (v10), do banner e do pitch, que citavam números sem comprovação, foram removidas da Entrega Final; as versões v11 as substituem.

## 5. Pendências (dependem da equipe)

1. Aplicar o SUS com educadores, seguindo o protocolo, e só então citar resultados.
2. Testar a sincronização com conta real no site publicado.
3. Trocar a chave pública do Supabase.
4. Gravar e publicar o vídeo de demonstração.
5. Confirmar com a orientadora a prioridade dos requisitos e a necessidade de aprovação do termo de consentimento.
6. Corrigir o artigo conforme os comentários da pasta "ARTIGOS PARA CORRIGIR - BANCA FINAL", quando a orientadora enviar.
