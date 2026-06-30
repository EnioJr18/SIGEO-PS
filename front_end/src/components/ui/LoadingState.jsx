export default function LoadingState({ text = "Carregando..." }) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-500 py-8">
      <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin" aria-hidden="true" />
      <span className="font-semibold text-sm">{text}</span>
    </div>
  );
}
