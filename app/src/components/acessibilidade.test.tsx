// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import axe from 'axe-core';
import { SobreRotinaTEA } from './SobreRotinaTEA';
import { DialogoConfirmacao } from './DialogoConfirmacao';
import { GraficoBarras } from './GraficoBarras';
import { TemporizadorVisual } from './TemporizadorVisual';
import { CartaoRotina } from './CartaoRotina';
import { PainelSincronizacao } from './PainelSincronizacao';
import { RegistroAtividades } from './RegistroAtividades';
import { SeloSync } from './SeloSync';
import type { RegistroCrise, SyncItem } from '../types';

// Pilar 2 (Qualidade): auditoria automática de acessibilidade (axe-core, WCAG 2.1 A e AA) sobre componentes reais.
// Limites: o jsdom não calcula estilos de layout nem contraste, por isso a regra "color-contrast" fica de fora
// (o contraste do texto é medido em contraste.test.ts). A auditoria automática não substitui teste com leitor de tela.

const noop = () => {};
let raiz: Root | null = null;
let alvo: HTMLElement | null = null;

function montar(el: React.ReactElement): HTMLElement {
  alvo = document.createElement('div');
  document.body.appendChild(alvo);
  raiz = createRoot(alvo);
  flushSync(() => raiz!.render(<main>{el}</main>));
  return alvo;
}

afterEach(() => {
  if (raiz) flushSync(() => raiz!.unmount());
  alvo?.remove();
  raiz = null;
  alvo = null;
});

async function violacoes(el: HTMLElement) {
  const r = await axe.run(el, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } }
  });
  return r.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(' | ')})`);
}

const crise = (id: string, enviada: boolean): RegistroCrise => ({
  id,
  estudanteId: 'e1',
  professorId: 'p1',
  dataHoraInicio: '2026-11-10T10:00:00.000Z',
  dataHoraFim: '2026-11-10T10:05:00.000Z',
  duracaoSegundos: 300,
  sincronizadoOffline: enviada,
  criadoEmLocal: '2026-11-10T10:00:00.000Z'
});

const itemErro: SyncItem = {
  id: 's1',
  tipo: 'REGISTRO_CRISE',
  payload: {} as SyncItem['payload'],
  criadoEm: '2026-11-10T10:05:00.000Z',
  tentativas: 3,
  status: 'ERRO'
};

describe('Acessibilidade automática (axe-core, WCAG 2.1 A e AA)', () => {
  it('SobreRotinaTEA não tem violações', async () => {
    expect(await violacoes(montar(<SobreRotinaTEA />))).toEqual([]);
  });

  it('DialogoConfirmacao aberto não tem violações', async () => {
    const el = montar(
      <DialogoConfirmacao
        aberto
        titulo="Revogar consentimento?"
        mensagem="Novos registros de crise deixam de ser permitidos neste aparelho."
        rotuloConfirmar="Revogar"
        perigo
        onConfirmar={noop}
        onCancelar={noop}
      />
    );
    expect(await violacoes(el)).toEqual([]);
  });

  it('GraficoBarras não tem violações', async () => {
    const el = montar(
      <GraficoBarras
        titulo="Crises por dia da semana"
        descricao="Segunda tem 2 crises e terça tem 1."
        pontos={[{ rotulo: 'Seg', valor: 2 }, { rotulo: 'Ter', valor: 1 }]}
      />
    );
    expect(await violacoes(el)).toEqual([]);
  });

  it('TemporizadorVisual não tem violações', async () => {
    const el = montar(<TemporizadorVisual tituloAtividade="Leitura" duracaoMinutosPadrao={10} />);
    expect(await violacoes(el)).toEqual([]);
  });

  it('CartaoRotina (visão do aluno e do educador) não tem violações', async () => {
    const props = { id: 'c1', titulo: 'Leitura', tempo: '10 min', categoria: 'Aula', pictogramaKey: 'livro', ordem: 1, onAlternar: noop };
    // Na aplicação o cartão fica dentro de role="list" (PranchaVisual); o teste reproduz esse contexto.
    const aluno = montar(<div role="list" aria-label="Lista de Atividades da Rotina"><CartaoRotina {...props} status="agora" isVisaoAluno /></div>);
    expect(await violacoes(aluno)).toEqual([]);
    const educador = montar(<div role="list" aria-label="Lista de Atividades da Rotina"><CartaoRotina {...props} status="aguardando" isVisaoAluno={false} onMoverCima={noop} onMoverBaixo={noop} /></div>);
    expect(await violacoes(educador)).toEqual([]);
  });

  it('PainelSincronizacao (com item em erro) não tem violações', async () => {
    const el = montar(
      <PainelSincronizacao
        fila={[itemErro]}
        crises={[crise('c1', false)]}
        isOnline
        modoDemo={false}
        ocupado={false}
        onSincronizarAgora={noop}
        onTentarNovamente={noop}
      />
    );
    expect(await violacoes(el)).toEqual([]);
  });

  it('RegistroAtividades e SeloSync não têm violações', async () => {
    const a = montar(
      <RegistroAtividades
        atividades={[{ id: 'a1', tipo: 'CRISE_INICIADA', descricao: 'Crise iniciada', em: '2026-11-10T10:00:00.000Z' }]}
        onLimpar={noop}
      />
    );
    expect(await violacoes(a)).toEqual([]);
    const s = montar(<SeloSync crise={crise('c1', true)} fila={[]} modoDemo={false} />);
    expect(await violacoes(s)).toEqual([]);
  });
});
