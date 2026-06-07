import { useState, useEffect } from 'react';
import TaskFormModal from './TaskFormModal';
import ApiTesterPanel from './ApiTesterPanel';
import ProjectTaskManagement from './ProjectTaskManagement';
import { getProjects } from '../../api/taskApi'; // 프로젝트 정보를 다시 가져오기 위해 추가
import './TaskRegistrationDashboard.css';

export default function TaskRegistrationDashboard({ projectId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setCreatedTasks((prev) => [...prev, newTask]);
  };

  if (isLoading) return <div style={{ padding: '24px' }}>로딩 중...</div>;
  if (!project) return <div style={{ padding: '24px' }}>프로젝트 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="trd-dashboard-container">
      <section className="trd-trigger-section">
        <div className="trd-trigger-card">
          <h3 className="trd-card-title">[{project.title}] 할 일 등록</h3>
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
