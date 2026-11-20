export default function PageMasthead({ label, title, children, variant = 'editorial' }) {
  return (
    <header className={`ng-masthead ng-masthead--${variant}`}>
      {variant === 'owners' && (
        <img className="ng-masthead-photo" alt="" src="/brand/atelier.webp" srcSet="/brand/atelier-small.webp 720w, /brand/atelier.webp 1280w" sizes="(max-width: 660px) 100vw, 55vw" />
      )}
      <div className="ng-wrap ng-masthead-inner">
        <div>
          {label && <p className="ng-label">{label}</p>}
          <h1 className="ng-display">{title}</h1>
        </div>
        {children && <p className="ng-masthead-intro">{children}</p>}
      </div>
    </header>
  );
}
