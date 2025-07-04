import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Mail, Send, MessageSquare, Home } from 'lucide-react';
import FileUpload from './components/FileUpload';
import EmailList from './components/EmailList';
import Stats from './components/Stats';
import { sendEmails, UploadResponse } from './lib/api';
import toast from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [subject, setSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(`<h1>Заголовок</h1>
<body>
  Привет, это пример email сообщения.
</body>
<html>`);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);

  const handleUploadSuccess = (_result: UploadResponse) => {
    setRefreshTrigger((prev: number) => prev + 1);
  };

  const handleSendEmails = async () => {
    if (!subject.trim()) {
      toast.error('Введите тему письма');
      return;
    }

    if (!emailTemplate.trim()) {
      toast.error('Введите шаблон письма');
      return;
    }

    setIsSending(true);
    setSendResults(null);

    try {
      const result = await sendEmails(subject, emailTemplate);
      setSendResults(result);
      toast.success(`Рассылка завершена! Отправлено: ${result.success} писем`);
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Ошибка при отправке писем');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Email Mailer</h1>
                <p className="text-sm text-gray-600">SMS-like Broadcasting System</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'send' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>Send Emails</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <div>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
              
              {/* Email List */}
              <div>
                <EmailList refreshTrigger={refreshTrigger} />
              </div>
            </div>
            
            {/* Stats */}
            <div>
              <Stats />
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Template Editor */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Email Template</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Тема письма
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input"
                    placeholder="Введите тему письма"
                  />
                </div>
                
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                    HTML шаблон
                  </label>
                  <textarea
                    id="template"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="textarea h-64 font-mono text-sm"
                    placeholder="Введите HTML код письма"
                  />
                </div>
                
                <button
                  onClick={handleSendEmails}
                  disabled={isSending}
                  className={`w-full btn-primary flex items-center justify-center space-x-2 ${
                    isSending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Emails</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Email Preview and Results */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Предварительный просмотр
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-2">
                    <strong>Тема:</strong> {subject || 'Без темы'}
                  </div>
                  <div className="border-t pt-2">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: emailTemplate }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Send Results */}
              {sendResults && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Результаты отправки
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Всего:</span>
                      <span className="font-semibold">{sendResults.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Успешно:</span>
                      <span className="font-semibold text-green-600">{sendResults.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ошибки:</span>
                      <span className="font-semibold text-red-600">{sendResults.failed}</span>
                    </div>
                    
                    {sendResults.details && sendResults.details.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Детали:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {sendResults.details.map((detail: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                              <span>{detail.email}</span>
                              <span className={`font-medium ${detail.success ? 'text-green-600' : 'text-red-600'}`}>
                                {detail.success ? 'Отправлено' : 'Ошибка'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Email List Summary */}
              <div>
                <EmailList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
