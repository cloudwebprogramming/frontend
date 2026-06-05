import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './AssigneeEditModal.css';

export default function AssigneeEditModal({ isOpen, onClose, task, members, onUpdate }) {
  const [newAssignee, setNewAssignee] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      setNewAssignee(task.assignee || '');
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(task.taskId, newAssignee);
    onClose();
  };

  return createPortal(
    <div className="aem-overlay" onClick={onClose}>
      <div className="aem-container" onClick={(e) => e.stopPropagation()}>
        <div className="aem-header">
          <h3 className="aem-title">담당자 수정</h3>
          <button className="aem-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="aem-task-info">
          <span className="aem-task-label">할 일:</span>
          <span className="aem-task-name">{task?.title}</span>
        </div>

        <form onSubmit={handleSubmit} className="aem-form">
          <div className="aem-form-group">
            <label htmlFor="aem-assignee-select" className="aem-label">새로운 담당자 선택</label>
            <select
              id="aem-assignee-select"
              className="aem-select"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            >
              <option value="">(담당자 미지정)</option>
              {members.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="aem-help-text">프로젝트에 등록된 팀원 목록에서 선택할 수 있습니다.</p>
          </div>

          <div className="aem-actions">
            <button type="button" className="aem-btn aem-btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="aem-btn aem-btn-submit">변경 완료</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
