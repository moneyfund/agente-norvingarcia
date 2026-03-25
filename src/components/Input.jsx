function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <input
        className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-brand-500 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-900 ${className}`}
        {...props}
      />
    </label>
  );
}

export default Input;
