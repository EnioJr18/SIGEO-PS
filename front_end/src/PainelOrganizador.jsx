import { useState, useEffect } from 'react';
import { getInscricoesRecebidas } from './api';

export default function PainelOrganizador({ eventos }) {
  const [inscricoes, setInscricoes] = useState(null);

  // Verifica se tem token. Se não tiver, nem tenta carregar o painel.
  const isAuthenticated = !!localStorage.getItem('accessToken') || !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    getInscricoesRecebidas()
      .then(data => {
        setInscricoes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Ignora o erro silenciosamente no MVP para não assustar o usuário
        setInscricoes([]);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated || inscricoes === null || inscricoes.length === 0) {
    return null; // Não renderiza nada se não for organizador ou não tiver inscrições
  }

  // Agrupa os IDs para saber quantas pessoas estão em cada evento
  const contagemPorEvento = inscricoes.reduce((acc, inscricao) => {
    acc[inscricao.evento] = (acc[inscricao.evento] || 0) + 1;
    return acc;
  }, {});

  return (
    <section id="painel-organizador" style={{ padding: '60px 20px', backgroundColor: '#f0fdf4', marginTop: '40px' }}>
      <div className="section-heading centered">
        <h2>📊 Seu Painel de Impacto</h2>
        <p>Acompanhe os voluntários confirmados nas suas iniciativas</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px', margin: '0 auto' }}>
        {Object.entries(contagemPorEvento).map(([eventoId, total]) => {
          // Busca o nome real do evento lá da lista do App.jsx
          const eventoOriginal = eventos.find(e => String(e.id) === String(eventoId));
          const titulo = eventoOriginal ? eventoOriginal.titulo : `Projeto #${eventoId}`;

          return (
            <div key={eventoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', border: '1px solid #cce3d2', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <strong style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{titulo}</strong>
              <span style={{ background: '#00e599', color: '#004d33', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                👥 {total} voluntário(s)
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}