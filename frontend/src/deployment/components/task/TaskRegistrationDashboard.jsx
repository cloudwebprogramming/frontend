import { useState } from 'react';
import TaskFormModal from './TaskFormModal';
import ApiTesterPanel from './ApiTesterPanel';
import './TaskRegistrationDashboard.css';

export default function TaskRegistrationDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTasks, setCreatedTasks] = useState([]);

  const handleTaskCreated = (newTask) => {
    setCreatedTasks((prev) => [...prev, newTask]);
  };

  return (
    <div className="trd-dashboard-container">
      <header className="trd-dashboard-header">
        <h2 className="trd-dashboard-title">역할 4: 할일 등록 및 API 연동 대시보드</h2>
        <p className="trd-dashboard-desc">독립 격리 환경 테스트 패널 (2라운드 고도화 완료)</p>
      </header>

      <section className="trd-trigger-section">
        <div className="trd-trigger-card">
          <h3 className="trd-card-title">할 일 등록 UI 테스트</h3>
          <p className="trd-card-desc">반응형 Glassmorphism 모달과 동적 카테고리 관리 서브 모달을 호출합니다.</p>
          <button 
            type="button" 
            className="trd-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            새 할 일 등록하기
          </button>
        </div>

        {createdTasks.length > 0 && (
          <div className="trd-task-list-card">
            <h4 className="trd-list-title">등록 완료된 할 일 목록</h4>
            <ul className="trd-task-list">
              {createdTasks.map((t, idx) => (
                <li key={idx} className="trd-task-item">
                  <span className="trd-task-tag">[{t.category || '일반'}]</span>
                  <strong className="trd-task-name">{t.title}</strong>
                  <span className="trd-task-meta">
                    (담당: {t.assignee || '미지정'} / <span className="trd-task-dday">{t.dday}</span>)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* API 실시간 연동 테스트 보드 */}
      <ApiTesterPanel />

      {/* 할 일 등록 모달 */}
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProjectId={1}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
