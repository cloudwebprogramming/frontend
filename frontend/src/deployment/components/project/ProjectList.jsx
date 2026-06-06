import { useState, useEffect } from 'react';
import { getProjects } from '../../api/taskApi';
import { deleteProject, updateProject } from '../../api/projectApi';
import './ProjectList.css';

export default function ProjectList({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', subject: '', description: '' });

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await getProjects();
      if (res.status === 200) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까? 관련 할 일도 모두 삭제될 수 있습니다.')) return;

    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || '알 수 없는 오류';
      alert('삭제 실패: ' + message);
    }
  };

  const startEdit = (e, project) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditForm({
      title: project.title ?? '',
      subject: project.subject ?? '',
      description: project.description ?? ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault?.();

    if (!editForm.title.trim()) {
      alert('프로젝트명을 입력해주세요.');
      return;
    }

    try {
      const res = await updateProject(editingProjectId, editForm);
      if (res.status === 200) {
        setEditingProjectId(null);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || err.message || '알 수 없는 오류';
      alert('수정 실패: ' + message);
    }
  };

  const handleCardClick = (project) => {
    if (editingProjectId) return;
    onSelectProject?.(project);
  };

  if (isLoading && projects.length === 0) return <div className="pl-loading">프로젝트 로딩 중...</div>;
  if (error) return <div className="pl-error">{error}</div>;

  return (
    <div className="pl-container">
      <h2 className="pl-title">내 프로젝트 목록</h2>
      <div className="pl-grid">
        {projects.length === 0 ? (
          <p className="pl-empty">참여 중인 프로젝트가 없습니다. 새 프로젝트를 생성하거나 참여해보세요!</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="pl-card"
            >
              {editingProjectId === project.id ? (
                <div className="pl-edit-form" onClick={(e) => e.stopPropagation()}>
                  <input
                    className="pl-edit-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="프로젝트명"
                  />
                  <input
                    className="pl-edit-input"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    placeholder="과목명"
                  />
                  <textarea
                    className="pl-edit-textarea"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="설명"
                  />
                  <div className="pl-edit-actions">
                    <button type="button" className="pl-btn-save" onClick={handleUpdate}>저장</button>
                    <button type="button" className="pl-btn-cancel" onClick={() => setEditingProjectId(null)}>취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pl-card-header">
                    <div className="pl-header-main">
                      {/* ✅ subject와 수정/삭제 버튼을 같은 줄에 배치 */}
                      <div className="pl-subject-row">
                        <span className="pl-subject">{project.subject}</span>
                        <div className="pl-card-actions">
                          <button className="pl-action-btn edit" onClick={(e) => startEdit(e, project)}>수정</button>
                          <button className="pl-action-btn delete" onClick={(e) => handleDelete(e, project.id)}>삭제</button>
                        </div>
                      </div>
                      <h3 className="pl-project-title">{project.title}</h3>
                    </div>
                  </div>
                  <div className="pl-card-body">
                    <p className="pl-description">{project.description || '설명이 없습니다.'}</p>
                  </div>
                  <div className="pl-card-footer">
                    <span className="pl-invite-code">코드: {project.inviteCode}</span>
                    <button className="pl-enter-btn"
                    onClick={() => handleCardClick(project)}>상세보기</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}