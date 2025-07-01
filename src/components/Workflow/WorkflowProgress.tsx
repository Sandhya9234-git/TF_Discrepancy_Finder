import React from 'react';
import { Check, Clock, AlertCircle, Play } from 'lucide-react';
import { WorkflowStep } from '../../types/workflow';

interface WorkflowProgressProps {
  currentStep: number;
  steps: WorkflowStep[];
  sessionStatus: string;
}

const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ 
  currentStep, 
  steps, 
  sessionStatus 
}) => {
  const getStepIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <Check size={16} className="text-white" />;
    } else if (step.status === 'active' || index === currentStep) {
      return <Play size={16} className="text-white" />;
    } else if (step.status === 'error') {
      return <AlertCircle size={16} className="text-white" />;
    } else {
      return <Clock size={16} className="text-white" />;
    }
  };

  const getStepColor = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return 'bg-green-500';
    } else if (step.status === 'active' || index === currentStep) {
      return 'bg-blue-500';
    } else if (step.status === 'error') {
      return 'bg-red-500';
    } else {
      return 'bg-slate-300';
    }
  };

  const getConnectorColor = (index: number) => {
    return index < currentStep ? 'bg-green-500' : 'bg-slate-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Trade Finance Document Processing Workflow
        </h3>
        <p className="text-sm text-slate-600">
          Complete 8-step process from session creation to final storage
        </p>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-3
                ${getStepColor(step, index)} transition-all duration-300
              `}>
                {getStepIcon(step, index)}
              </div>

              {/* Step Info */}
              <div className="text-center max-w-24">
                <div className="text-sm font-medium text-slate-900 mb-1">
                  Step {step.id}
                </div>
                <div className="text-xs text-slate-600 leading-tight">
                  {step.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-900">
              Current Status: 
            </span>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              sessionStatus === 'completed' ? 'bg-green-100 text-green-800' :
              sessionStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
              sessionStatus === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {sessionStatus}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;