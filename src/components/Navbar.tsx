
import { Link } from 'react-router-dom';
import { Plus, Settings, Download, Upload, Briefcase } from 'lucide-react';
import { useStore } from '../store';

export function Navbar() {
  const { exportToExcel, importFromExcel } = useStore();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromExcel(file);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">简历投递记录</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              导入Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={exportToExcel}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              导出Excel
            </button>
            
            <Link
              to="/statuses"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              状态管理
            </Link>
            
            <Link
              to="/add"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加记录
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
