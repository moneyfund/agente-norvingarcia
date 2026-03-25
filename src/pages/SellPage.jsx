import { MessageCircle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Seo from '../components/Seo';

function SellPage() {
  return (
    <section className="section-container">
      <Seo title="¿Quieres vender? | Norvin García" description="Capta clientes vendedores con un formulario optimizado y contacto directo por WhatsApp." />
      <h1 className="font-display text-4xl font-semibold">¿Quieres vender tu propiedad?</h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">Déjame tus datos y prepararé una estrategia personalizada para vender tu propiedad al mejor precio.</p>
      <form className="mt-8 grid gap-4 rounded-2xl bg-white p-6 shadow-premium dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre" placeholder="Tu nombre" />
          <Input label="Teléfono" placeholder="Tu teléfono" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Email" type="email" placeholder="correo@ejemplo.com" />
          <Input label="Tipo de propiedad" placeholder="Casa, apartamento, terreno..." />
        </div>
        <label>
          <span className="mb-2 block text-sm font-medium">Descripción</span>
          <textarea rows="5" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900" placeholder="Cuéntame más sobre tu propiedad"></textarea>
        </label>
        <div className="flex flex-wrap gap-3">
          <Button type="button">Enviar solicitud</Button>
          <a href="https://wa.me/18095551234" target="_blank" rel="noreferrer"><Button type="button" variant="secondary" className="inline-flex items-center gap-2"><MessageCircle size={16} /> Contacto directo</Button></a>
        </div>
      </form>
    </section>
  );
}

export default SellPage;
