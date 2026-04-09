import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Status } from '../types';

export default function StatusManagement() {
  const { statuses, addStatus, updateStatus, deleteStatus } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#2563eb');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');

  const handleEdit = (status: Status) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateStatus(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    }
  };

  const handleAdd = () => {
    if (newName.trim()) {
      addStatus({ name: newName.trim(), color: newColor });
      setNewName('');
      setShowAddForm(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个状态吗？')) {
      deleteStatus(id);
    }
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
              状态管理
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">投递状态列表</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加状态
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    状态名称
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入状态名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    颜色
                  </label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-16 h-10 rounded-md border border-gray-300 cursor-pointer"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {statuses.map((status) => (
              <div
                key={status.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                {editingId === status.id ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-12 h-10 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {status.name}
                      </span>
                      {status.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-200 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(status)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {!status.isDefault && (
                        <button
                          onClick={() => handleDelete(status.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
