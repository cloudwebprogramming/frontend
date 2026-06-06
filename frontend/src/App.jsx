import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import TaskRegistrationDashboard from './deployment/components/task/TaskRegistrationDashboard'
import ProjectEntryButton from './deployment/components/project/ProjectEntryButton'
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
  return (
    <>
      {/* 역할 2: 프로젝트 등록 / 초대 코드 참여 (격리 완료) — 데모용 진입 버튼 */}
      <div style={{ padding: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ProjectEntryButton
          className="role2-demo-btn"
          onProjectCreated={(p) => console.log('프로젝트 생성됨:', p)}
          onProjectJoined={(p) => console.log('프로젝트 참여됨:', p)}
        />
        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>← 역할 2 데모</span>
      </div>

      {/* 역할 4: 할일 등록 및 API 연동 대시보드 (격리 완료) */}
      <TaskRegistrationDashboard />
    </>
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
