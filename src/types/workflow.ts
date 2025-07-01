// Workflow-specific types for the 8-step process
export interface WorkflowStep {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
}

export interface SessionMetadata {
  cifNumber: string;
  lcNumber: string;
  lifecycle: string;
  sessionId: string;
}

export interface OCRResult {
  extractedText: string;
  confidence: number;
  documentType: string;
  structuredData: any;
  iterationNumber: number;
}

export interface TemplateMatch {
  id: string;
  name: string;
  type: 'master' | 'sub';
  confidence: number;
  matchedFields: number;
  totalFields: number;
  category: string;
}

export interface DocumentComparison {
  documentId: string;
  masterMatches: TemplateMatch[];
  subMatches: TemplateMatch[];
  bestMatch: TemplateMatch | null;
  isNewDocument: boolean;
  totalTemplatesChecked: number;
}

export interface FieldExtraction {
  fieldId: string;
  fieldName: string;
  fieldValue: string;
  confidence: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isValidated: boolean;
  isEdited: boolean;
  dataType: string;
}

export interface DocumentControl {
  canEdit: boolean;
  canReplace: boolean;
  canDelete: boolean;
  canRevert: boolean;
  isFrozen: boolean;
}

export interface ApprovalRequest {
  id: string;
  documentId: string;
  documentType: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface MasterRecord {
  id: string;
  sessionId: string;
  cifNumber: string;
  lcNumber: string;
  lifecycle: string;
  totalDocuments: number;
  processedAt: string;
  createdBy: string;
}