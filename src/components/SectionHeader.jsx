/**
 * A hand-drawn section header with wavy underline and optional icon.
 *
 * Usage:
 *   <SectionHeader icon={<FileText />}>Lecture Notes</SectionHeader>
 */
export default function SectionHeader({ children, icon, className = '' }) {
  return (
    <div className={`section-header ${className}`}>
      {icon && (
        <span className="section-header-icon" aria-hidden>
          {icon}
        </span>
      )}
      <h2 className="section-header-title">{children}</h2>
    </div>
  );
}
