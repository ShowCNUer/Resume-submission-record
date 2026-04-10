
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ApplicationCard } from '../components/ApplicationCard';
import { FilterBar } from '../components/FilterBar';
import { useStore } from '../store';
import Empty from '../components/Empty';
import { Search } from 'lucide-react';

export default function Home() {
  const { applications, statuses } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = !selectedStatus || app.statusId === selectedStatus;
    const matchesSearch = !searchQuery || 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">投递记录</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索公司名称或岗位"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <FilterBar
            statuses={statuses}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>
        
        {filteredApplications.length === 0 ? (
          <Empty message="没有找到匹配的投递记录" />
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const status = statuses.find((s) => s.id === application.statusId);
              return (
                status && (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    status={status}
                  />
                )
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
