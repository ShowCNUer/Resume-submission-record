
import { Status } from '../types';

interface FilterBarProps {
  statuses: Status[];
  selectedStatus: string | null;
  onStatusChange: (statusId: string | null) => void;
}

export function FilterBar({ statuses, selectedStatus, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-700">筛选状态：</span>
      <button
        onClick={() => onStatusChange(null)}
        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
          selectedStatus === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {statuses.map((status) => (
        <button
          key={status.id}
          onClick={() => onStatusChange(status.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            selectedStatus === status.id
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{
            backgroundColor: selectedStatus === status.id ? status.color : undefined,
            color: selectedStatus === status.id ? 'white' : undefined,
          }}
        >
          {status.name}
        </button>
      ))}
    </div>
  );
}
