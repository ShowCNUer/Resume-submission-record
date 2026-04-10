
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, statuses, addApplication, updateApplication } = useStore();
  const isEdit = !!id;

  const existingApplication = id ? applications.find((a) => a.id === id) : null;

  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    url: '',
    statusId: statuses[0]?.id || '',
    applicationDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    if (existingApplication) {
      setFormData({
        companyName: existingApplication.companyName,
        position: existingApplication.position,
        url: existingApplication.url || '',
        statusId: existingApplication.statusId,
        applicationDate: existingApplication.applicationDate,
        note: existingApplication.note || '',
      });
    }
  }, [existingApplication]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateApplication(id, formData);
    } else {
      addApplication(formData);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">
              {isEdit ? '编辑记录' : '添加记录'}
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                公司名称 *
              </label>
              <input
                type="text"
                id="companyName"
                required
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入公司名称"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                岗位 *
              </label>
              <input
                type="text"
                id="position"
                required
                value={formData.position}
                onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入岗位名称"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                官网URL
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="statusId" className="block text-sm font-medium text-gray-700 mb-2">
                投递状态
              </label>
              <select
                id="statusId"
                value={formData.statusId}
                onChange={(e) => setFormData((prev) => ({ ...prev, statusId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700 mb-2">
                投递日期
              </label>
              <input
                type="date"
                id="applicationDate"
                value={formData.applicationDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, applicationDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入备注信息，如笔试已过、月薪多少、福利如何等"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEdit ? '保存修改' : '添加记录'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
