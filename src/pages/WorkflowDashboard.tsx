import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Lock, AlertTriangle } from 'lucide-react';
import { useSessionStore } from '../store/sessionStore';
import { useDocumentStore } from '../store/documentStore';
import WorkflowProgress from '../components/Workflow/WorkflowProgress';
import SessionMetadataForm from '../components/Workflow/SessionMetadataForm';
import DocumentProcessor from '../components/Workflow/DocumentProcessor';
import TemplateComparator from '../components/Workflow/TemplateComparator';
import FieldExtractor from '../components/Documents/FieldExtractor';
import { WorkflowStep, SessionMetadata, OCRResult, DocumentComparison } from '../types/workflow';

const WorkflowDashboard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { currentSession, createSession, updateSessionStatus } = useSessionStore();
  const { documents, loadDocuments } = useDocumentStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionMetadata, setSessionMetadata] = useState<SessionMetadata | null>(null);
  const [isSessionFrozen, setIsSessionFrozen] = useState(false);

  const workflowSteps: WorkflowStep[] = [
    { id: 1, name: 'Session Init', status: 'completed', description: 'User onboarding' },
    { id: 2, name: 'Session Box', status: 'completed', description: 'Metadata setup' },
    { id: 3, name: 'Upload', status: 'active', description: 'Document upload' },
    { id: 4, name: 'OCR Process', status: 'pending', description: 'OCR & recognition' },
    { id: 5, name: 'Validation', status: 'pending', description: 'User validation' },
    { id: 6, name: 'Catalog', status: 'pending', description: 'Template matching' },
    { id: 7, name: 'Review', status: 'pending', description: 'Document control' },
    { id: 8, name: 'Storage', status: 'pending', description: 'Final storage' }
  ];

  useEffect(() => {
    if (sessionId) {
      loadDocuments(sessionId);
      // Determine current step based on session status and documents
      updateCurrentStep();
    }
  }, [sessionId, documents]);

  const updateCurrentStep = () => {
    if (!currentSession) return;

    const hasDocuments = documents.length > 0;
    const hasProcessedDocs = documents.some(d => d.status === 'processed' || d.status === 'validated');
    const hasValidatedDocs = documents.some(d => d.status === 'validated');
    const hasExtractedFields = documents.some(d => d.extractedFields?.length > 0);

    if (currentSession.status === 'completed') {
      setCurrentStep(7); // Final storage
    } else if (hasExtractedFields) {
      setCurrentStep(6); // Review & control
    } else if (hasValidatedDocs) {
      setCurrentStep(5); // Catalog & compare
    } else if (hasProcessedDocs) {
      setCurrentStep(4); // Validation
    } else if (hasDocuments) {
      setCurrentStep(3); // OCR processing
    } else {
      setCurrentStep(2); // Upload
    }
  };

  const handleCreateSession = async (metadata: SessionMetadata) => {
    try {
      const session = await createSession({
        cifNumber: metadata.cifNumber,
        lcNumber: metadata.lcNumber,
        lifecycle: metadata.lifecycle
      });
      
      setSessionMetadata(metadata);
      setCurrentStep(2);
      navigate(`/workflow/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleOCRComplete = async (documentId: string, result: OCRResult) => {
    console.log('OCR completed for document:', documentId, result);
    // Update document status and move to validation step
    setCurrentStep(4);
  };

  const handleValidation = async (documentId: string, isValid: boolean) => {
    if (isValid) {
      // Move to catalog step
      setCurrentStep(5);
      await updateSessionStatus(sessionId!, 'reviewing');
    } else {
      // Stay in OCR step for reprocessing
      setCurrentStep(3);
    }
  };

  const handleReprocess = async (documentId: string) => {
    console.log('Reprocessing document:', documentId);
    // Increment iteration and stay in OCR step
  };

  const handleComparison = async (documentId: string, comparison: DocumentComparison) => {
    console.log('Document comparison completed:', documentId, comparison);
    // Move to review step if all documents are compared
    setCurrentStep(6);
  };

  const handleCatalog = async (documentId: string, templateId: string) => {
    console.log('Document cataloged:', documentId, templateId);
    // Extract fields and move to review
    setCurrentStep(6);
  };

  const handleNewDocumentRequest = async (documentId: string, documentType: string) => {
    console.log('New document approval requested:', documentId, documentType);
    // Send for admin approval
  };

  const handleFreezeSession = async () => {
    if (sessionId) {
      await updateSessionStatus(sessionId, 'frozen');
      setIsSessionFrozen(true);
    }
  };

  const handleFinalSave = async () => {
    if (sessionId) {
      await updateSessionStatus(sessionId, 'completed');
      setCurrentStep(7);
      // Trigger final storage to master records
      navigate('/sessions');
    }
  };

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SessionMetadataForm 
            onCreateSession={handleCreateSession}
          />
        );
      
      case 2:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 3: Upload Documents</h2>
            <p className="text-slate-600 mb-6">
              Session created successfully. Now upload your trade finance documents for processing.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Upload
            </button>
          </div>
        );

      case 3:
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Steps 4-5: OCR Processing & Validation</h2>
            {documents.map(document => (
              <DocumentProcessor
                key={document.id}
                document={document}
                onOCRComplete={handleOCRComplete}
                onValidation={handleValidation}
                onReprocess={handleReprocess}
              />
            ))}
          </div>
        );

      case 5:
        return (
          <TemplateComparator
            documents={documents.filter(d => d.status === 'validated')}
            onComparison={handleComparison}
            onCatalog={handleCatalog}
            onNewDocumentRequest={handleNewDocumentRequest}
          />
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Step 7: Document Control & Final Review</h2>
              <div className="flex space-x-3">
                {!isSessionFrozen && (
                  <>
                    <button
                      onClick={handleFreezeSession}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Lock size={20} />
                      <span>Freeze Session</span>
                    </button>
                    <button
                      onClick={handleFinalSave}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save size={20} />
                      <span>Save & Complete</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <FieldExtractor
              documents={documents.filter(d => d.extractedFields?.length > 0)}
              sessionId={sessionId!}
            />

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Document Control Options</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="bg-white border border-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Edit Documents
                </button>
                <button className="bg-white border border-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Replace Files
                </button>
                <button className="bg-white border border-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Delete Documents
                </button>
                <button className="bg-white border border-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  Revert Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-green-600 mb-4">
              <AlertTriangle size={64} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 8: Final Storage Complete</h2>
            <p className="text-slate-600 mb-6">
              Session has been successfully processed and stored in the master records.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900">TF_master_record</p>
                <p className="text-slate-600">Session metadata</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900">TF_master_documentset</p>
                <p className="text-slate-600">Document collection</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900">TF_key_value_pair</p>
                <p className="text-slate-600">Extracted data</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium text-slate-900">TF_master_fields</p>
                <p className="text-slate-600">Validated fields</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/sessions')}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Trade Finance Workflow
            </h1>
            <p className="text-slate-600">
              {currentSession ? 
                `Session: ${currentSession.lcNumber} | CIF: ${currentSession.cifNumber}` :
                'Complete 8-step document processing workflow'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgress
        currentStep={currentStep}
        steps={workflowSteps}
        sessionStatus={currentSession?.status || 'created'}
      />

      {/* Current Step Content */}
      <div className="min-h-96">
        {renderCurrentStepContent()}
      </div>
    </div>
  );
};

export default WorkflowDashboard;