import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={`bg-white p-10 rounded-3xl border border-slate-200 text-center shadow-sm ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon aria-hidden="true" className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      {description && <p className="text-slate-500 mb-6">{description}</p>}
      {action}
    </div>
  );
}
