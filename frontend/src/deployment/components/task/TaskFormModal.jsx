import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createTask } from '../../api/taskApi';
import CategoryManageSubForm from './CategoryManageSubForm';
import './TaskFormModal.css';

export default function TaskFormModal(props) {
  // 예외 방지 및 유연성을 위한 구조분해 기본값 할당
  const {
    isOpen = false,
    onClose = () => { },
    initialProjectId = 1,
    onTaskCreated = () => { }
  } = props;

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const assigneeOptions = [
    { label: '담당자 미지정', value: '' },
    { label: '전체', value: '전체' },
    { label: '홍길동', value: '홍길동' },
  ];

  // 카테고리 목록 동적 관리 상태 (기본값 설정 및 로컬스토리지 영속성 보조)
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('tf_categories');
    return saved ? JSON.parse(saved) : ['자료조사', '보고서', '발표자료', '프론트엔드', '백엔드', '디자인', '최종검토'];
  });
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // 입력 양식 초기 상태 정의
  const initialFormState = {
    title: '',
    description: '',
    assignee: '',
    category: '',
    priority: '보통',
    dueDate: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(initialProjectId);
    }
  }, [isOpen, initialProjectId]);

  // 3. 카테고리 목록 변경 시 로컬 스토리지에 영속 보관 및 기본 카테고리 바인딩
  useEffect(() => {
    localStorage.setItem('tf_categories', JSON.stringify(categories));
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]
      }));
    }
  }, [categories, formData.category]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = '할 일 제목은 필수 입력 항목입니다.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = '마감일은 필수 입력 항목입니다.';
    } else {
      const selectedDate = new Date(formData.dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = '마감일은 오늘 또는 오늘 이후의 날짜만 가능합니다.';
      }
    }

    if (!selectedProjectId) {
      newErrors.project = '배분할 프로젝트를 선택해야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccessMsg('');

    try {
      // 선택된 프로젝트 ID 기반으로 API 어댑터 호출
      const response = await createTask(selectedProjectId, formData);

      if (response?.status === 201) {
        setSubmitSuccessMsg('할 일이 정상적으로 등록되었습니다!');
        onTaskCreated(response?.data);

        setTimeout(() => {
          setFormData(initialFormState);
          setSubmitSuccessMsg('');
          onClose();
        }, 1000);
      }
    } catch (err) {
      setErrors({
        submit: err?.message || '할 일 등록 중 에러가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카테고리 추가/삭제 이벤트 핸들러
  const handleAddCategory = (newCat) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (catToDelete) => {
    setCategories(prev => {
      const filtered = prev.filter(c => c !== catToDelete);
      if (formData.category === catToDelete) {
        setFormData(f => ({ ...f, category: filtered[0] || '' }));
      }
      return filtered;
    });
  };

  return createPortal(
    <div className="tf-modal-overlay" onClick={onClose}>
      <div className="tf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="tf-modal-header">
          <h2 className="tf-modal-title">새 할 일 등록</h2>
          <button type="button" className="tf-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tf-form-group">
            <label className="tf-label" htmlFor="tf-title">할 일 제목</label>
            <input
              type="text"
              id="tf-title"
              name="title"
              className="tf-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="해야 할 일을 입력하세요"
            />
            {errors.title && <span className="tf-error-msg">{errors.title}</span>}
          </div>

          <div className="tf-form-group">
            <label className="tf-label" htmlFor="tf-description">상세 설명</label>
            <textarea
              id="tf-description"
              name="description"
              className="tf-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="세부적인 수행 내용을 설명해 주세요"
            />
          </div>

          <div className="tf-row">
            {/* [2라운드 요구] 팀원 목록 드롭다운으로 변경 */}
            <div className="tf-form-group">
              <label className="tf-label" htmlFor="tf-assignee">담당자 지정</label>
              <select
                id="tf-assignee"
                name="assignee"
                className="tf-select"
                value={formData.assignee}
                onChange={handleChange}
              >
                {assigneeOptions.map((option) => (
                  <option key={option.label} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* [2라운드 요구] 동적 카테고리 관리 서브 모달 버튼 배치 */}
            <div className="tf-form-group">
              <label className="tf-label" htmlFor="tf-category">카테고리</label>
              <div className="tf-select-container">
                <select
                  id="tf-category"
                  name="category"
                  className="tf-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="tf-manage-btn"
                  onClick={() => setIsCatModalOpen(true)}
                >
                  관리
                </button>
              </div>
            </div>
          </div>

          <div className="tf-row">
            <div className="tf-form-group">
              <label className="tf-label" htmlFor="tf-dueDate">마감일</label>
              <input
                type="date"
                id="tf-dueDate"
                name="dueDate"
                className="tf-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
              {errors.dueDate && <span className="tf-error-msg">{errors.dueDate}</span>}
            </div>

            <div className="tf-form-group">
              <span className="tf-label">우선순위</span>
              <div className="tf-radio-group">
                {['높음', '보통', '낮음'].map((level) => (
                  <div key={level}>
                    <input
                      type="radio"
                      id={`tf-prio-${level}`}
                      name="priority"
                      value={level}
                      className="tf-radio-input"
                      checked={formData.priority === level}
                      onChange={handleChange}
                    />
                    <label htmlFor={`tf-prio-${level}`} className="tf-radio-label">
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {errors.submit && <div className="tf-error-msg" style={{ marginTop: '10px' }}>{errors.submit}</div>}
          {submitSuccessMsg && <div style={{ color: '#34d399', fontSize: '0.9rem', marginTop: '10px', fontWeight: 600 }}>{submitSuccessMsg}</div>}

          <div className="tf-actions">
            <button
              type="button"
              className="tf-btn tf-btn-cancel"
              disabled={isSubmitting}
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="tf-btn tf-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>

        {/* 카테고리 관리 동적 서브 팝업 */}
        <CategoryManageSubForm
          isOpen={isCatModalOpen}
          categories={categories}
          onClose={() => setIsCatModalOpen(false)}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>,
    document.body
  );
}
