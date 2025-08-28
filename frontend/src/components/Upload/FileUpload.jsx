import React, { useState, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { uploadExcelFile } from '../../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('Please select a valid Excel file (.xlsx, .xls) or CSV file (.csv)');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await uploadExcelFile(file);
      setUploadResult(response.data);
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Excel Files</h2>
        <p className="text-gray-600 dark:text-gray-400">Upload your VAPT data files to process and analyze</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-neutral-800'
            : 'border-neutral-700 hover:border-neutral-500'
        } bg-neutral-900 text-white`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Uploading and processing file...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <CloudArrowUpIcon className="h-16 w-16 text-neutral-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-white">
                Drag and drop your Excel file here, or{' '}
                <button
                  onClick={openFileSelector}
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  click to browse
                </button>
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Supports .xlsx, .xls, and .csv files (Max 50MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Failed</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {uploadResult && (
        <div className="mt-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-300" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Upload Successful</h3>
              <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                <p>File processed successfully!</p>
                {uploadResult.processing_results && (
                  <div>
                    <div className="mt-2 space-y-1">
                      <p>• Proposals: {uploadResult.processing_results.proposals}</p>
                      <p>• Scopes: {uploadResult.processing_results.scopes}</p>
                      <p>• VAPT Results: {uploadResult.processing_results.vapt_results}</p>
                      {uploadResult.processing_results.errors?.length > 0 && (
                        <p className="text-red-600">
                          • Errors: {uploadResult.processing_results.errors.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => onUploadSuccess && onUploadSuccess(uploadResult, 'viewDetails')}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        View Detailed Analysis
                      </button>
                      <button
                        onClick={() => {
                          setUploadResult(null);
                          setError(null);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Upload Another File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Removed: Excel File Format Requirements section */}
    </div>
  );
};

export default FileUpload;