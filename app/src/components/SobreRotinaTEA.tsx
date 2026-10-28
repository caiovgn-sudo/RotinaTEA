import React from 'react';
import { PerfilUsuario } from '../types';
import { NOME_PERFIL, PROPOSITO_VISAO } from '../utils/acesso';
import { User, GraduationCap, BarChart3, ShieldCheck, Play, Square, HardDrive, CloudUpload } from 'lucide-react';

const ICONE_PERFIL: Record<PerfilUsuario, React.ReactNode> = {
  ALUNO: <User size={20} aria-hidden="true" />,
  PROFESSOR: <GraduationCap size={20} aria-hidden="true" />,
  COORDENACAO: <BarChart3 size={20} aria-hidden="true" />,
  RESPONSAVEL: <ShieldCheck size={20} aria-hidden="true" />
};

const EXIGE_LOGIN: Record<PerfilUsuario, boolean> = {
  ALUNO: false,
  PROFESSOR: true,
  COORDENACAO: true,
  RESPONSAVEL: true
};

const PERFIS: PerfilUsuario[] = ['ALUNO', 'PROFESSOR', 'COORDENACAO', 'RESPONSAVEL'];

const REGRAS: { codigo: string; titulo: string; texto: string }[] = [
  {
    codigo: 'RN01',
    titulo: 'Toda crise tem começo e fim',
    texto:
      'O sistema guarda o horário em que a crise começou e em que terminou e calcula a duração sozinho. Uma crise em andamento não pode ser apagada.'
  },
  {
    codigo: 'RN02',
    titulo: 'O aluno é identificado só por um código',
    texto:
      'Nas telas e nos relatórios aparece apenas um código, como ALN-8921. Nome completo, CPF e fotos que identifiquem a criança não são guardados nem exibidos.'
  },
  {
    codigo: 'RN03',
    titulo: 'Primeiro salva neste aparelho, depois envia',
    texto:
      'Todo registro é gravado primeiro no próprio aparelho, para funcionar mesmo sem internet. O envio ao servidor acontece depois, quando há conexão e uma conta real.'
  }
];

export const SobreRotinaTEA: React.FC = () => (
  <div className="sobre-container">
    <section className="sobre-secao" aria-labelledby="sobre-objetivo">
      <h2 id="sobre-objetivo">O que é o RotinaTEA</h2>
      <p>
        O RotinaTEA é um aplicativo de apoio à inclusão escolar de alunos com Transtorno do Espectro Autista (TEA).
        Ele tem dois objetivos: dar <strong>previsibilidade</strong> ao aluno, com uma rotina visual em cartões e um
        temporizador sem alarme sonoro, e dar <strong>agilidade</strong> ao professor, que registra um episódio de
        desregulação (crise) com um clique. Os registros alimentam o Plano Educacional Individualizado (PEI).
      </p>
    </section>

    <section className="sobre-secao" aria-labelledby="sobre-perfis">
      <h2 id="sobre-perfis">Quem usa e o que cada pessoa faz</h2>
      <ul className="sobre-lista-cartoes">
        {PERFIS.map((p) => (
          <li key={p} className="sobre-cartao">
            <div className="sobre-cartao-titulo">
              {ICONE_PERFIL[p]}
              <h3>{NOME_PERFIL[p]}</h3>
            </div>
            <p>{PROPOSITO_VISAO[p]}</p>
            <p className="sobre-nota">{EXIGE_LOGIN[p] ? 'Exige login.' : 'Acesso livre, sem login.'}</p>
          </li>
        ))}
      </ul>
    </section>

    <section className="sobre-secao" aria-labelledby="sobre-regras">
      <h2 id="sobre-regras">Regras que o sistema sempre cumpre</h2>
      <ul className="sobre-lista-regras">
        {REGRAS.map((r) => (
          <li key={r.codigo}>
            <span className="sobre-codigo">{r.codigo}</span>
            <div>
              <h3>{r.titulo}</h3>
              <p>{r.texto}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="sobre-nota">
        Também seguem a LGPD (Lei nº 13.709/2018) para dados de menores e as diretrizes de acessibilidade WCAG 2.1 AA:
        nada pisca, não há alarme sonoro e todos os botões podem ser usados pelo teclado.
      </p>
    </section>

    <section className="sobre-secao" aria-labelledby="sobre-fluxo">
      <h2 id="sobre-fluxo">O caminho de uma crise</h2>
      <ol className="sobre-fluxo">
        <li>
          <Play size={18} aria-hidden="true" />
          <div>
            <h3>1. Iniciar</h3>
            <p>O professor toca no botão vermelho. O cronômetro começa e o horário de início é guardado.</p>
          </div>
        </li>
        <li>
          <Square size={18} aria-hidden="true" />
          <div>
            <h3>2. Encerrar</h3>
            <p>Ao fim do episódio, o professor encerra. A duração é calculada e ele pode anotar o possível gatilho.</p>
          </div>
        </li>
        <li>
          <HardDrive size={18} aria-hidden="true" />
          <div>
            <h3>3. Salvar neste aparelho</h3>
            <p>O registro fica gravado no aparelho na hora, com ou sem internet. Selo: “Salva só neste aparelho”.</p>
          </div>
        </li>
        <li>
          <CloudUpload size={18} aria-hidden="true" />
          <div>
            <h3>4. Enviar ao servidor</h3>
            <p>Com conexão e conta real, o registro vai para o servidor e o selo muda para “Enviada ao servidor”.</p>
          </div>
        </li>
      </ol>
    </section>

    <section className="sobre-secao" aria-labelledby="sobre-acesso">
      <h2 id="sobre-acesso">Conta real ou modo demonstração</h2>
      <p>
        Em <strong>conta real</strong>, o perfil é definido no servidor: quem se cadastra entra como Responsável legal, e
        Professor ou Coordenação são concedidos por um administrador. No <strong>modo demonstração</strong>, perfis
        fictícios podem ser abertos sem senha para conhecer o sistema; os dados ficam só neste navegador e nada vai ao
        servidor. O tipo de acesso atual aparece sempre abaixo do cabeçalho.
      </p>
    </section>

    <section className="sobre-secao" aria-labelledby="sobre-estado">
      <h2 id="sobre-estado">Estado atual do protótipo</h2>
      <p>
        Este é um protótipo de Trabalho de Conclusão de Curso, usado com dados fictícios. Ainda não estão concluídos: a
        gravação das respostas do questionário de usabilidade (SUS), o relatório do PEI com gráficos próprios e a
        avaliação com educadores.
      </p>
    </section>
  </div>
);
