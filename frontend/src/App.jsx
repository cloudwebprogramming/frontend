import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import './App.css'
import TaskRegistrationDashboard from './deployment/components/task/TaskRegistrationDashboard'
import ProjectEntryButton from './deployment/components/project/ProjectEntryButton'
import ProjectList from './deployment/components/project/ProjectList'
import SignUp from './deployment/components/auth/SignUp'
import Login from './deployment/components/auth/Login'
import MyPage from './deployment/components/mypage/MyPage'
import { isAuthenticated } from './deployment/api/authApi.js'

// Protected route component
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DashboardHome() {
  const navigate = useNavigate();

  const handleSelectProject = (project) => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="dashboard-home">
      {/* 프로젝트 생성/참여 버튼 */}
      <div style={{ padding: '24px 24px 0 24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ProjectEntryButton
          className="role2-demo-btn"
          onProjectCreated={(p) => console.log('프로젝트 생성됨:', p)}
          onProjectJoined={(p) => console.log('프로젝트 참여됨:', p)}
        />
        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>← 새 프로젝트 만들기</span>
      </div>

      {/* 프로젝트 목록 */}
      <ProjectList onSelectProject={handleSelectProject} />
    </div>
  );
}

function ProjectDetailView() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleBackToList = () => {
    navigate('/');
  };

  return (
    <div className="project-detail-view">
      {/* 상세 대시보드 진입 시 상단 바 */}
      <div className="project-detail-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={handleBackToList} style={{ fontSize: '17px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
            &larr; 목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 선택된 프로젝트의 할일 대시보드 */}
      <TaskRegistrationDashboard projectId={projectId} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
