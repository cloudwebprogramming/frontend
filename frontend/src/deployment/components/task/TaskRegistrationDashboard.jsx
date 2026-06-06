import { useState } from 'react';
import TaskFormModal from './TaskFormModal';
import ApiTesterPanel from './ApiTesterPanel';
import ProjectTaskManagement from './ProjectTaskManagement';
import './TaskRegistrationDashboard.css';

export default function TaskRegistrationDashboard({ project }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTasks, setCreatedTasks] = useState([]);

  const handleTaskCreated = (newTask) => {
    setCreatedTasks((prev) => [...prev, newTask]);
  };

  if (!project) return <div>프로젝트 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="trd-dashboard-container">
      <section className="trd-trigger-section">
        <div className="trd-trigger-card">
          <h3 className="trd-card-title">할 일 등록</h3>
          <p className="trd-card-desc">새로운 업무를 등록하여 팀원들과 공유하세요.</p>
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
            <h4 className="trd-list-title">방금 등록한 할 일</h4>
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

      {/* 신규 기능: 프로젝트별 담당자 관리 및 필터링 섹션 */}
      <ProjectTaskManagement initialProjectId={project.id} />

      {/* API 실시간 연동 테스트 보드 */}
      <ApiTesterPanel />

      {/* 할 일 등록 모달 */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProjectId={project.id}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
