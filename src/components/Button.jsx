import { motion } from 'framer-motion';

function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-rose-500',
    secondary: 'bg-white/90 text-slate-900 hover:bg-white dark:bg-slate-800 dark:text-slate-100',
    outline: 'border border-brand-500 text-brand-500 hover:bg-brand-500/10 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-400/10',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1.5 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={`rounded-2xl px-5 py-3 font-semibold shadow-premium transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default Button;
