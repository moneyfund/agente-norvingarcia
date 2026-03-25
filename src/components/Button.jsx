import { motion } from 'framer-motion';

function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-white/90 text-slate-900 hover:bg-white dark:bg-slate-800 dark:text-slate-100',
    outline: 'border border-brand-500 text-brand-500 hover:bg-brand-500/10',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`rounded-2xl px-5 py-3 font-semibold shadow-premium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default Button;
