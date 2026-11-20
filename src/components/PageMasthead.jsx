export default function PageMasthead({ label, title, children }) {
  return (
    <header className="ng-masthead">
      <div className="ng-wrap ng-masthead-inner">
        {label && <p className="ng-label">{label}</p>}
        <h1 className="ng-display">{title}</h1>
        {children && <p>{children}</p>}
      </div>
    </header>
  );
}
