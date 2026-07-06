import { useState, useEffect } from 'react';
import AddressAutocomplete from '../AddressAutocomplete.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { createEvento, updateEvento, getEvento, sugerirDescricaoEvento } from '../api';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';

export default function CriarEvento() {
  const navigate = useNavigate();
  const { id } = useParams(); // Pega o ID da URL
  const isEditMode = !!id;    // Se tem ID, é modo edição (true)

  // O componente agora gerencia o próprio estado!
  const [eventForm, setEventForm] = useState({
    titulo: '',
    categoria: 'saude',
    vagas: '',
    data_hora: '',
    link_comprovacao: '',
    descricao: '',
    endereco_texto: ''
  });
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  
  // Estados para feedback visual
  const [loading, setLoading] = useState(isEditMode);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiSuggestionSource, setAiSuggestionSource] = useState('');

// Efeito para carregar os dados se for edição
  useEffect(() => {
    if (isEditMode) {
      const fetchEvento = async () => {
        try {
          const data = await getEvento(id);
          setEventForm({
            titulo: data.titulo || '',
            categoria: data.categoria || 'saude',
            vagas: data.vagas || '',
            data_hora: data.data_hora ? data.data_hora.slice(0, 16) : '',
            link_comprovacao: data.link_comprovacao || '',
            descricao: data.descricao || '',
            endereco_texto: data.endereco_texto || ''
          });
          
          const locationMatch = String(data.localizacao || '').match(/POINT\s*\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)/i);
          const locationLabel = data.endereco_texto || data.endereco || '';
          setAddress(locationLabel);

          if (locationMatch) {
            setSelectedLocation({
              label: locationLabel,
              longitude: Number(locationMatch[1]),
              latitude: Number(locationMatch[2]),
            });
          }

        } catch (error) {
          console.error("Erro ao carregar projeto:", error);
          setCreateError("Não foi possível carregar os dados do projeto.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvento();
    }
  }, [id, isEditMode]);

  // Função para atualizar os campos enquanto o usuário digita
  const onFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSuggestDescription = async () => {
    setAiLoading(true);
    setAiError('');
    setAiSuggestion('');
    setAiSuggestionSource('');

    try {
      const data = await sugerirDescricaoEvento({
        titulo: eventForm.titulo,
        categoria: eventForm.categoria,
        local: eventForm.endereco_texto || address,
        data: eventForm.data_hora,
        descricao_atual: eventForm.descricao,
      });

      if (!data.sugestao) {
        throw new Error('Não foi possível gerar a sugestão agora. Você ainda pode preencher a descrição manualmente.');
      }

      setAiSuggestion(data.sugestao);
      setAiSuggestionSource(data.fonte || '');
    } catch (error) {
      setAiError(error.message || 'Não foi possível gerar a sugestão agora. Você ainda pode preencher a descrição manualmente.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    setEventForm((current) => ({
      ...current,
      descricao: aiSuggestion,
    }));
    setAiSuggestion('');
    setAiSuggestionSource('');
  };

  // Função para salvar (Criar ou Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setLocationError('');

    const latitude = Number(selectedLocation?.latitude);
    const longitude = Number(selectedLocation?.longitude);

    if (!selectedLocation || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setLocationError('Selecione um endereço válido na lista para marcar o ponto no mapa.');
      return;
    }

    const payload = {
      ...eventForm,
      vagas: Number(eventForm.vagas),
      endereco_texto: eventForm.endereco_texto.trim() || selectedLocation.label,
      latitude,
      longitude,
      localizacao: `SRID=4326;POINT(${longitude} ${latitude})`,
    };

    try {
      if (isEditMode) {
        await updateEvento(id, payload);
        setCreateSuccess("Projeto atualizado com sucesso!");
        setTimeout(() => navigate('/painel'), 1500); // Redireciona após 1.5s
      } else {
        await createEvento(payload);
        setCreateSuccess("Projeto publicado com sucesso!");
        setTimeout(() => navigate('/painel'), 1500);
      }
    } catch (error) {
      setCreateError(error.message || "Ocorreu um erro ao salvar o projeto.");
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
        <LoadingState text="Carregando dados do projeto..." />
      </div>
    );
  }

  return (
    <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-3xl">
        
        {/* Card Principal do Formulário */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Cabeçalho do Card com Gradiente */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-900 p-8 text-center md:text-left">
            {/* O Título muda automaticamente */}
            <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              {isEditMode ? "Editar Projeto" : "Cadastrar Novo Projeto"}
            </h1>
            <p className="text-emerald-100 text-lg">
              {isEditMode 
                ? "Atualize os dados da sua iniciativa abaixo." 
                : "Preencha os dados abaixo para publicar uma iniciativa social no mapa da sua comunidade."}
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <div className="space-y-8 mb-8">
              
              <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-extrabold text-slate-800">Informações básicas</h2>
                  <p className="text-sm text-slate-500">Nome e categoria principal da iniciativa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Título do Projeto"
                    type="text"
                    name="titulo"
                    value={eventForm.titulo}
                    onChange={onFormChange}
                    required
                    placeholder="Ex: Feira de Saúde Comunitária"
                    className="md:col-span-2"
                  />

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                    <select 
                      name="categoria" value={eventForm.categoria} onChange={onFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-white md:bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="saude">Saúde</option>
                      <option value="educacao">Educação</option>
                      <option value="cultura">Cultura</option>
                      <option value="esporte">Esporte</option>
                      <option value="assistencia_social">Assistência Social</option>
                      <option value="meio_ambiente">Meio Ambiente</option>
                      <option value="tecnologia">Tecnologia</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <Input
                    label="Vagas Disponíveis"
                    type="number"
                    name="vagas"
                    min="1"
                    step="1"
                    value={eventForm.vagas}
                    onChange={onFormChange}
                    required
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-extrabold text-slate-800">Data e local</h2>
                  <p className="text-sm text-slate-500">Informe quando acontecerá e como o projeto aparecerá no mapa.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Data e Hora"
                    type="datetime-local"
                    name="data_hora"
                    value={eventForm.data_hora}
                    onChange={onFormChange}
                    required
                    inputClassName="cursor-pointer"
                  />

                  <Input
                    label="Nome do Local ou Endereço"
                    type="text"
                    name="endereco_texto"
                    value={eventForm.endereco_texto}
                    onChange={onFormChange}
                    required
                    placeholder="Ex: Praça Central, Centro"
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Local marcado no mapa</label>
                    <div className="w-full bg-white md:bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all overflow-hidden">
                      <AddressAutocomplete
                        value={address}
                        onChange={(nextValue) => {
                          setAddress(nextValue);
                          setSelectedLocation(null);
                          setLocationError('');
                        }}
                        onSelect={(suggestion) => {
                          setSelectedLocation(suggestion);
                          setLocationError('');
                        }}
                        placeholder="Digite bairro, cidade e estado para buscar o local"
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Selecione uma sugestão para marcar o local no mapa.
                    </p>
                    {selectedLocation && (
                      <p className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700" role="status">
                        Endereço selecionado: {selectedLocation.label}
                      </p>
                    )}
                    {locationError && (
                      <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600" role="alert">
                        {locationError}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-extrabold text-slate-800">Descrição e comprovação</h2>
                  <p className="text-sm text-slate-500">Explique o objetivo e informe o link usado para acompanhamento.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Input
                    label="Rede Social ou Comprovação"
                    type="url"
                    name="link_comprovacao"
                    value={eventForm.link_comprovacao}
                    onChange={onFormChange}
                    required
                    placeholder="https://instagram.com/sua_ong"
                  />

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Descrição da Iniciativa</label>
                    <textarea 
                      name="descricao" value={eventForm.descricao} onChange={onFormChange} required rows="5" placeholder="Descreva o objetivo, o público..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder-slate-400 bg-white md:bg-slate-50 focus:bg-white resize-y"
                    ></textarea>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-800">
                          <Sparkles aria-hidden="true" className="h-5 w-5 text-emerald-600" />
                          Ajuda da IA
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Use a IA para sugerir ou melhorar a descrição do projeto.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSuggestDescription}
                        disabled={aiLoading}
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                      >
                        <Sparkles aria-hidden="true" className="h-4 w-4" />
                        {aiLoading
                          ? 'Gerando sugestão...'
                          : eventForm.descricao.trim()
                            ? 'Melhorar descrição'
                            : 'Sugerir descrição'}
                      </Button>
                    </div>

                    {aiError && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600" role="alert">
                        {aiError}
                      </div>
                    )}

                    {aiLoading && (
                      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700" role="status" aria-live="polite">
                        Gerando sugestão...
                      </div>
                    )}

                    {aiSuggestion && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" role="status" aria-live="polite">
                        {aiSuggestionSource === 'fallback' && (
                          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                            Geramos uma sugestão básica porque a IA está temporariamente indisponível.
                          </p>
                        )}
                        <p className="text-sm leading-6 text-slate-700 whitespace-pre-line">{aiSuggestion}</p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setAiSuggestion('');
                              setAiSuggestionSource('');
                            }}
                          >
                            Descartar
                          </Button>
                          <Button type="button" onClick={handleUseSuggestion}>
                            Usar sugestão
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {createError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3" role="alert">
                <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{createError}</p>
              </div>
            )}
            {createSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3" role="status" aria-live="polite">
                <CheckCircle aria-hidden="true" className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{createSuccess}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Button
                type="button" 
                onClick={() => navigate('/painel')} 
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              {/* O Botão também muda! */}
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                {isEditMode ? "Salvar Alterações" : "Publicar Projeto"}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
