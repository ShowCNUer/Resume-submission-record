import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, Building2, ChevronDown } from 'lucide-react';
import { Application, Status } from '../types';
import { useStore } from '../store';

interface ApplicationCardProps {
  application: Application;
  status: Status;
}

export function ApplicationCard({ application, status }: ApplicationCardProps) {
  const { deleteApplication, updateApplication, statuses } = useStore();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleStatusClick = () => {
    setShowStatusMenu(!showStatusMenu);
  };
  
  const handleStatusSelect = (statusId: string) => {
    updateApplication(application.id, { statusId });
    setShowStatusMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {application.companyName}
                </h3>
                <p className="text-sm text-gray-600 truncate">{application.position}</p>
              </div>
              
              <div className="relative">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
                  style={{ backgroundColor: status.color + '20', color: status.color }}
                  onClick={handleStatusClick}
                  title="点击选择状态"
                >
                  {status.name}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </span>
                
                {showStatusMenu && (
                  <div 
                    ref={statusMenuRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                  >
                    {(statuses || []).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleStatusSelect(s.id)}
                        className={`w-full text-left px-4 py-2 text-sm ${s.id === application.statusId ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: s.color }}
                        ></span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {application.applicationDate}
              </span>
              
              {application.url && (
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  官网
                </a>
              )}
            </div>
            
            {application.note && (
              <div className="mt-2 text-sm text-gray-700">
                <span className="text-xs font-medium text-gray-500">备注：</span>
                {application.note}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 ml-3">
          <Link
            to={`/edit/${application.id}`}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              if (window.confirm('确定要删除这条记录吗？')) {
                deleteApplication(application.id);
              }
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}