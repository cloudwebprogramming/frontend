import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjectMembers, getTasksFiltered, updateTaskStatus } from '../../api/taskApi';
import { getUser } from '../../api/authApi';
import './ProjectTaskManagement.css';

function getTaskState(task) {
  if (task.status) return task.status;
  return task.completed ? '완료' : '예정';
}

function getChecklistProgress(task) {
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const total = checklist.filter((item) => typeof item === 'string' && item.trim()).length;
  if (total === 0) return { total: 0, done: 0, percent: 0 };
  const done = checklist.filter((item) => typeof item === 'string' && item.startsWith('[x] ')).length;
  return {
    total,
    done,
    percent: Math.round((done / total) * 100)
  };
}

function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

export default function ProjectTaskManagement({ initialProjectId, refreshKey = 0 }) {
  const projectId = initialProjectId;
  const navigate = useNavigate();
  const currentUser = getUser();
  const currentUserName = currentUser?.name || currentUser?.username || currentUser?.email || '홍길동';

  const [activeView, setActiveView] = useState('tasks');
  const [members, setMembers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const visibleTasks = useMemo(() => {
    return sortByDueDate(tasks.filter((task) => {
      const assigneeMatched = !selectedAssignee || task.assignee === selectedAssignee;
      const statusMatched = !selectedStatus || getTaskState(task) === selectedStatus;
      return assigneeMatched && statusMatched;
    }));
  }, [tasks, selectedAssignee, selectedStatus]);
  const scheduledTasks = tasks.filter((task) => getTaskState(task) === '예정').length;
  const inProgressTasks = tasks.filter((task) => getTaskState(task) === '진행').length;
  const completedTasks = tasks.filter((task) => getTaskState(task) === '완료').length;

  const loadWorkspace = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [memberRes, taskRes] = await Promise.all([
        getProjectMembers(projectId),
        getTasksFiltered(projectId)
      ]);

      if (memberRes.status === 200) {
        const rawMembers = memberRes.data || [];
        setMembers(rawMembers.includes(currentUserName) ? rawMembers : [currentUserName, ...rawMembers]);
      }
      if (taskRes.status === 200) setTasks(taskRes.data);
    } catch {
      setError('할 일 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [projectId, refreshKey]);

  const openTaskPage = (task) => {
    navigate(`/project/${projectId}/tasks/${task.taskId}`);
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    setTasks((prev) => prev.map((task) => (
      task.taskId === taskId ? { ...task, status: nextStatus, completed: nextStatus === '완료' } : task
    )));

    try {
      const res = await updateTaskStatus(taskId, nextStatus);
      if (res.status === 200) {
        setTasks((prev) => prev.map((task) => (
          task.taskId === taskId ? { ...task, ...res.data } : task
        )));
      }
    } catch {
      setError('상태 변경에 실패했습니다.');
      await loadWorkspace();
    }
  };

  return (
    <div className="ptm-container">
      <header className="ptm-header">
        <div>
          <h3 className="ptm-title">프로젝트 워크스페이스</h3>
          <p className="ptm-desc">일정표와 업무 데이터베이스를 나눠 보고, 각 할 일은 내부 페이지에서 정리하세요.</p>
        </div>
        <div className="ptm-header-controls">
          <div className="ptm-view-tabs" aria-label="보기 전환">
            <button type="button" className={activeView === 'tasks' ? 'active' : ''} onClick={() => setActiveView('tasks')}>
              할 일
            </button>
            <button type="button" className={activeView === 'schedule' ? 'active' : ''} onClick={() => setActiveView('schedule')}>
              일정표
            </button>
          </div>
          <div className="ptm-view-tabs status-tabs" aria-label="상태 필터">
            {['', '예정', '진행', '완료'].map((status) => (
              <button
                type="button"
                key={status || 'all'}
                className={selectedStatus === status ? 'active' : ''}
                onClick={() => setSelectedStatus(status)}
              >
                {status || '전체'}
              </button>
            ))}
          </div>
          <div className="ptm-filter-group">
            <label htmlFor="ptm-assignee-select">담당자</label>
            <select
              id="ptm-assignee-select"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="ptm-select"
            >
              <option value="">전체</option>
              <option value={currentUserName}>내 업무</option>
              {members
                .filter((member) => member !== currentUserName)
                .map((member) => (
                  <option key={member} value={member}>{member}</option>
                ))}
            </select>
          </div>
        </div>
      </header>

      <section className="ptm-metrics">
        <article>
          <span>전체 할 일</span>
          <strong>{tasks.length}</strong>
        </article>
        <article>
          <span>예정</span>
          <strong>{scheduledTasks}</strong>
        </article>
        <article>
          <span>진행</span>
          <strong>{inProgressTasks}</strong>
        </article>
        <article>
          <span>완료</span>
          <strong>{completedTasks}</strong>
        </article>
      </section>

      {error && <div className="ptm-error">{error}</div>}

      {activeView === 'tasks' ? (
        <section className="ptm-database">
          <div className="ptm-table-header">
            <span className="ptm-col-status">상태</span>
            <span className="ptm-col-title">할 일</span>
            <span className="ptm-col-assignee">담당자</span>
            <span className="ptm-col-priority">우선순위</span>
            <span className="ptm-col-due">마감</span>
          </div>

          {isLoading ? (
            <div className="ptm-empty">데이터 로딩 중...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="ptm-empty">아직 등록된 할 일이 없습니다.</div>
          ) : (
            visibleTasks.map((task) => (
              <div key={task.taskId} className="ptm-table-row" onClick={() => openTaskPage(task)} role="button" tabIndex={0}>
                <select
                  className={`ptm-status-select ptm-col-status state-${getTaskState(task)}`}
                  value={getTaskState(task)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(task.taskId, e.target.value)}
                >
                  <option value="예정">예정</option>
                  <option value="진행">진행</option>
                  <option value="완료">완료</option>
                </select>
                <div className="ptm-task-title-cell ptm-col-title">
                  <strong>{task.title}</strong>
                  {getTaskState(task) === '진행' && (
                    <div className="ptm-check-progress" aria-label={`체크리스트 진행률 ${getChecklistProgress(task).percent}%`}>
                      <div className="ptm-check-progress-meta">
                        <span>{getChecklistProgress(task).done}/{getChecklistProgress(task).total} · {getChecklistProgress(task).percent}%</span>
                      </div>
                      <div className="ptm-check-progress-track">
                        <div className="ptm-check-progress-fill" style={{ width: `${getChecklistProgress(task).percent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <span className="ptm-col-assignee">{task.assignee || '담당자 미지정'}</span>
                <span className="ptm-col-priority">{task.priority || '보통'}</span>
                <span className={`ptm-col-due ${task.dday?.includes('+') ? 'ptm-overdue' : ''}`}>{task.dueDate || '미정'} · {task.dday || '-'}</span>
              </div>
            ))
          )}
        </section>
      ) : (
        <section className="ptm-schedule">
          {isLoading ? (
            <div className="ptm-empty">일정 로딩 중...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="ptm-empty">일정표에 표시할 할 일이 없습니다.</div>
          ) : (
            visibleTasks.map((task) => (
              <button type="button" key={task.taskId} className="ptm-schedule-row" onClick={() => openTaskPage(task)}>
                <time>{task.dueDate || '마감 미정'}</time>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.assignee || '담당자 미지정'} · {task.category || '일반'} · {task.dday || '-'}</p>
                </div>
                <span className={`ptm-state state-${getTaskState(task)}`}>{getTaskState(task)}</span>
              </button>
            ))
          )}
        </section>
      )}
    </div>
  );
}
