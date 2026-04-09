
import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ApplicationCard } from '../components/ApplicationCard';
import { FilterBar } from '../components/FilterBar';
import { useStore } from '../store';
import Empty from '../components/Empty';

export default function Home() {
  const { applications, statuses } = useStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredApplications = selectedStatus
    ? applications.filter((app) => app.statusId === selectedStatus)
    : applications;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">投递记录</h1>
          <FilterBar
            statuses={statuses}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>
        
        {filteredApplications.length === 0 ? (
          <Empty message="还没有投递记录，点击上方按钮添加第一条记录吧！" />
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
