import { useState } from 'react';
import './CategoryManageSubForm.css';

export default function CategoryManageSubForm(props) {
  const {
    isOpen = false,
    categories = [],
    onClose = () => {},
    onAddCategory = () => {},
    onDeleteCategory = () => {},
  } = props;

  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat?.trim()) {
      setError('카테고리 이름을 입력하세요.');
      return;
    }
    if (categories.includes(newCat.trim())) {
      setError('이미 존재하는 카테고리입니다.');
      return;
    }
    onAddCategory(newCat.trim());
    setNewCat('');
    setError('');
  };

  return (
    <div className="tf-sub-overlay" onClick={onClose}>
      <div className="tf-sub-container" onClick={(e) => e.stopPropagation()}>
        <div className="tf-sub-header">
          <h4 className="tf-sub-title">카테고리 목록 관리</h4>
          <button type="button" className="tf-sub-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleAdd} className="tf-sub-add-form">
          <input
            type="text"
            className="tf-input"
            value={newCat}
            onChange={(e) => {
              setNewCat(e.target.value);
              if (error) setError('');
            }}
            placeholder="새 카테고리 이름"
            style={{ padding: '8px 10px', fontSize: '0.85rem' }}
          />
          <button type="submit" className="tf-manage-btn" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
            추가
          </button>
        </form>
        {error && <div className="tf-error-msg" style={{ marginBottom: '10px' }}>{error}</div>}

        <div className="tf-sub-list-container">
          <ul className="tf-sub-list">
            {categories.map((cat) => (
              <li key={cat} className="tf-sub-item">
                <span>{cat}</span>
                <button
                  type="button"
                  className="tf-sub-del-btn"
                  onClick={() => onDeleteCategory(cat)}
                  title="삭제"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
