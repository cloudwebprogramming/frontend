import { useState, useEffect } from 'react';
import { getProjects, getProjectMembers, getTasksFiltered, updateTaskAssignee } from '../../api/taskApi';
import './ProjectTaskManagement.css';

export default function ProjectTaskManagement() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. 프로젝트 목록 로드
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects();
        if (res.status === 200) {
          setProjects(res.data);
          if (res.data.length > 0) {
            setSelectedProjectId(res.data[0].id);
          }
        }
      } catch {
        setError('프로젝트 목록을 불러오는데 실패했습니다.');
      }
    };
    fetchProjects();
  }, []);

  // 2. 프로젝트 변경 시 멤버 및 할 일 목록 로드
  useEffect(() => {
    if (selectedProjectId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [memberRes, taskRes] = await Promise.all([
            getProjectMembers(selectedProjectId),
            getTasksFiltered(selectedProjectId, { assignee: selectedAssignee })
          ]);
          
          if (memberRes.status === 200) setMembers(memberRes.data);
          if (taskRes.status === 200) setTasks(taskRes.data);
        } catch {
          setError('데이터를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedProjectId, selectedAssignee]);

  const handleAssigneeUpdate = async (taskId, currentAssignee) => {
    const newAssignee = prompt('새로운 담당자 이름을 입력하세요 (비워두면 지정 취소):', currentAssignee || '');
    if (newAssignee === null) return; // 취소 버튼

    try {
      const res = await updateTaskAssignee(taskId, newAssignee);
      if (res.status === 200) {
        alert('담당자가 수정되었습니다.');
        // 목록 새로고침
        const taskRes = await getTasksFiltered(selectedProjectId, { assignee: selectedAssignee });
        if (taskRes.status === 200) setTasks(taskRes.data);
      }
    } catch (err) {
      alert('담당자 수정 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="ptm-container">
      <header className="ptm-header">
        <h3 className="ptm-title">프로젝트별 담당자 관리 및 필터링</h3>
        <p className="ptm-desc">팀원별 업무 배분 현황을 확인하고 수정할 수 있습니다.</p>
      </header>

      <div className="ptm-filter-bar">
        <div className="ptm-filter-group">
          <label htmlFor="ptm-project-select">프로젝트 선택</label>
          <select 
            id="ptm-project-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="ptm-select"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.subject}] {p.title}</option>
            ))}
          </select>
        </div>

        <div className="ptm-filter-group">
          <label htmlFor="ptm-assignee-select">담당자 필터</label>
          <select 
            id="ptm-assignee-select"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="ptm-select"
          >
            <option value="">전체 보기</option>
            {members.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="ptm-error">{error}</div>}

      <div className="ptm-task-list-wrapper">
        {isLoading ? (
          <div className="ptm-loading">데이터 로딩 중...</div>
        ) : tasks.length === 0 ? (
          <div className="ptm-empty">해당 조건에 맞는 할 일이 없습니다.</div>
        ) : (
          <table className="ptm-task-table">
            <thead>
              <tr>
                <th>카테고리</th>
                <th>할 일 제목</th>
                <th>담당자</th>
                <th>마감일</th>
                <th>D-Day</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.taskId} className="ptm-task-row">
                  <td><span className="ptm-tag">{t.category}</span></td>
                  <td className="ptm-task-title">{t.title}</td>
                  <td>{t.assignee || <span className="ptm-unassigned">미지정</span>}</td>
                  <td>{t.dueDate}</td>
                  <td><span className={`ptm-dday ${t.dday.includes('+') ? 'over' : ''}`}>{t.dday}</span></td>
                  <td>
                    <button 
                      className="ptm-btn-edit"
                      onClick={() => handleAssigneeUpdate(t.taskId, t.assignee)}
                    >
                      담당자 변경
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
