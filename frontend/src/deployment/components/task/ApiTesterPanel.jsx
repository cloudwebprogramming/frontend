import { useState, useEffect } from 'react';
import { 
  getProjects, 
  getProjectMembers, 
  createTask, 
  getTasksFiltered, 
  getProjectProgress, 
  getUrgentTasks 
} from '../../api/taskApi';
import './ApiTesterPanel.css';

export default function ApiTesterPanel() {
  const [activeTab, setActiveTab] = useState('GET_PROJECTS');
  const [loading, setLoading] = useState(false);
  const [responseState, setResponseState] = useState({
    status: null,
    body: null,
    isError: false
  });

  // 공통 프로젝트 ID 입력값 (기본값 1)
  const [projectId, setProjectId] = useState('1');

  // POST Task 입력 폼 데이터
  const [postTaskForm, setPostTaskForm] = useState({
    title: 'API 테스터 등록 태스크',
    description: 'API 테스트 패널을 통해 직접 등록한 할 일입니다.',
    assignee: '홍길동',
    category: '자료조사',
    priority: '높음',
    dueDate: new Date().toISOString().split('T')[0] // 오늘 날짜 기본
  });

  // GET Task 필터링/정렬 폼 데이터
  const [filterForm, setFilterForm] = useState({
    assignee: '',
    dueDate: '',
    priority: '',
    category: '',
    completed: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  });

  // 탭 변경 시 응답 창 초기화
  useEffect(() => {
    setResponseState({ status: null, body: null, isError: false });
  }, [activeTab]);

  // API 전송 핸들러
  const handleSendRequest = async () => {
    setLoading(true);
    setResponseState({ status: null, body: null, isError: false });

    try {
      let res;
      switch (activeTab) {
        case 'GET_PROJECTS':
          res = await getProjects();
          break;
        case 'GET_MEMBERS':
          if (!projectId.trim()) throw new Error('프로젝트 ID를 입력해주세요.');
          res = await getProjectMembers(projectId.trim());
          break;
        case 'POST_TASK':
          if (!projectId.trim()) throw new Error('프로젝트 ID를 입력해주세요.');
          res = await createTask(projectId.trim(), postTaskForm);
          break;
        case 'GET_TASKS':
          if (!projectId.trim()) throw new Error('프로젝트 ID를 입력해주세요.');
          // 빈 문자열 필드는 제외하고 전송
          const cleanParams = {};
          Object.keys(filterForm).forEach(key => {
            if (filterForm[key] !== '') {
              if (key === 'completed') {
                cleanParams[key] = filterForm[key] === 'true';
              } else {
                cleanParams[key] = filterForm[key];
              }
            }
          });
          res = await getTasksFiltered(projectId.trim(), cleanParams);
          break;
        case 'GET_PROGRESS':
          if (!projectId.trim()) throw new Error('프로젝트 ID를 입력해주세요.');
          res = await getProjectProgress(projectId.trim());
          break;
        case 'GET_URGENT':
          res = await getUrgentTasks();
          break;
        default:
          throw new Error('지원하지 않는 API 유형입니다.');
      }

      setResponseState({
        status: res.status ? `${res.status} OK` : '200 OK',
        body: JSON.stringify(res.data, null, 2),
        isError: false
      });
    } catch (err) {
      setResponseState({
        status: err.status ? `${err.status} Error` : 'FAIL',
        body: err.message || '서버 통신 실패 또는 에러가 발생했습니다.',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getEndpointInfo = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    switch (activeTab) {
      case 'GET_PROJECTS':
        return { method: 'GET', url: `${baseUrl}/api/v1/projects` };
      case 'GET_MEMBERS':
        return { method: 'GET', url: `${baseUrl}/api/v1/projects/${projectId || '{projectId}'}/members` };
      case 'POST_TASK':
        return { method: 'POST', url: `${baseUrl}/api/v1/projects/${projectId || '{projectId}'}/tasks` };
      case 'GET_TASKS':
        const queryArr = [];
        Object.keys(filterForm).forEach(k => {
          if (filterForm[k] !== '') queryArr.push(`${k}=${filterForm[k]}`);
        });
        const queryStr = queryArr.length > 0 ? `?${queryArr.join('&')}` : '';
        return { method: 'GET', url: `${baseUrl}/api/v1/projects/${projectId || '{projectId}'}/tasks${queryStr}` };
      case 'GET_PROGRESS':
        return { method: 'GET', url: `${baseUrl}/api/v1/projects/${projectId || '{projectId}'}/progress` };
      case 'GET_URGENT':
        return { method: 'GET', url: `${baseUrl}/api/v1/tasks/urgent` };
      default:
        return { method: 'GET', url: '' };
    }
  };

  const ep = getEndpointInfo();

  return (
    <div className="at-container">
      <div className="at-header">
        <h2 className="at-title">API 실시간 연동 테스트 보드</h2>
        <span className="at-badge">역할 4 / 2라운드</span>
      </div>

      {/* 탭 목록 */}
      <div className="at-tabs">
        <button 
          className={`at-tab-btn ${activeTab === 'GET_PROJECTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GET_PROJECTS')}
        >
          [GET] 전체 프로젝트 목록
        </button>
        <button 
          className={`at-tab-btn ${activeTab === 'GET_MEMBERS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GET_MEMBERS')}
        >
          [GET] 프로젝트 소속 멤버
        </button>
        <button 
          className={`at-tab-btn ${activeTab === 'POST_TASK' ? 'active' : ''}`}
          onClick={() => setActiveTab('POST_TASK')}
        >
          [POST] 새 할 일 생성
        </button>
        <button 
          className={`at-tab-btn ${activeTab === 'GET_TASKS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GET_TASKS')}
        >
          [GET] 할 일 필터 및 정렬 조회
        </button>
        <button 
          className={`at-tab-btn ${activeTab === 'GET_PROGRESS' ? 'active' : ''}`}
          onClick={() => setActiveTab('GET_PROGRESS')}
        >
          [GET] 프로젝트 진행률
        </button>
        <button 
          className={`at-tab-btn ${activeTab === 'GET_URGENT' ? 'active' : ''}`}
          onClick={() => setActiveTab('GET_URGENT')}
        >
          [GET] 마감 임박 목록
        </button>
      </div>

      <div className="at-grid">
        {/* 요청 설정 패널 (좌) */}
        <div className="at-panel-left">
          <div className="at-endpoint-info">
            <span className={`at-method-badge ${ep.method.toLowerCase()}`}>{ep.method}</span>
            <span className="at-endpoint-url">{ep.url}</span>
          </div>

          {/* 공통 프로젝트 ID 필드 노출 (특정 탭 제외) */}
          {activeTab !== 'GET_PROJECTS' && activeTab !== 'GET_URGENT' && (
            <div className="at-form-group">
              <label className="at-label">프로젝트 ID (projectId)</label>
              <input 
                type="number" 
                className="at-input"
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)} 
                placeholder="대상 프로젝트 ID 입력" 
              />
            </div>
          )}

          {/* POST_TASK 탭 특화 폼 */}
          {activeTab === 'POST_TASK' && (
            <div>
              <div className="at-form-group">
                <label className="at-label">할 일 제목</label>
                <input 
                  type="text" 
                  className="at-input"
                  value={postTaskForm.title} 
                  onChange={(e) => setPostTaskForm({...postTaskForm, title: e.target.value})} 
                />
              </div>
              <div className="at-form-group">
                <label className="at-label">상세 설명</label>
                <textarea 
                  className="at-textarea"
                  rows="2"
                  value={postTaskForm.description} 
                  onChange={(e) => setPostTaskForm({...postTaskForm, description: e.target.value})} 
                />
              </div>
              <div className="at-row">
                <div className="at-form-group">
                  <label className="at-label">담당자</label>
                  <input 
                    type="text" 
                    className="at-input"
                    value={postTaskForm.assignee} 
                    onChange={(e) => setPostTaskForm({...postTaskForm, assignee: e.target.value})} 
                  />
                </div>
                <div className="at-form-group">
                  <label className="at-label">카테고리</label>
                  <input 
                    type="text" 
                    className="at-input"
                    value={postTaskForm.category} 
                    onChange={(e) => setPostTaskForm({...postTaskForm, category: e.target.value})} 
                  />
                </div>
              </div>
              <div className="at-row">
                <div className="at-form-group">
                  <label className="at-label">우선순위</label>
                  <select 
                    className="at-select"
                    value={postTaskForm.priority}
                    onChange={(e) => setPostTaskForm({...postTaskForm, priority: e.target.value})}
                  >
                    <option value="높음">높음</option>
                    <option value="보통">보통</option>
                    <option value="낮음">낮음</option>
                  </select>
                </div>
                <div className="at-form-group">
                  <label className="at-label">마감일</label>
                  <input 
                    type="date" 
                    className="at-input"
                    value={postTaskForm.dueDate} 
                    onChange={(e) => setPostTaskForm({...postTaskForm, dueDate: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* GET_TASKS 탭 특화 폼 */}
          {activeTab === 'GET_TASKS' && (
            <div>
              <div className="at-row">
                <div className="at-form-group">
                  <label className="at-label">담당자 필터</label>
                  <input 
                    type="text" 
                    className="at-input" 
                    value={filterForm.assignee}
                    onChange={(e) => setFilterForm({...filterForm, assignee: e.target.value})}
                    placeholder="ex) 홍길동"
                  />
                </div>
                <div className="at-form-group">
                  <label className="at-label">카테고리 필터</label>
                  <input 
                    type="text" 
                    className="at-input" 
                    value={filterForm.category}
                    onChange={(e) => setFilterForm({...filterForm, category: e.target.value})}
                    placeholder="ex) 자료조사"
                  />
                </div>
              </div>
              <div className="at-row">
                <div className="at-form-group">
                  <label className="at-label">마감일 필터</label>
                  <input 
                    type="date" 
                    className="at-input" 
                    value={filterForm.dueDate}
                    onChange={(e) => setFilterForm({...filterForm, dueDate: e.target.value})}
                  />
                </div>
                <div className="at-form-group">
                  <label className="at-label">우선순위 필터</label>
                  <select 
                    className="at-select"
                    value={filterForm.priority}
                    onChange={(e) => setFilterForm({...filterForm, priority: e.target.value})}
                  >
                    <option value="">(전체)</option>
                    <option value="높음">높음</option>
                    <option value="보통">보통</option>
                    <option value="낮음">낮음</option>
                  </select>
                </div>
              </div>
              <div className="at-row">
                <div className="at-form-group">
                  <label className="at-label">완료 여부 필터</label>
                  <select 
                    className="at-select"
                    value={filterForm.completed}
                    onChange={(e) => setFilterForm({...filterForm, completed: e.target.value})}
                  >
                    <option value="">(전체)</option>
                    <option value="true">완료됨</option>
                    <option value="false">진행중</option>
                  </select>
                </div>
                <div className="at-form-group">
                  <label className="at-label">정렬 기준 (sortBy)</label>
                  <select 
                    className="at-select"
                    value={filterForm.sortBy}
                    onChange={(e) => setFilterForm({...filterForm, sortBy: e.target.value})}
                  >
                    <option value="dueDate">마감일 (dueDate)</option>
                    <option value="priority">우선순위 (priority)</option>
                    <option value="createdAt">생성일 (createdAt)</option>
                  </select>
                </div>
              </div>
              <div className="at-form-group">
                <label className="at-label">정렬 순서 (sortOrder)</label>
                <select 
                  className="at-select"
                  value={filterForm.sortOrder}
                  onChange={(e) => setFilterForm({...filterForm, sortOrder: e.target.value})}
                >
                  <option value="asc">오름차순 (asc)</option>
                  <option value="desc">내림차순 (desc)</option>
                </select>
              </div>
            </div>
          )}

          <button 
            type="button" 
            className="at-btn-submit"
            disabled={loading}
            onClick={handleSendRequest}
          >
            {loading ? '요청을 보내는 중...' : '요청 전송 (Send Request)'}
          </button>
        </div>

        {/* 결과 응답 패널 (우) */}
        <div className="at-panel-right">
          <div className="at-response-header">
            <h3 className="at-response-title">서버 응답 결과 (Response JSON)</h3>
            {responseState.status && (
              <span className={`at-status-pill ${responseState.isError ? 'error' : 'success'}`}>
                {responseState.status}
              </span>
            )}
          </div>
          <div className={`at-response-body ${responseState.isError ? 'error' : ''}`}>
            {loading ? (
              <div className="at-placeholder">서버 응답을 대기하는 중...</div>
            ) : responseState.body ? (
              <code>{responseState.body}</code>
            ) : (
              <div className="at-placeholder">상단의 요청 전송 버튼을 누르면 실시간 응답이 노출됩니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
