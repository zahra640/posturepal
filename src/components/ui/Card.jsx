export default function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <h2 className="text-base font-semibold text-amber-800 mb-4 font-playfair">{title}</h2>
      )}
      {children}
    </div>
  )
}
