import { useState, useEffect } from 'react';
import AddressAutocomplete from '../AddressAutocomplete.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { createEvento, updateEvento, getEvento } from '../api';
import Button from '../components/ui/Button.jsx';
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
  
  // Estados para feedback visual
  const [loading, setLoading] = useState(isEditMode);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

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
          
          // Limpa a coordenada do banco e inverte para o padrão humano: Latitude, Longitude
          let loc = data.localizacao || '';
          if (loc.includes('SRID=')) {
            const coords = loc.replace('SRID=4326;POINT (', '').replace(')', '').split(' ');
            if (coords.length === 2) {
              const lng = coords[0];
              const lat = coords[1];
              loc = `${lat}, ${lng}`; // Aqui a mágica acontece: Lat na frente!
            }
          }
          setAddress(loc);

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

  // Função para salvar (Criar ou Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    // Se a coordenada estiver limpa (com vírgula), invertemos de volta para Longitude, Latitude (X Y) para o Django
    let finalLocation = address;
    if (finalLocation && !finalLocation.includes('SRID') && finalLocation.includes(',')) {
      const parts = finalLocation.split(',');
      if (parts.length === 2) {
        const lat = parts[0].trim();
        const lng = parts[1].trim();
        finalLocation = `SRID=4326;POINT(${lng} ${lat})`; // Lng na frente para o PostGIS!
      }
    }

    const payload = {
      ...eventForm,
      localizacao: finalLocation 
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
          <form onSubmit={handleSubmit} className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Título do Projeto</label>
                <input 
                  type="text" name="titulo" value={eventForm.titulo} onChange={onFormChange} required placeholder="Ex: Feira de Saúde Comunitária"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                <select 
                  name="categoria" value={eventForm.categoria} onChange={onFormChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white appearance-none cursor-pointer"
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

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vagas Disponíveis</label>
                <input 
                  type="number" name="vagas" min="1" step="1" value={eventForm.vagas} onChange={onFormChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Data e Hora</label>
                <input 
                  type="datetime-local" name="data_hora" value={eventForm.data_hora} onChange={onFormChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white cursor-pointer" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rede Social ou Comprovação</label>
                <input 
                  type="url" name="link_comprovacao" value={eventForm.link_comprovacao} onChange={onFormChange} required placeholder="https://instagram.com/sua_ong"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Local ou Endereço</label>
                <input 
                  type="text" name="endereco_texto" value={eventForm.endereco_texto} onChange={onFormChange} required placeholder="Ex: Praça Central, Centro"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white" 
                />
              </div>

              {/* Mudei o label deste aqui para ficar mais claro */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Pino no Mapa (Coordenada Oculta)</label>
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all overflow-hidden">
                  <AddressAutocomplete value={address} onChange={setAddress} />
                </div>
              </div>  

              

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Descrição da Iniciativa</label>
                <textarea 
                  name="descricao" value={eventForm.descricao} onChange={onFormChange} required rows="5" placeholder="Descreva o objetivo, o público..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white resize-y"
                ></textarea>
              </div>
            </div>

            {createError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3">
                <AlertTriangle aria-hidden="true" className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{createError}</p>
              </div>
            )}
            {createSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-3">
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
