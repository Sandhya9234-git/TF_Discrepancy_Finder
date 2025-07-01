import React, { useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Database,
  Workflow,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useAuthStore } from '../store/authStore';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSessions, isLoading } = useSessionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const stats = [
    {
      title: 'Total Sessions',
      value: sessions.length,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Completed',
      value: sessions.filter(s => s.status === 'completed').length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'In Progress',
      value: sessions.filter(s => ['uploading', 'processing', 'reviewing'].includes(s.status)).length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%',
    },
    {
      title: 'Pending Review',
      value: sessions.filter(s => s.status === 'reviewing').length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-2%',
    },
  ];

  const recentSessions = sessions.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'frozen': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Trade Finance Document Processing Dashboard
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/workflow')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Workflow size={20} />
            <span>New Workflow</span>
          </button>
          <button 
            onClick={() => navigate('/upload')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Upload size={20} />
            <span>Quick Upload</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">8-Step Workflow Process</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { step: 1, name: 'Session Init', icon: Plus },
            { step: 2, name: 'Session Box', icon: Database },
            { step: 3, name: 'Upload', icon: Upload },
            { step: 4, name: 'OCR Process', icon: FileText },
            { step: 5, name: 'Validation', icon: CheckCircle },
            { step: 6, name: 'Catalog', icon: Database },
            { step: 7, name: 'Review', icon: AlertTriangle },
            { step: 8, name: 'Storage', icon: CheckCircle }
          ].map((item) => (
            <div key={item.step} className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <item.icon className="text-blue-600" size={20} />
              </div>
              <p className="text-sm font-medium text-slate-900">Step {item.step}</p>
              <p className="text-xs text-slate-600">{item.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/workflow')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Workflow
          </button>
        </div>
      </div>

      {/* Recent Sessions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <div>
                      <h3 className="font-medium text-slate-900">{session.lcNumber}</h3>
                      <p className="text-sm text-slate-600">CIF: {session.cifNumber}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {session.iterations} iteration{session.iterations !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto text-slate-400 mb-4" size={48} />
                <p className="text-slate-600">No sessions yet</p>
                <p className="text-sm text-slate-500">Start your first workflow to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button 
              onClick={() => navigate('/workflow')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <div className="bg-blue-600 p-2 rounded-lg">
                <Workflow className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Start New Workflow</h3>
                <p className="text-sm text-slate-600">Complete 8-step document processing</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/upload')}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <div className="bg-green-600 p-2 rounded-lg">
                <Upload className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Quick Upload</h3>
                <p className="text-sm text-slate-600">Upload documents to existing session</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/sessions')}
              className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <div className="bg-purple-600 p-2 rounded-lg">
                <Database className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">View All Sessions</h3>
                <p className="text-sm text-slate-600">Manage and review existing sessions</p>
              </div>
            </button>

            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center space-x-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left"
              >
                <div className="bg-yellow-600 p-2 rounded-lg">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Admin Panel</h3>
                  <p className="text-sm text-slate-600">Manage users, templates, and approvals</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;