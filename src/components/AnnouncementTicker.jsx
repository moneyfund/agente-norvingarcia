import { Megaphone } from 'lucide-react';

const anuncios = [
  'Propiedades exclusivas disponibles en Nicaragua',
  'Hoteles, terrenos y propiedades comerciales en venta',
  'Contáctanos para vender o alquilar tu propiedad',
  'Nuevas oportunidades con DIAMANTES REALTY GROUP',
];

const tickerItems = anuncios.map((mensaje, index) => ({
  id: `${index}-${mensaje}`,
  text: mensaje,
}));

function TickerContent() {
  return (
    <>
      {tickerItems.map((item) => (
        <span key={item.id} className="ticker-item">
          {item.text}
        </span>
      ))}
    </>
  );
}

function AnnouncementTicker() {
  return (
    <section
      className="announcement-ticker"
      aria-label="Avisos destacados de DIAMANTES REALTY GROUP"
    >
      <div className="announcement-ticker__label">
        <Megaphone size={16} aria-hidden="true" />
        <span>Anuncios</span>
      </div>
      <div className="announcement-ticker__viewport">
        <div className="announcement-ticker__track">
          <TickerContent />
          <TickerContent />
        </div>
      </div>
    </section>
  );
}

export default AnnouncementTicker;
