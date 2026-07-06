export default function Input({
  label,
  error,
  icon: Icon,
  rightAction,
  className = '',
  inputClassName = '',
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
        <input
          id={inputId}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500 ${Icon ? 'pl-12' : ''} ${rightAction ? 'pr-12' : ''} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${inputClassName}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAction}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
