import Icon from './Icon';

const COLORS = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-primary-700', val: 'text-primary-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',   val: 'text-green-700' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-500',     val: 'text-red-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500',  val: 'text-orange-600' },
  gold:   { bg: 'bg-amber-50',  icon: 'text-amber-500',   val: 'text-amber-600' },
};

export default function StatCard({ icon, label, value, sub, color = 'blue', loading }) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          {loading
            ? <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
            : <p className={`text-2xl font-bold truncate ${c.val}`}>{value}</p>
          }
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`ml-3 w-10 h-10 shrink-0 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon name={icon} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
