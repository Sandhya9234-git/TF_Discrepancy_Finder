import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Eye, 
  Target,
  Database,
  FileCheck
} from 'lucide-react';
import { Document } from '../../types';
import { TemplateMatch, DocumentComparison } from '../../types/workflow';

interface TemplateComparatorProps {
  documents: Document[];
  onComparison: (documentId: string, comparison: DocumentComparison) => void;
  onCatalog: (documentId: string, templateId: string) => void;
  onNewDocumentRequest: (documentId: string, documentType: string) => void;
}

const TemplateComparator: React.FC<TemplateComparatorProps> = ({
  documents,
  onComparison,
  onCatalog,
  onNewDocumentRequest
}) => {
  const [comparisons, setComparisons] = useState<Record<string, DocumentComparison>>({});
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({});
  const [newDocumentTypes, setNewDocumentTypes] = useState<Record<string, string>>({});
  const [isComparing, setIsComparing] = useState<string | null>(null);

  const handleCompareDocument = async (documentId: string) => {
    setIsComparing(documentId);
    
    try {
      // Simulate template comparison against 40 master + 192 sub documents
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const document = documents.find(d => d.id === documentId);
      const comparison = generateMockComparison(document);
      
      setComparisons(prev => ({
        ...prev,
        [documentId]: comparison
      }));
      
      onComparison(documentId, comparison);
      
    } catch (error) {
      console.error('Error comparing document:', error);
    } finally {
      setIsComparing(null);
    }
  };

  const generateMockComparison = (document?: Document): DocumentComparison => {
    if (!document) {
      return {
        documentId: '',
        masterMatches: [],
        subMatches: [],
        bestMatch: null,
        isNewDocument: true,
        totalTemplatesChecked: 232
      };
    }

    const fileName = document.fileName.toLowerCase();
    let masterMatches: TemplateMatch[] = [];
    let subMatches: TemplateMatch[] = [];

    if (fileName.includes('lc') || fileName.includes('letter') || fileName.includes('credit')) {
      masterMatches = [
        {
          id: 'master_lc_001',
          name: 'Standard Letter of Credit',
          type: 'master',
          confidence: 0.92,
          matchedFields: 8,
          totalFields: 10,
          category: 'Documentary Credit'
        },
        {
          id: 'master_lc_002',
          name: 'Irrevocable LC Template',
          type: 'master',
          confidence: 0.85,
          matchedFields: 7,
          totalFields: 10,
          category: 'Documentary Credit'
        }
      ];
      
      subMatches = [
        {
          id: 'sub_lc_001',
          name: 'Import LC - Electronics',
          type: 'sub',
          confidence: 0.88,
          matchedFields: 9,
          totalFields: 12,
          category: 'Import LC'
        },
        {
          id: 'sub_lc_002',
          name: 'Export LC - Manufacturing',
          type: 'sub',
          confidence: 0.82,
          matchedFields: 8,
          totalFields: 12,
          category: 'Export LC'
        }
      ];
    } else if (fileName.includes('invoice')) {
      masterMatches = [
        {
          id: 'master_inv_001',
          name: 'Standard Commercial Invoice',
          type: 'master',
          confidence: 0.88,
          matchedFields: 6,
          totalFields: 8,
          category: 'Commercial Invoice'
        }
      ];
      
      subMatches = [
        {
          id: 'sub_inv_001',
          name: 'Export Invoice - Goods',
          type: 'sub',
          confidence: 0.85,
          matchedFields: 7,
          totalFields: 9,
          category: 'Export Invoice'
        }
      ];
    } else if (fileName.includes('bl') || fileName.includes('lading')) {
      masterMatches = [
        {
          id: 'master_bl_001',
          name: 'Ocean Bill of Lading',
          type: 'master',
          confidence: 0.90,
          matchedFields: 7,
          totalFields: 8,
          category: 'Bill of Lading'
        }
      ];
    }

    const allMatches = [...masterMatches, ...subMatches];
    const bestMatch = allMatches.length > 0 ? allMatches[0] : null;

    return {
      documentId: document.id,
      masterMatches,
      subMatches,
      bestMatch,
      isNewDocument: allMatches.length === 0,
      totalTemplatesChecked: 232 // 40 master + 192 sub
    };
  };

  const handleSelectTemplate = (documentId: string, templateId: string) => {
    setSelectedMatches(prev => ({
      ...prev,
      [documentId]: templateId
    }));
  };

  const handleCatalogDocument = async (documentId: string) => {
    const templateId = selectedMatches[documentId];
    if (templateId) {
      await onCatalog(documentId, templateId);
    }
  };

  const handleRequestNewDocument = async (documentId: string) => {
    const documentType = newDocumentTypes[documentId];
    if (documentType) {
      await onNewDocumentRequest(documentId, documentType);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Step 6: Catalog & Compare</h2>
          <p className="text-sm text-slate-600 mt-1">
            Compare documents against 40 master and 192 sub-document templates
          </p>
        </div>
        
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-800">
            <Database size={16} />
            <span className="text-sm font-medium">232 Templates Available</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">40 Master • 192 Sub-documents</p>
        </div>
      </div>

      {documents.map((document) => (
        <div key={document.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-slate-900">{document.fileName}</h3>
                <p className="text-sm text-slate-600">
                  Fields extracted: {document.extractedFields?.length || 0}
                </p>
              </div>
              
              {!comparisons[document.id] && (
                <button
                  onClick={() => handleCompareDocument(document.id)}
                  disabled={isComparing === document.id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isComparing === document.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Comparing...</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>Compare Templates</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Comparison Progress */}
            {isComparing === document.id && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span className="font-medium text-blue-900">Comparing against template database</span>
                </div>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Target size={14} />
                    <span>Scanning 40 master document templates...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileCheck size={14} />
                    <span>Analyzing 192 sub-document templates...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search size={14} />
                    <span>Calculating field matches and confidence scores...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {comparisons[document.id] && (
            <div className="p-6">
              <h4 className="font-medium text-slate-900 mb-4">Template Comparison Results</h4>
              
              {/* Comparison Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {comparisons[document.id].totalTemplatesChecked}
                  </p>
                  <p className="text-sm text-slate-600">Templates Checked</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {comparisons[document.id].masterMatches.length + comparisons[document.id].subMatches.length}
                  </p>
                  <p className="text-sm text-slate-600">Matches Found</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {comparisons[document.id].bestMatch ? 
                      Math.round(comparisons[document.id].bestMatch!.confidence * 100) + '%' : 
                      '0%'
                    }
                  </p>
                  <p className="text-sm text-slate-600">Best Match</p>
                </div>
              </div>

              {/* Template Matches */}
              {(comparisons[document.id].masterMatches.length > 0 || comparisons[document.id].subMatches.length > 0) ? (
                <div className="space-y-4">
                  {/* Master Templates */}
                  {comparisons[document.id].masterMatches.length > 0 && (
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Master Template Matches</h5>
                      <div className="space-y-2">
                        {comparisons[document.id].masterMatches.map((match) => (
                          <div
                            key={match.id}
                            onClick={() => handleSelectTemplate(document.id, match.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedMatches[document.id] === match.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-medium text-slate-900">{match.name}</h6>
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    Master
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Fields matched: {match.matchedFields}/{match.totalFields} • 
                                  Category: {match.category}
                                </p>
                              </div>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(match.confidence)}`}>
                                {Math.round(match.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sub Templates */}
                  {comparisons[document.id].subMatches.length > 0 && (
                    <div>
                      <h5 className="font-medium text-slate-900 mb-3">Sub-Document Template Matches</h5>
                      <div className="space-y-2">
                        {comparisons[document.id].subMatches.map((match) => (
                          <div
                            key={match.id}
                            onClick={() => handleSelectTemplate(document.id, match.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedMatches[document.id] === match.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-medium text-slate-900">{match.name}</h6>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Sub
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                  Fields matched: {match.matchedFields}/{match.totalFields} • 
                                  Category: {match.category}
                                </p>
                              </div>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${getConfidenceColor(match.confidence)}`}>
                                {Math.round(match.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Catalog Button */}
                  {selectedMatches[document.id] && (
                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleCatalogDocument(document.id)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={16} />
                        <span>Catalog Document</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* No Matches - New Document */
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h5 className="font-medium text-yellow-800 mb-2">No Template Matches Found</h5>
                      <p className="text-sm text-yellow-700 mb-4">
                        This document doesn't match any of the 232 existing templates (40 master + 192 sub-documents). 
                        Request approval for a new document type.
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Enter new document type name"
                          value={newDocumentTypes[document.id] || ''}
                          onChange={(e) => setNewDocumentTypes(prev => ({
                            ...prev,
                            [document.id]: e.target.value
                          }))}
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleRequestNewDocument(document.id)}
                          disabled={!newDocumentTypes[document.id]}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Plus size={16} />
                          <span>Request Approval</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {documents.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Database className="mx-auto mb-4" size={48} />
          <p>No documents available for template comparison.</p>
          <p className="text-sm mt-1">Process and validate documents first.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateComparator;