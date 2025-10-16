import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, File, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
  propertyId?: string | null;
  onUploadComplete?: () => void;
}

type DocumentType = 'identity' | 'property_deed' | 'tax_document' | 'certificate' | 'other';

export const DocumentUpload = ({ propertyId, onUploadComplete }: DocumentUploadProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('identity');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from('documents').insert({
        owner_id: user.id,
        property_id: propertyId || null,
        document_type: documentType,
        file_name: selectedFile.name,
        file_path: fileName,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setSelectedFile(null);

      if (onUploadComplete) {
        onUploadComplete();
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Document uploaded successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="identity">Identity Document</option>
            <option value="property_deed">Property Deed</option>
            <option value="tax_document">Tax Document</option>
            <option value="certificate">Certificate</option>
            <option value="other">Other</option>
          </select>
        </div>

        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Select File
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={uploading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Document
            </>
          )}
        </button>
      </div>
    </div>
  );
};
