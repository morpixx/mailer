import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { uploadFile, UploadResponse } from '../lib/api';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadSuccess: (result: UploadResponse) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const result = await uploadFile(file);
      onUploadSuccess(result);
      toast.success(`Файл обработан! Загружено: ${result.saved} email адресов`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="card">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isUploading ? 'Загрузка файла...' : 'Загрузить файл с email адресами'}
            </h3>
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Отпустите файл для загрузки'
                : 'Перетащите файл сюда или нажмите для выбора'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>TXT, CSV</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>До 10MB</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Поддерживаемые форматы:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>email1@example.com</li>
          <li>email1@example.com, email2@example.com</li>
          <li>email1@example.com:email2@example.com</li>
          <li>CSV файлы с email адресами</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
