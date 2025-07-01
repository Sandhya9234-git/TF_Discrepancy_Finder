import React, { useState } from 'react';
import { Building2, FileText, Workflow, Plus } from 'lucide-react';
import { SessionMetadata } from '../../types/workflow';

interface SessionMetadataFormProps {
  onCreateSession: (metadata: SessionMetadata) => void;
  isLoading?: boolean;
}

const SessionMetadataForm: React.FC<SessionMetadataFormProps> = ({
  onCreateSession,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    cifNumber: '',
    lcNumber: '',
    lifecycle: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const lifecycleOptions = [
    'Import LC',
    'Export LC', 
    'Standby LC',
    'Documentary Collection',
    'Trade Finance',
    'Bank Guarantee',
    'Supply Chain Finance',
    'Letter of Credit Amendment',
    'LC Confirmation',
    'LC Negotiation'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cifNumber.trim()) {
      newErrors.cifNumber = 'CIF Number is required';
    } else if (!/^[A-Z0-9]{8,12}$/.test(formData.cifNumber.trim())) {
      newErrors.cifNumber = 'CIF Number must be 8-12 alphanumeric characters';
    }

    if (!formData.lcNumber.trim()) {
      newErrors.lcNumber = 'LC Number is required';
    } else if (!/^[A-Z0-9\-]{6,20}$/.test(formData.lcNumber.trim())) {
      newErrors.lcNumber = 'LC Number must be 6-20 characters (letters, numbers, hyphens)';
    }

    if (!formData.lifecycle) {
      newErrors.lifecycle = 'Lifecycle selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const sessionId = `TF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      onCreateSession({
        ...formData,
        sessionId,
        cifNumber: formData.cifNumber.toUpperCase(),
        lcNumber: formData.lcNumber.toUpperCase()
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Plus className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Step 1: Session Initialization
        </h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Create a new trade finance document processing session by providing the required metadata
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {/* CIF Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Building2 size={16} className="inline mr-2" />
            CIF Number *
          </label>
          <input
            type="text"
            value={formData.cifNumber}
            onChange={(e) => handleInputChange('cifNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.cifNumber ? 'border-red-300 bg-red-50' : 'border-slate-300'
            }`}
            placeholder="e.g., CIF12345678"
            maxLength={12}
            disabled={isLoading}
          />
          {errors.cifNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.cifNumber}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Customer Identification File number (8-12 alphanumeric characters)
          </p>
        </div>

        {/* LC Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FileText size={16} className="inline mr-2" />
            LC Number *
          </label>
          <input
            type="text"
            value={formData.lcNumber}
            onChange={(e) => handleInputChange('lcNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.lcNumber ? 'border-red-300 bg-red-50' : 'border-slate-300'
            }`}
            placeholder="e.g., LC-2024-001234"
            maxLength={20}
            disabled={isLoading}
          />
          {errors.lcNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.lcNumber}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Letter of Credit reference number
          </p>
        </div>

        {/* Lifecycle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Workflow size={16} className="inline mr-2" />
            Documentary Credit Lifecycle *
          </label>
          <select
            value={formData.lifecycle}
            onChange={(e) => handleInputChange('lifecycle', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.lifecycle ? 'border-red-300 bg-red-50' : 'border-slate-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select lifecycle stage</option>
            {lifecycleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.lifecycle && (
            <p className="text-red-600 text-sm mt-1">{errors.lifecycle}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Current stage in the documentary credit process
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
              Creating Session...
            </div>
          ) : (
            'Create Session & Continue'
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A unique session ID will be generated for tracking</li>
          <li>• Session metadata will be saved to the database</li>
          <li>• You'll proceed to document upload (Step 3)</li>
          <li>• All documents will be linked to this session</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionMetadataForm;