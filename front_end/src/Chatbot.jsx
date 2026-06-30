import { useState } from 'react';
import { AlertCircle, Bot, Send, X } from 'lucide-react';
import { sendChatMessage } from './api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Olá! Eu sou a inteligência artificial do SIGEO-PS. Posso ajudar com dúvidas sobre voluntariado, projetos sociais e uso da plataforma.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || isLoading) return;

    setMessages((current) => [...current, { role: 'user', text }]);
    setMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await sendChatMessage(text);
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: data?.response || 'Não consegui gerar uma resposta agora.' },
      ]);
    } catch {
      setErrorMessage('Não foi possível falar com a IA agora. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[200] pointer-events-none">
      {/* Se estiver aberto, mostra a janela do chat */}
      {isOpen ? (
        <div className="bg-white w-full sm:w-96 h-[min(520px,calc(100vh-7rem))] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-[translate-y-0_0.2s_ease-out] pointer-events-auto">
          
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div>
              <span className="font-bold flex items-center gap-2">
                <Bot aria-hidden="true" className="w-5 h-5" /> Assistente de IA
              </span>
              <p className="text-xs text-emerald-100 mt-1">Ajuda rápida sobre projetos e voluntariado</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-lg"
              aria-label="Fechar chat"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 bg-slate-50 overflow-y-auto flex flex-col gap-3">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] border ${
                  item.role === 'user'
                    ? 'bg-emerald-600 text-white border-emerald-600 rounded-tr-none self-end'
                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-none self-start'
                }`}
              >
                {item.text}
              </div>
            ))}

            {isLoading && (
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-500 max-w-[85%] border border-slate-100 self-start">
                Pensando...
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-2xl">
                <AlertCircle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center">
            <input 
              type="text" 
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Digite sua dúvida..." 
              aria-label="Mensagem para o assistente de IA"
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={isLoading}
            />
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
              disabled={isLoading || !message.trim()}
              aria-label="Enviar mensagem"
            >
              <Send aria-hidden="true" className="w-4 h-4 transform rotate-45 mb-1 mr-1" />
            </button>
          </form>

        </div>
      ) : (
        /* Se estiver fechado, mostra o botão flutuante */
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto bg-slate-900 hover:bg-slate-800 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 hover:-translate-y-1 pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
          aria-label="Abrir assistente virtual"
        >
          <Bot aria-hidden="true" className="w-8 h-8 drop-shadow-md" />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
