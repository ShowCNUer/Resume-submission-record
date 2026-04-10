
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { Application, Status } from '../types';
import { useStore } from '../store';

interface ApplicationCardProps {
  application: Application;
  status: Status;
}

export function ApplicationCard({ application, status }: ApplicationCardProps) {
  const { deleteApplication, updateApplication, statuses } = useStore();
  
  const handleStatusClick = () => {
    const currentIndex = statuses.findIndex(s => s.id === application.statusId);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    updateApplication(application.id, { statusId: nextStatus.id });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {application.companyName}
            </h3>
            <p className="text-gray-600 mt-1">{application.position}</p>
            
            <div className="flex items-center space-x-4 mt-3">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: status.color + '20', color: status.color }}
                onClick={handleStatusClick}
                title="点击切换状态"
              >
                {status.name}
                <ChevronDown className="h-3 w-3 ml-1" />
              </span>
              
              <span className="text-sm text-gray-500">
                {application.applicationDate}
              </span>
              
              {application.url && (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  官网
                </a>
              )}
            </div>
            
            {Object.keys(application.customFields).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(application.customFields).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs font-medium text-gray-500">{key}</dt>
                      <dd className="text-sm text-gray-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            
            {application.note && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div>
                  <dt className="text-xs font-medium text-gray-500">备注</dt>
                  <dd className="text-sm text-gray-700">{application.note}</dd>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Link
            to={`/edit/${application.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              if (window.confirm('确定要删除这条记录吗？')) {
                deleteApplication(application.id);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
