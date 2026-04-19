import Icon from './Icon';

export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon name={icon} className="text-gray-400 text-4xl" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
