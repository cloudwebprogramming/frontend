import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import './App.css'
import TaskRegistrationDashboard from './deployment/components/task/TaskRegistrationDashboard'
import TaskDetailPage from './deployment/components/task/TaskDetailPage'
import ProjectEntryButton from './deployment/components/project/ProjectEntryButton'
import ProjectList from './deployment/components/project/ProjectList'
import SignUp from './deployment/components/auth/SignUp'
import Login from './deployment/components/auth/Login'
import MyPage from './deployment/components/mypage/MyPage'
import { getUser, isAuthenticated } from './deployment/api/authApi.js'

// Protected route component
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppHeader({ title, subtitle, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyPage = location.pathname === '/mypage';
  const isTeamProject = location.pathname === '/' || location.pathname.startsWith('/project/');

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button type="button" className="app-brand" onClick={() => navigate('/')}>
          <span className="app-brand-mark">TP</span>
          <span>TeamPlan</span>
        </button>

        <div className="app-header-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <div className="app-header-actions">
          {children}
          <button
            type="button"
            className={`app-nav-button ${location.pathname === '/mypage' ? 'active' : ''}`}
            onClick={() => navigate('/mypage')}
          >
            마이페이지
          </button>
          <button
            type="button"
            className={`app-nav-button ${isTeamProject && !isMyPage ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            팀프로젝트
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardHome() {
  const navigate = useNavigate();
  const [projectRefreshKey, setProjectRefreshKey] = useState(0);

  const handleSelectProject = (project) => {
    navigate(`/project/${project.id}`);
  };

  const refreshProjects = () => {
    setProjectRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-page">
      <AppHeader
        title="팀프로젝트 관리"
        subtitle="프로젝트별 할 일, 담당자, 진행 상황을 한 곳에서 관리하세요."
      />

      <div className="dashboard-action-row">
        <ProjectEntryButton
          className="role2-demo-btn"
          onProjectCreated={refreshProjects}
          onProjectJoined={refreshProjects}
        />
      </div>

      <ProjectList onSelectProject={handleSelectProject} refreshKey={projectRefreshKey} />
    </div>
  );
}

function ProjectDetailView() {
  const { projectId } = useParams();

  return (
    <div className="app-page">
      <AppHeader
        title="프로젝트 상세"
        subtitle="일정표와 할 일 데이터베이스를 확인하고, 각 업무는 내부 페이지에서 정리하세요."
      />

      <TaskRegistrationDashboard projectId={projectId} />
    </div>
  );
}

function TaskDetailView() {
  const { projectId, taskId } = useParams();

  return (
    <div className="app-page">
      <AppHeader
        title="할 일 페이지"
        subtitle="메모와 체크리스트를 Notion 문서처럼 정리하세요."
      />
      <TaskDetailPage projectId={projectId} taskId={taskId} />
    </div>
  );
}

function MyPageView() {
  return (
    <div className="app-page">
      <AppHeader
        title="마이페이지"
        subtitle="내 업무 진행률과 마감 임박 일정을 빠르게 확인하세요."
      />
      <MyPage />
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
          path="/project/:projectId/tasks/:taskId"
          element={
            <ProtectedRoute>
              <TaskDetailView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPageView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
