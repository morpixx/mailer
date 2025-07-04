import { useState, useEffect } from 'react';
import { BarChart3, Mail, Clock, AlertCircle } from 'lucide-react';
import { getLogs, SendLog } from '../lib/api';

const Stats = () => {
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const successCount = logs.filter(log => log.status === 'success').length;
  const failedCount = logs.filter(log => log.status === 'failed').length;
  const totalCount = logs.length;

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <BarChart3 className="h-5 w-5" />
        <span>Статистика отправки</span>
      </h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Всего</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-2">{totalCount}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Успешно</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-2">{successCount}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Ошибки</span>
          </div>
          <div className="text-2xl font-bold text-red-900 mt-2">{failedCount}</div>
        </div>
      </div>

      {logs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Последние отправки</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.slice(-10).reverse().map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  log.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{log.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status === 'success' ? 'Отправлено' : 'Ошибка'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
