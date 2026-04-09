
import fs from 'fs';
import path from 'path';

const files = {
  'src/types.ts': `export interface Application {
  id: string;
  companyName: string;
  position: string;
  url?: string;
  statusId: string;
  applicationDate: string;
  customFields: Record&lt;string, string&gt;;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export const DEFAULT_STATUSES: Status[] = [
  { id: '1', name: '待投递', color: '#9ca3af', isDefault: true },
  { id: '2', name: '已投递', color: '#2563eb', isDefault: true },
  { id: '3', name: '面试中', color: '#f59e0b', isDefault: true },
  { id: '4', name: '已Offer', color: '#10b981', isDefault: true },
  { id: '5', name: '已拒绝', color: '#ef4444', isDefault: true },
];
`,

  'src/store.ts': `import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { Application, Status, DEFAULT_STATUSES } from './types';

interface Store {
  applications: Application[];
  statuses: Status[];
  addApplication: (app: any) =&gt; void;
  updateApplication: (id: string, app: any) =&gt; void;
  deleteApplication: (id: string) =&gt; void;
  addStatus: (status: any) =&gt; void;
  updateStatus: (id: string, status: any) =&gt; void;
  deleteStatus: (id: string) =&gt; void;
  importFromExcel: (file: File) =&gt; Promise&lt;void&gt;;
  exportToExcel: () =&gt; void;
}

export const useStore = create&lt;Store&gt;()(
  persist(
    (set, get) =&gt; ({
      applications: [],
      statuses: DEFAULT_STATUSES,
      
      addApplication: (app) =&gt; {
        const now = new Date().toISOString();
        const newApp = {
          ...app,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) =&gt; ({
          applications: [newApp, ...state.applications],
        }));
      },
      
      updateApplication: (id, app) =&gt; {
        set((state) =&gt; ({
          applications: state.applications.map((a) =&gt;
            a.id === id ? { ...a, ...app, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },
      
      deleteApplication: (id) =&gt; {
        set((state) =&gt; ({
          applications: state.applications.filter((a) =&gt; a.id !== id),
        }));
      },
      
      addStatus: (status) =&gt; {
        const newStatus = {
          ...status,
          id: Date.now().toString(),
          isDefault: false,
        };
        set((state) =&gt; ({
          statuses: [...state.statuses, newStatus],
        }));
      },
      
      updateStatus: (id, status) =&gt; {
        set((state) =&gt; ({
          statuses: state.statuses.map((s) =&gt;
            s.id === id ? { ...s, ...status } : s
          ),
        }));
      },
      
      deleteStatus: (id) =&gt; {
        set((state) =&gt; ({
          statuses: state.statuses.filter((s) =&gt; s.id !== id),
        }));
      },
      
      importFromExcel: async (file: File) =&gt; {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        const { statuses } = get();
        const now = new Date().toISOString();
        
        const newApplications = jsonData.map((row) =&gt; {
          let statusId = statuses[0].id;
          if (row.status) {
            const foundStatus = statuses.find((s) =&gt; s.name === row.status);
            if (foundStatus) statusId = foundStatus.id;
          }
          
          return {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            companyName: row.companyName || row['公司名称'] || '',
            position: row.position || row['岗位'] || '',
            url: row.url || row['官网URL'] || '',
            statusId,
            applicationDate: row.applicationDate || row['投递日期'] || new Date().toISOString().split('T')[0],
            customFields: {},
            createdAt: now,
            updatedAt: now,
          };
        });
        
        set((state) =&gt; ({
          applications: [...newApplications, ...state.applications],
        }));
      },
      
      exportToExcel: () =&gt; {
        const { applications, statuses } = get();
        
        const exportData = applications.map((app) =&gt; {
          const status = statuses.find((s) =&gt; s.id === app.statusId);
          const row: any = {
            '公司名称': app.companyName,
            '岗位': app.position,
            '官网URL': app.url || '',
            '状态': status?.name || '',
            '投递日期': app.applicationDate,
          };
          
          Object.entries(app.customFields).forEach(([key, value]) =&gt; {
            row[key] = value;
          });
          
          return row;
        });
        
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '投递记录');
        XLSX.writeFile(workbook, '简历投递记录_' + new Date().toISOString().split('T')[0] + '.xlsx');
      },
    }),
    {
      name: 'job-application-tracker',
    }
  )
);
`,

  'src/components/Navbar.tsx': `import { Link } from 'react-router-dom';
import { Plus, Settings, Download, Upload, Briefcase } from 'lucide-react';
import { useStore } from '../store';

export function Navbar() {
  const { exportToExcel, importFromExcel } = useStore();

  const handleImport = (e: React.ChangeEvent&lt;HTMLInputElement&gt;) =&gt; {
    const file = e.target.files?.[0];
    if (file) {
      importFromExcel(file);
    }
  };

  return (
    &lt;nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"&gt;
      &lt;div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
        &lt;div className="flex justify-between items-center h-16"&gt;
          &lt;Link to="/" className="flex items-center space-x-2"&gt;
            &lt;Briefcase className="h-8 w-8 text-blue-600" /&gt;
            &lt;span className="text-xl font-bold text-gray-900"&gt;简历投递记录&lt;/span&gt;
          &lt;/Link&gt;
          
          &lt;div className="flex items-center space-x-3"&gt;
            &lt;label className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer transition-colors"&gt;
              &lt;Upload className="h-4 w-4 mr-2" /&gt;
              导入Excel
              &lt;input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              /&gt;
            &lt;/label&gt;
            
            &lt;button
              onClick={exportToExcel}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            &gt;
              &lt;Download className="h-4 w-4 mr-2" /&gt;
              导出Excel
            &lt;/button&gt;
            
            &lt;Link
              to="/statuses"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            &gt;
              &lt;Settings className="h-4 w-4 mr-2" /&gt;
              状态管理
            &lt;/Link&gt;
            
            &lt;Link
              to="/add"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            &gt;
              &lt;Plus className="h-4 w-4 mr-2" /&gt;
              添加记录
            &lt;/Link&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/nav&gt;
  );
}
`,

  'src/components/FilterBar.tsx': `import { Status } from '../types';

interface FilterBarProps {
  statuses: Status[];
  selectedStatus: string | null;
  onStatusChange: (statusId: string | null) =&gt; void;
}

export function FilterBar({ statuses, selectedStatus, onStatusChange }: FilterBarProps) {
  return (
    &lt;div className="flex flex-wrap items-center gap-3"&gt;
      &lt;span className="text-sm font-medium text-gray-700"&gt;筛选状态：&lt;/span&gt;
      &lt;button
        onClick={() =&gt; onStatusChange(null)}
        className={\`px-3 py-1.5 text-sm font-medium rounded-full transition-colors \${
          selectedStatus === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }\`}
      &gt;
        全部
      &lt;/button&gt;
      {statuses.map((status) =&gt; (
        &lt;button
          key={status.id}
          onClick={() =&gt; onStatusChange(status.id)}
          className={\`px-3 py-1.5 text-sm font-medium rounded-full transition-colors \${
            selectedStatus === status.id
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }\`}
          style={{
            backgroundColor: selectedStatus === status.id ? status.color : undefined,
            color: selectedStatus === status.id ? 'white' : undefined,
          }}
        &gt;
          {status.name}
        &lt;/button&gt;
      ))}
    &lt;/div&gt;
  );
}
`,

  'src/components/ApplicationCard.tsx': `import { Link } from 'react-router-dom';
import { Edit, Trash2, ExternalLink, Building2 } from 'lucide-react';
import { Application, Status } from '../types';
import { useStore } from '../store';

interface ApplicationCardProps {
  application: Application;
  status: Status;
}

export function ApplicationCard({ application, status }: ApplicationCardProps) {
  const { deleteApplication } = useStore();

  return (
    &lt;div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"&gt;
      &lt;div className="flex items-start justify-between"&gt;
        &lt;div className="flex items-start space-x-4 flex-1"&gt;
          &lt;div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"&gt;
            &lt;Building2 className="h-6 w-6 text-blue-600" /&gt;
          &lt;/div&gt;
          
          &lt;div className="flex-1 min-w-0"&gt;
            &lt;h3 className="text-lg font-semibold text-gray-900 truncate"&gt;
              {application.companyName}
            &lt;/h3&gt;
            &lt;p className="text-gray-600 mt-1"&gt;{application.position}&lt;/p&gt;
            
            &lt;div className="flex items-center space-x-4 mt-3"&gt;
              &lt;span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: status.color + '20', color: status.color }}
              &gt;
                {status.name}
              &lt;/span&gt;
              
              &lt;span className="text-sm text-gray-500"&gt;
                {application.applicationDate}
              &lt;/span&gt;
              
              {application.url &amp;&amp; (
                &lt;a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                &gt;
                  &lt;ExternalLink className="h-4 w-4 mr-1" /&gt;
                  官网
                &lt;/a&gt;
              )}
            &lt;/div&gt;
            
            {Object.keys(application.customFields).length &gt; 0 &amp;&amp; (
              &lt;div className="mt-3 pt-3 border-t border-gray-100"&gt;
                &lt;dl className="grid grid-cols-1 gap-2 sm:grid-cols-2"&gt;
                  {Object.entries(application.customFields).map(([key, value]) =&gt; (
                    &lt;div key={key}&gt;
                      &lt;dt className="text-xs font-medium text-gray-500"&gt;{key}&lt;/dt&gt;
                      &lt;dd className="text-sm text-gray-700"&gt;{value}&lt;/dd&gt;
                    &lt;/div&gt;
                  ))}
                &lt;/dl&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div className="flex items-center space-x-2 ml-4"&gt;
          &lt;Link
            to={\`/edit/\${application.id}\`}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          &gt;
            &lt;Edit className="h-4 w-4" /&gt;
          &lt;/Link&gt;
          &lt;button
            onClick={() =&gt; deleteApplication(application.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          &gt;
            &lt;Trash2 className="h-4 w-4" /&gt;
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
}
`,

  'src/pages/Home.tsx': `import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { ApplicationCard } from '../components/ApplicationCard';
import { FilterBar } from '../components/FilterBar';
import { useStore } from '../store';
import { Empty } from '../components/Empty';

export default function Home() {
  const { applications, statuses } = useStore();
  const [selectedStatus, setSelectedStatus] = useState&lt;string | null&gt;(null);

  const filteredApplications = selectedStatus
    ? applications.filter((app) =&gt; app.statusId === selectedStatus)
    : applications;

  return (
    &lt;div className="min-h-screen bg-gray-50"&gt;
      &lt;Navbar /&gt;
      
      &lt;main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"&gt;
        &lt;div className="mb-8"&gt;
          &lt;h1 className="text-3xl font-bold text-gray-900 mb-6"&gt;投递记录&lt;/h1&gt;
          &lt;FilterBar
            statuses={statuses}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          /&gt;
        &lt;/div&gt;
        
        {filteredApplications.length === 0 ? (
          &lt;Empty message="还没有投递记录，点击上方按钮添加第一条记录吧！" /&gt;
        ) : (
          &lt;div className="space-y-4"&gt;
            {filteredApplications.map((application) =&gt; {
              const status = statuses.find((s) =&gt; s.id === application.statusId);
              return (
                status &amp;&amp; (
                  &lt;ApplicationCard
                    key={application.id}
                    application={application}
                    status={status}
                  /&gt;
                )
              );
            })}
          &lt;/div&gt;
        )}
      &lt;/main&gt;
    &lt;/div&gt;
  );
}
`,

  'src/pages/ApplicationForm.tsx': `import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, statuses, addApplication, updateApplication } = useStore();
  const isEdit = !!id;

  const existingApplication = id ? applications.find((a) =&gt; a.id === id) : null;

  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    url: '',
    statusId: statuses[0]?.id || '',
    applicationDate: new Date().toISOString().split('T')[0],
    customFields: {} as Record&lt;string, string&gt;,
  });

  const [customFieldKeys, setCustomFieldKeys] = useState&lt;string[]&gt;([]);

  useEffect(() =&gt; {
    if (existingApplication) {
      setFormData({
        companyName: existingApplication.companyName,
        position: existingApplication.position,
        url: existingApplication.url || '',
        statusId: existingApplication.statusId,
        applicationDate: existingApplication.applicationDate,
        customFields: existingApplication.customFields,
      });
      setCustomFieldKeys(Object.keys(existingApplication.customFields));
    }
  }, [existingApplication]);

  const handleSubmit = (e: React.FormEvent) =&gt; {
    e.preventDefault();
    if (isEdit &amp;&amp; id) {
      updateApplication(id, formData);
    } else {
      addApplication(formData);
    }
    navigate('/');
  };

  const addCustomField = () =&gt; {
    const newKey = '自定义字段 ' + (customFieldKeys.length + 1);
    setCustomFieldKeys([...customFieldKeys, newKey]);
    setFormData((prev) =&gt; ({
      ...prev,
      customFields: { ...prev.customFields, [newKey]: '' },
    }));
  };

  const removeCustomField = (key: string) =&gt; {
    setCustomFieldKeys(customFieldKeys.filter((k) =&gt; k !== key));
    setFormData((prev) =&gt; {
      const newFields = { ...prev.customFields };
      delete newFields[key];
      return { ...prev, customFields: newFields };
    });
  };

  const updateCustomField = (key: string, value: string) =&gt; {
    setFormData((prev) =&gt; ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  };

  const updateCustomFieldKey = (oldKey: string, newKey: string) =&gt; {
    if (oldKey === newKey) return;
    const value = formData.customFields[oldKey];
    const newKeys = customFieldKeys.map((k) =&gt; (k === oldKey ? newKey : k));
    setCustomFieldKeys(newKeys);
    setFormData((prev) =&gt; {
      const newFields = { ...prev.customFields };
      delete newFields[oldKey];
      newFields[newKey] = value;
      return { ...prev, customFields: newFields };
    });
  };

  return (
    &lt;div className="min-h-screen bg-gray-50"&gt;
      &lt;nav className="bg-white shadow-sm border-b border-gray-200"&gt;
        &lt;div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
          &lt;div className="flex items-center h-16"&gt;
            &lt;Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            &gt;
              &lt;ArrowLeft className="h-5 w-5 mr-2" /&gt;
              返回
            &lt;/Link&gt;
            &lt;h1 className="ml-4 text-xl font-semibold text-gray-900"&gt;
              {isEdit ? '编辑记录' : '添加记录'}
            &lt;/h1&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/nav&gt;

      &lt;main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"&gt;
        &lt;form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"&gt;
          &lt;div className="space-y-6"&gt;
            &lt;div&gt;
              &lt;label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2"&gt;
                公司名称 *
              &lt;/label&gt;
              &lt;input
                type="text"
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) =&gt; setFormData((prev) =&gt; ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入公司名称"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2"&gt;
                岗位 *
              &lt;/label&gt;
              &lt;input
                type="text"
                id="position"
                required
                value={formData.position}
                onChange={(e) =&gt; setFormData((prev) =&gt; ({ ...prev, position: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入岗位名称"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2"&gt;
                官网URL
              &lt;/label&gt;
              &lt;input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) =&gt; setFormData((prev) =&gt; ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              /&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="statusId" className="block text-sm font-medium text-gray-700 mb-2"&gt;
                投递状态
              &lt;/label&gt;
              &lt;select
                id="statusId"
                value={formData.statusId}
                onChange={(e) =&gt; setFormData((prev) =&gt; ({ ...prev, statusId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              &gt;
                {statuses.map((status) =&gt; (
                  &lt;option key={status.id} value={status.id}&gt;
                    {status.name}
                  &lt;/option&gt;
                ))}
              &lt;/select&gt;
            &lt;/div&gt;

            &lt;div&gt;
              &lt;label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700 mb-2"&gt;
                投递日期
              &lt;/label&gt;
              &lt;input
                type="date"
                id="applicationDate"
                value={formData.applicationDate}
                onChange={(e) =&gt; setFormData((prev) =&gt; ({ ...prev, applicationDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              /&gt;
            &lt;/div&gt;

            &lt;div className="border-t border-gray-200 pt-6"&gt;
              &lt;div className="flex items-center justify-between mb-4"&gt;
                &lt;h3 className="text-lg font-medium text-gray-900"&gt;自定义字段&lt;/h3&gt;
                &lt;button
                  type="button"
                  onClick={addCustomField}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                &gt;
                  &lt;Plus className="h-4 w-4 mr-1" /&gt;
                  添加字段
                &lt;/button&gt;
              &lt;/div&gt;

              &lt;div className="space-y-4"&gt;
                {customFieldKeys.map((key) =&gt; (
                  &lt;div key={key} className="flex items-start space-x-3"&gt;
                    &lt;div className="flex-1 grid grid-cols-2 gap-3"&gt;
                      &lt;input
                        type="text"
                        value={key}
                        onChange={(e) =&gt; updateCustomFieldKey(key, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="字段名"
                      /&gt;
                      &lt;input
                        type="text"
                        value={formData.customFields[key] || ''}
                        onChange={(e) =&gt; updateCustomField(key, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="字段值"
                      /&gt;
                    &lt;/div&gt;
                    &lt;button
                      type="button"
                      onClick={() =&gt; removeCustomField(key)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    &gt;
                      &lt;Trash2 className="h-4 w-4" /&gt;
                    &lt;/button&gt;
                  &lt;/div&gt;
                ))}
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200"&gt;
            &lt;Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            &gt;
              取消
            &lt;/Link&gt;
            &lt;button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            &gt;
              {isEdit ? '保存修改' : '添加记录'}
            &lt;/button&gt;
          &lt;/div&gt;
        &lt;/form&gt;
      &lt;/main&gt;
    &lt;/div&gt;
  );
}
`,

  'src/pages/StatusManagement.tsx': `import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Status } from '../types';

export default function StatusManagement() {
  const { statuses, addStatus, updateStatus, deleteStatus } = useStore();
  const [editingId, setEditingId] = useState&lt;string | null&gt;(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#2563eb');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');

  const handleEdit = (status: Status) =&gt; {
    setEditingId(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleSaveEdit = () =&gt; {
    if (editingId &amp;&amp; editName.trim()) {
      updateStatus(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    }
  };

  const handleAdd = () =&gt; {
    if (newName.trim()) {
      addStatus({ name: newName.trim(), color: newColor });
      setNewName('');
      setShowAddForm(false);
    }
  };

  const handleDelete = (id: string) =&gt; {
    if (confirm('确定要删除这个状态吗？')) {
      deleteStatus(id);
    }
  };

  return (
    &lt;div className="min-h-screen bg-gray-50"&gt;
      &lt;nav className="bg-white shadow-sm border-b border-gray-200"&gt;
        &lt;div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"&gt;
          &lt;div className="flex items-center h-16"&gt;
            &lt;Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            &gt;
              &lt;ArrowLeft className="h-5 w-5 mr-2" /&gt;
              返回
            &lt;/Link&gt;
            &lt;h1 className="ml-4 text-xl font-semibold text-gray-900"&gt;
              状态管理
            &lt;/h1&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/nav&gt;

      &lt;main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"&gt;
        &lt;div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"&gt;
          &lt;div className="flex items-center justify-between mb-6"&gt;
            &lt;h2 className="text-lg font-medium text-gray-900"&gt;投递状态列表&lt;/h2&gt;
            &lt;button
              onClick={() =&gt; setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            &gt;
              &lt;Plus className="h-4 w-4 mr-2" /&gt;
              添加状态
            &lt;/button&gt;
          &lt;/div&gt;

          {showAddForm &amp;&amp; (
            &lt;div className="mb-6 p-4 bg-gray-50 rounded-lg"&gt;
              &lt;div className="flex items-end space-x-3"&gt;
                &lt;div className="flex-1"&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
                    状态名称
                  &lt;/label&gt;
                  &lt;input
                    type="text"
                    value={newName}
                    onChange={(e) =&gt; setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入状态名称"
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
                    颜色
                  &lt;/label&gt;
                  &lt;input
                    type="color"
                    value={newColor}
                    onChange={(e) =&gt; setNewColor(e.target.value)}
                    className="w-16 h-10 rounded-md border border-gray-300 cursor-pointer"
                  /&gt;
                &lt;/div&gt;
                &lt;button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                &gt;
                  添加
                &lt;/button&gt;
                &lt;button
                  onClick={() =&gt; setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                &gt;
                  取消
                &lt;/button&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          )}

          &lt;div className="space-y-3"&gt;
            {statuses.map((status) =&gt; (
              &lt;div
                key={status.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              &gt;
                {editingId === status.id ? (
                  &lt;div className="flex items-center space-x-3 flex-1"&gt;
                    &lt;div className="flex-1"&gt;
                      &lt;input
                        type="text"
                        value={editName}
                        onChange={(e) =&gt; setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      /&gt;
                    &lt;/div&gt;
                    &lt;input
                      type="color"
                      value={editColor}
                      onChange={(e) =&gt; setEditColor(e.target.value)}
                      className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
                    /&gt;
                    &lt;button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    &gt;
                      保存
                    &lt;/button&gt;
                    &lt;button
                      onClick={() =&gt; setEditingId(null)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    &gt;
                      取消
                    &lt;/button&gt;
                  &lt;/div&gt;
                ) : (
                  &lt;&gt;
                    &lt;div className="flex items-center space-x-4"&gt;
                      &lt;div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: status.color }}
                      /&gt;
                      &lt;span className="text-sm font-medium text-gray-900"&gt;
                        {status.name}
                      &lt;/span&gt;
                      {status.isDefault &amp;&amp; (
                        &lt;span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded"&gt;
                          默认
                        &lt;/span&gt;
                      )}
                    &lt;/div&gt;
                    &lt;div className="flex items-center space-x-2"&gt;
                      &lt;button
                        onClick={() =&gt; handleEdit(status)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      &gt;
                        &lt;Edit2 className="h-4 w-4" /&gt;
                      &lt;/button&gt;
                      {!status.isDefault &amp;&amp; (
                        &lt;button
                          onClick={() =&gt; handleDelete(status.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        &gt;
                          &lt;Trash2 className="h-4 w-4" /&gt;
                        &lt;/button&gt;
                      )}
                    &lt;/div&gt;
                  &lt;/&gt;
                )}
              &lt;/div&gt;
            ))}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/main&gt;
    &lt;/div&gt;
  );
}
`,
};

Object.entries(files).forEach(([filePath, content]) =&gt; {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created:', filePath);
});

console.log('All files created successfully!');
`
