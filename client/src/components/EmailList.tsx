import React, { useState, useEffect } from 'react';
import { Mail, Trash2, AlertCircle } from 'lucide-react';
import { Account, getAccounts, deleteAccount, clearAccounts } from '../lib/api';
import toast from 'react-hot-toast';

interface EmailListProps {
  refreshTrigger?: number;
}

const EmailList: React.FC<EmailListProps> = ({ refreshTrigger = 0 }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Ошибка при загрузке email адресов');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await deleteAccount(id);
      setAccounts(accounts.filter(account => account.id !== id));
      toast.success('Email адрес удален');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Ошибка при удалении');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить все email адреса?')) {
      return;
    }

    try {
      await clearAccounts();
      setAccounts([]);
      toast.success('Все email адреса удалены');
    } catch (error) {
      console.error('Error clearing accounts:', error);
      toast.error('Ошибка при очистке');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <span>Email адреса ({accounts.length})</span>
        </h2>
        {accounts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="btn-danger text-sm"
          >
            Очистить все
          </button>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Нет загруженных email адресов</p>
          <p className="text-sm mt-2">Загрузите файл с email адресами для начала</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  {account.email}
                </span>
              </div>
              <button
                onClick={() => handleDeleteAccount(account.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded"
                title="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;
