export default function Icon({ name, className = '', size = 'text-xl' }) {
  return (
    <span className={`material-icons-round select-none ${size} ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}
