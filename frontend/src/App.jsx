import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import TaskRegistrationDashboard from './deployment/components/task/TaskRegistrationDashboard'
import ProjectEntryButton from './deployment/components/project/ProjectEntryButton'
import ProjectList from './deployment/components/project/ProjectList'
import SignUp from './deployment/components/auth/SignUp'
import Login from './deployment/components/auth/Login'
import { isAuthenticated } from './deployment/api/authApi.js'

// Protected route component
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Dashboard() {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleSelectProject = (project) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  return (
    <div className="app-dashboard">
      {!selectedProject ? (
        <>
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
        </>
      ) : (
        <>
          {/* 상세 대시보드 진입 시 상단 바 */}
          <div className="project-detail-header" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <button onClick={handleBackToList} style={{ fontSize: '17px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                &larr; 목록으로 돌아가기
              </button>
              <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedProject.title}</h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedProject.subject}</span>
            </div>
          </div>

          {/* 선택된 프로젝트의 할일 대시보드 */}
          <TaskRegistrationDashboard project={selectedProject} />
        </>
      )}
    </div>
  )
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
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
