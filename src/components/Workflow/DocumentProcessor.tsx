import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle, 
  FileText,
  Zap,
  Target,
  Settings
} from 'lucide-react';
import { Document, ExtractedField } from '../../types';
import { OCRResult, TemplateMatch } from '../../types/workflow';

interface DocumentProcessorProps {
  document: Document;
  onOCRComplete: (documentId: string, result: OCRResult) => void;
  onValidation: (documentId: string, isValid: boolean) => void;
  onReprocess: (documentId: string) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  document,
  onOCRComplete,
  onValidation,
  onReprocess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [currentIteration, setCurrentIteration] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (document.status === 'uploaded') {
      handleOCRProcess();
    }
  }, [document.id]);

  const handleOCRProcess = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate OCR processing with realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock OCR result based on document type
      const mockResult: OCRResult = {
        extractedText: generateMockExtractedText(document.fileName),
        confidence: 0.85 + Math.random() * 0.1,
        documentType: recognizeDocumentType(document.fileName),
        structuredData: generateStructuredData(document.fileName),
        iterationNumber: currentIteration
      };
      
      setOcrResult(mockResult);
      onOCRComplete(document.id, mockResult);
      
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReprocessDocument = async () => {
    setCurrentIteration(prev => prev + 1);
    await handleOCRProcess();
    onReprocess(document.id);
  };

  const generateMockExtractedText = (fileName: string): string => {
    const name = fileName.toLowerCase();
    
    if (name.includes('lc') || name.includes('letter') || name.includes('credit')) {
      return `IRREVOCABLE DOCUMENTARY CREDIT

LC Number: LC${Math.random().toString().substr(2, 8)}
Issue Date: ${new Date().toLocaleDateString()}
Expiry Date: ${new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Amount: USD ${(Math.random() * 100000 + 10000).toFixed(2)}

Beneficiary: ABC Trading Company Limited
123 Business Street, Trade City, TC 12345

Applicant: XYZ Import Corporation
456 Commerce Avenue, Import Town, IT 67890

Description of Goods:
Electronic components and accessories as per proforma invoice PI-2024-001
Quantity: 1000 units
Unit Price: USD 50.00 per unit

Documents Required:
- Commercial Invoice in triplicate
- Packing List
- Bill of Lading
- Certificate of Origin
- Insurance Certificate

Terms and Conditions:
- Shipment from: Port of Shanghai
- Shipment to: Port of Los Angeles
- Latest shipment date: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Presentation period: 21 days after shipment date

This credit is subject to UCP 600.`;
    }
    
    return `Trade Finance Document\n\nDocument Number: DOC-${Math.random().toString().substr(2, 8)}\nDate: ${new Date().toLocaleDateString()}\n\nThis document contains trade finance information related to international commerce transactions.`;
  };

  const recognizeDocumentType = (fileName: string): string => {
    const name = fileName.toLowerCase();
    
    if (name.includes('lc') || name.includes('letter') || name.includes('credit')) {
      return 'Letter of Credit';
    } else if (name.includes('invoice')) {
      return 'Commercial Invoice';
    } else if (name.includes('bl') || name.includes('lading')) {
      return 'Bill of Lading';
    } else if (name.includes('packing')) {
      return 'Packing List';
    } else if (name.includes('certificate')) {
      return 'Certificate of Origin';
    }
    
    return 'Unknown Document Type';
  };

  const generateStructuredData = (fileName: string) => {
    return {
      sections: [
        { name: 'Header', confidence: 0.92 },
        { name: 'Parties', confidence: 0.88 },
        { name: 'Amount and Currency', confidence: 0.95 },
        { name: 'Terms and Conditions', confidence: 0.83 }
      ],
      fields: Math.floor(Math.random() * 10) + 5,
      pages: 1
    };
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Document Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">{document.fileName}</h3>
            <p className="text-sm text-slate-600">
              {document.fileType} • {Math.round(document.fileSize / 1024)} KB
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                document.status === 'processed' ? 'bg-green-100 text-green-800' :
                document.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                document.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {document.status}
              </span>
              <span className="text-xs text-slate-500">
                Iteration: {currentIteration}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
            <div>
              <p className="font-medium text-slate-900">Step 4: OCR Processing</p>
              <p className="text-sm text-slate-600">
                Running OCR, splitter & recognizer engine...
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-slate-600">
              <Zap size={16} className="mr-2 text-yellow-500" />
              Extracting text from document
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Target size={16} className="mr-2 text-blue-500" />
              Recognizing document type
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Settings size={16} className="mr-2 text-purple-500" />
              Splitting form structure
            </div>
          </div>
        </div>
      )}

      {/* OCR Results */}
      {ocrResult && !isProcessing && (
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-slate-900 mb-2">Step 4 Results: OCR & Recognition</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Document Type</p>
                <p className="text-lg font-semibold text-slate-900">{ocrResult.documentType}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Confidence</p>
                <p className="text-lg font-semibold text-slate-900">
                  {Math.round(ocrResult.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Text Preview */}
          <div className="mb-6">
            <h5 className="font-medium text-slate-900 mb-2">Extracted Text</h5>
            <div className="bg-slate-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                {ocrResult.extractedText.substring(0, 500)}
                {ocrResult.extractedText.length > 500 && '...'}
              </pre>
            </div>
          </div>

          {/* Validation Actions */}
          <div className="border-t border-slate-200 pt-4">
            <h5 className="font-medium text-slate-900 mb-3">Step 5: User Validation</h5>
            <p className="text-sm text-slate-600 mb-4">
              Review the extracted text and document recognition. Is the OCR result accurate?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onValidation(document.id, true)}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Check size={20} />
                <span>Approve & Continue</span>
              </button>
              
              <button
                onClick={handleReprocessDocument}
                className="flex-1 bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw size={20} />
                <span>Reprocess (Iteration {currentIteration + 1})</span>
              </button>
              
              <button
                onClick={() => onValidation(document.id, false)}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <X size={20} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">{document.fileName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 bg-slate-100 flex items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto text-slate-400 mb-4" size={64} />
                <p className="text-slate-600">Document Preview</p>
                <p className="text-sm text-slate-500 mt-1">{document.fileName}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;