import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskFormModal from './TaskFormModal';
import ProjectTaskManagement from './ProjectTaskManagement';
import { getProjects } from '../../api/taskApi'; // 프로젝트 정보를 다시 가져오기 위해 추가
import './TaskRegistrationDashboard.css';

export default function TaskRegistrationDashboard({ projectId }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. projectId가 바뀔 때마다 해당 프로젝트 정보를 백엔드에서 다시 가져옴 (F5 대응)
  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const res = await getProjects(); // 전체 목록에서 찾거나, 단일 조회 API가 있다면 그것을 사용
        if (res.status === 200) {
          const found = res.data.find(p => String(p.id) === String(projectId));
          setProject(found);
        }
      } catch (err) {
        console.error('프로젝트 정보를 불러오지 못했습니다.', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetail();
  }, [projectId]);

  const handleTaskCreated = (newTask) => {
    setCreatedTasks((prev) => [newTask, ...prev].slice(0, 4));
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) return <div style={{ padding: '24px' }}>로딩 중...</div>;
  if (!project) return <div style={{ padding: '24px' }}>프로젝트 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="trd-dashboard-container">
      <div className="trd-page-toolbar">
        <button type="button" className="trd-back-link" onClick={() => navigate('/')}>
          <span aria-hidden="true">&lt;-</span>
          목록
        </button>
      </div>

      <section className="trd-project-summary">
        <div>
          <span className="trd-eyebrow">{project.subject || '팀프로젝트'}</span>
          <h2 className="trd-project-title">{project.title}</h2>
          <p className="trd-project-desc">{project.description || '등록된 프로젝트 설명이 없습니다.'}</p>
        </div>
        <div className="trd-summary-side">
          <div className="trd-summary-meta">
            <span>멤버 {project.members?.length || 0}{project.memberCount ? `/${project.memberCount}` : ''}명</span>
            <span>{project.deadline ? `마감 ${project.deadline}` : '마감일 미정'}</span>
          </div>
          <button
            type="button"
            className="trd-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            + 새 할 일
          </button>
        </div>
      </section>

      {createdTasks.length > 0 && (
        <section className="trd-recent-strip">
          <h4 className="trd-list-title">방금 등록한 할 일</h4>
          <ul className="trd-task-list">
            {createdTasks.map((t, idx) => (
              <li key={idx} className="trd-task-item">
                <span className="trd-task-tag">[{t.category || '일반'}]</span>
                <strong className="trd-task-name">{t.title}</strong>
                <span className="trd-task-meta">
                  담당: {t.assignee || '담당자 미지정'} · <span className="trd-task-dday">{t.dday}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProjectTaskManagement initialProjectId={project.id} refreshKey={refreshKey} />

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
