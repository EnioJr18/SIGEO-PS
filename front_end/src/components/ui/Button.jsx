const variants = {
  primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
};

const sizes = {
  sm: 'px-3 py-2 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3 text-base rounded-full',
  full: 'w-full py-3.5 text-base rounded-xl',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
