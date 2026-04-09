
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
    customFields: {} as Record<string, string>,
  });

  const [customFieldKeys, setCustomFieldKeys] = useState<string[]>([]);

  useEffect(() => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && id) {
      updateApplication(id, formData);
    } else {
      addApplication(formData);
    }
    navigate('/');
  };

  const addCustomField = () => {
    const newKey = '自定义字段 ' + (customFieldKeys.length + 1);
    setCustomFieldKeys([...customFieldKeys, newKey]);
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [newKey]: '' },
    }));
  };

  const removeCustomField = (key: string) => {
    setCustomFieldKeys(customFieldKeys.filter((k) => k !== key));
    setFormData((prev) => {
      const newFields = { ...prev.customFields };
      delete newFields[key];
      return { ...prev, customFields: newFields };
    });
  };

  const updateCustomField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  };

  const updateCustomFieldKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const value = formData.customFields[oldKey];
    const newKeys = customFieldKeys.map((k) => (k === oldKey ? newKey : k));
    setCustomFieldKeys(newKeys);
    setFormData((prev) => {
      const newFields = { ...prev.customFields };
      delete newFields[oldKey];
      newFields[newKey] = value;
      return { ...prev, customFields: newFields };
    });
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

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">自定义字段</h3>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加字段
                </button>
              </div>

              <div className="space-y-4">
                {customFieldKeys.map((key) => (
                  <div key={key} className="flex items-start space-x-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateCustomFieldKey(key, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="字段名"
                      />
                      <input
                        type="text"
                        value={formData.customFields[key] || ''}
                        onChange={(e) => updateCustomField(key, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="字段值"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomField(key)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
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
