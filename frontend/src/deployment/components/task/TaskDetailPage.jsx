import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasksFiltered, updateTaskAssignee, updateTaskDetails, updateTaskStatus } from '../../api/taskApi';
import './TaskDetailPage.css';

function parseChecklist(items = []) {
  return items.map((item, index) => {
    const done = typeof item === 'string' && item.startsWith('[x] ');
    const text = typeof item === 'string' ? item.replace(/^\[(x| )\]\s/, '') : '';
    return { id: `${index}-${text}`, text, done };
  });
}

function serializeChecklist(items = []) {
  return items
    .filter((item) => item.text.trim())
    .map((item) => `${item.done ? '[x]' : '[ ]'} ${item.text.trim()}`);
}

export default function TaskDetailPage({ projectId, taskId }) {
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const assigneeOptions = [
    { label: '담당자 미지정', value: '' },
    { label: '전체', value: '전체' },
    { label: '홍길동', value: '홍길동' },
  ];
  const [detailNotes, setDetailNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const checklistProgress = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);
  }, [checklist]);

  useEffect(() => {
    const loadTask = async () => {
      setIsLoading(true);
      try {
        const taskRes = await getTasksFiltered(projectId);
        const found = taskRes.data.find((item) => String(item.taskId) === String(taskId));
        setTask(found || null);
        setDetailNotes(found?.detailNotes || '');
        setChecklist(parseChecklist(found?.checklist || []));
      } catch {
        setTask(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTask();
  }, [projectId, taskId]);

  const updateAssignee = async (assignee) => {
    if (!task) return;
    setTask((prev) => ({ ...prev, assignee }));
    try {
      const res = await updateTaskAssignee(task.taskId, assignee);
      if (res.status === 200) setTask((prev) => ({ ...prev, ...res.data }));
    } catch {
      setMessage('담당자 저장에 실패했습니다.');
    }
  };

  const updateStatus = async (status) => {
    if (!task) return;
    setTask((prev) => ({ ...prev, status, completed: status === '완료' }));
    try {
      const res = await updateTaskStatus(task.taskId, status);
      if (res.status === 200) setTask((prev) => ({ ...prev, ...res.data }));
    } catch {
      setMessage('상태 저장에 실패했습니다.');
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: `${Date.now()}-${newChecklistItem}`, text: newChecklistItem.trim(), done: false }
    ]);
    setNewChecklistItem('');
  };

  const saveDetails = async () => {
    if (!task) return;
    setIsSaving(true);
    setMessage('');
    try {
      const res = await updateTaskDetails(task.taskId, {
        detailNotes,
        checklist: serializeChecklist(checklist)
      });
      if (res.status === 200) {
        setTask((prev) => ({ ...prev, ...res.data }));
        setMessage('저장되었습니다.');
      }
    } catch {
      setMessage('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <main className="tdp-container"><div className="tdp-empty">할 일을 불러오는 중...</div></main>;
  }

  if (!task) {
    return <main className="tdp-container"><div className="tdp-empty">할 일을 찾을 수 없습니다.</div></main>;
  }

  return (
    <main className="tdp-container">
      <div className="tdp-page-toolbar">
        <button type="button" className="tdp-back-link" onClick={() => navigate(`/project/${projectId}`)}>
          <span aria-hidden="true">&lt;-</span>
          프로젝트로 돌아가기
        </button>
      </div>

      <section className="tdp-page">
        <div className="tdp-title-row">
          <div>
            <span className="tdp-eyebrow">{task.category || '일반'} · {task.dday || '-'}</span>
            <h2>{task.title}</h2>
            <p>{task.description || '등록된 설명이 없습니다.'}</p>
          </div>
          <button type="button" className="tdp-save-button" onClick={saveDetails} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>

        <div className="tdp-hero-metrics">
          <article>
            <span>상태</span>
            <strong>{task.status || (task.completed ? '완료' : '예정')}</strong>
          </article>
          <article>
            <span>마감</span>
            <strong>{task.dday || '-'}</strong>
          </article>
          <article>
            <span>체크리스트</span>
            <strong>{checklistProgress}%</strong>
          </article>
        </div>

        <div className="tdp-properties">
          <label>
            상태
            <select value={task.status || (task.completed ? '완료' : '예정')} onChange={(e) => updateStatus(e.target.value)}>
              <option value="예정">예정</option>
              <option value="진행">진행</option>
              <option value="완료">완료</option>
            </select>
          </label>
          <label>
            담당자
            <select value={task.assignee || ''} onChange={(e) => updateAssignee(e.target.value)}>
              {assigneeOptions.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            마감일
            <input type="text" value={task.dueDate || '미정'} readOnly />
          </label>
          <label>
            우선순위
            <input type="text" value={task.priority || '보통'} readOnly />
          </label>
          <label>
            체크리스트
            <input type="text" value={`${checklistProgress}%`} readOnly />
          </label>
        </div>

        <section className="tdp-section">
          <h3>정리 메모</h3>
          <textarea
            value={detailNotes}
            onChange={(e) => setDetailNotes(e.target.value)}
            placeholder="자료 링크, 회의 메모, 조사 결과, 참고 문장을 정리하세요."
          />
        </section>

        <section className="tdp-section">
          <div className="tdp-section-header">
            <h3>체크리스트</h3>
            <span>{checklistProgress}%</span>
          </div>

          <div className="tdp-checklist-add">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
              placeholder="새 체크리스트 항목"
            />
            <button type="button" onClick={addChecklistItem}>추가</button>
          </div>

          <div className="tdp-checklist">
            {checklist.length === 0 ? (
              <p className="tdp-checklist-empty">아직 체크리스트가 없습니다.</p>
            ) : (
              checklist.map((item) => (
                <div key={item.id} className="tdp-checklist-item">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setChecklist((prev) => prev.map((next) => (
                      next.id === item.id ? { ...next, done: !next.done } : next
                    )))}
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => setChecklist((prev) => prev.map((next) => (
                      next.id === item.id ? { ...next, text: e.target.value } : next
                    )))}
                  />
                  <button type="button" onClick={() => setChecklist((prev) => prev.filter((next) => next.id !== item.id))}>
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {message && <p className="tdp-message">{message}</p>}
      </section>
    </main>
  );
}
