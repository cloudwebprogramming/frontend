import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createProject, joinProjectByCode } from '../../api/projectApi';
import './ProjectModal.css';

/**
 * 역할 2: 프로젝트 등록 / 초대 코드 참여 모달
 * props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onProjectCreated: (project) => void   // 생성 성공 콜백
 *  - onProjectJoined: (project) => void    // 참여 성공 콜백
 */
export default function ProjectModal(props) {
  const {
    isOpen = false,
    onClose = () => {},
    onProjectCreated = () => {},
    onProjectJoined = () => {},
  } = props;

  const [tab, setTab] = useState('create'); // 'create' | 'join'

  // 생성 폼 상태
  const initialCreateForm = { title: '', subject: '', description: '', creatorUsername: '' };
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  // 참여 폼 상태
  const initialJoinForm = { inviteCode: '', username: '' };
  const [joinForm, setJoinForm] = useState(initialJoinForm);
  const [joinedProject, setJoinedProject] = useState(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetAll = () => {
    setCreateForm(initialCreateForm);
    setJoinForm(initialJoinForm);
    setCreatedInviteCode('');
    setJoinedProject(null);
    setCopied(false);
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const switchTab = (next) => {
    setTab(next);
    setError('');
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!createForm.title.trim()) {
      setError('프로젝트명은 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: createForm.title.trim(),
        subject: createForm.subject.trim(),
        description: createForm.description.trim(),
      };
      // 생성자 아이디는 선택값. 입력 시에만 전송(존재하는 사용자여야 함)
      if (createForm.creatorUsername.trim()) {
        payload.creatorUsername = createForm.creatorUsername.trim();
      }

      const res = await createProject(payload);
      if (res?.status === 201) {
        setCreatedInviteCode(res.data?.inviteCode || '');
        onProjectCreated(res.data);
      }
    } catch (err) {
      setError(err?.message || '프로젝트 등록 중 에러가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!joinForm.inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }
    if (!joinForm.username.trim()) {
      setError('참여할 사용자 아이디를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await joinProjectByCode(joinForm.inviteCode.trim(), joinForm.username.trim());
      if (res?.status === 200) {
        setJoinedProject(res.data);
        onProjectJoined(res.data);
      }
    } catch (err) {
      setError(err?.message || '프로젝트 참여 중 에러가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(createdInviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('클립보드 복사에 실패했습니다. 코드를 직접 복사해주세요.');
    }
  };

  return createPortal(
    <div className="pf-modal-overlay" onClick={handleClose}>
      <div className="pf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pf-modal-header">
          <h2 className="pf-modal-title">팀플 프로젝트</h2>
          <button type="button" className="pf-close-btn" onClick={handleClose}>&times;</button>
        </div>

        <div className="pf-tabs">
          <button
            type="button"
            className={`pf-tab ${tab === 'create' ? 'pf-tab-active' : ''}`}
            onClick={() => switchTab('create')}
          >
            새 프로젝트 만들기
          </button>
          <button
            type="button"
            className={`pf-tab ${tab === 'join' ? 'pf-tab-active' : ''}`}
            onClick={() => switchTab('join')}
          >
            초대 코드로 참여
          </button>
        </div>

        {/* 새 프로젝트 만들기 탭 */}
        {tab === 'create' && (
          createdInviteCode ? (
            <div className="pf-success">
              <p className="pf-success-msg">프로젝트가 생성되었습니다! 🎉</p>
              <p className="pf-success-sub">아래 초대 코드를 팀원에게 공유하세요.</p>
              <div className="pf-invite-box">
                <span className="pf-invite-code">{createdInviteCode}</span>
                <button type="button" className="pf-copy-btn" onClick={handleCopy}>
                  {copied ? '복사됨!' : '복사'}
                </button>
              </div>
              {error && <div className="pf-error-msg">{error}</div>}
              <div className="pf-actions">
                <button type="button" className="pf-btn pf-btn-cancel" onClick={handleClose}>닫기</button>
                <button
                  type="button"
                  className="pf-btn pf-btn-submit"
                  onClick={() => { setCreatedInviteCode(''); setCreateForm(initialCreateForm); }}
                >
                  새로 만들기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit}>
              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-title">프로젝트명</label>
                <input
                  type="text"
                  id="pf-title"
                  name="title"
                  className="pf-input"
                  value={createForm.title}
                  onChange={handleCreateChange}
                  placeholder="예: 클라우드기반웹개발 팀프로젝트"
                />
              </div>

              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-subject">과목명</label>
                <input
                  type="text"
                  id="pf-subject"
                  name="subject"
                  className="pf-input"
                  value={createForm.subject}
                  onChange={handleCreateChange}
                  placeholder="예: 클라우드기반웹개발"
                />
              </div>

              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-description">프로젝트 설명</label>
                <textarea
                  id="pf-description"
                  name="description"
                  className="pf-textarea"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                />
              </div>

              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-creator">생성자 아이디 (선택)</label>
                <input
                  type="text"
                  id="pf-creator"
                  name="creatorUsername"
                  className="pf-input"
                  value={createForm.creatorUsername}
                  onChange={handleCreateChange}
                  placeholder="입력 시 생성자가 멤버로 자동 등록됩니다"
                />
              </div>

              {error && <div className="pf-error-msg">{error}</div>}

              <div className="pf-actions">
                <button type="button" className="pf-btn pf-btn-cancel" disabled={isSubmitting} onClick={handleClose}>취소</button>
                <button type="submit" className="pf-btn pf-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? '생성 중...' : '프로젝트 생성'}
                </button>
              </div>
            </form>
          )
        )}

        {/* 초대 코드로 참여 탭 */}
        {tab === 'join' && (
          joinedProject ? (
            <div className="pf-success">
              <p className="pf-success-msg">참여 완료! 🎉</p>
              <p className="pf-success-sub">
                <strong>{joinedProject.title}</strong> 프로젝트에 참여했습니다.
              </p>
              <div className="pf-actions">
                <button type="button" className="pf-btn pf-btn-cancel" onClick={handleClose}>닫기</button>
                <button
                  type="button"
                  className="pf-btn pf-btn-submit"
                  onClick={() => { setJoinedProject(null); setJoinForm(initialJoinForm); }}
                >
                  다른 코드로 참여
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoinSubmit}>
              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-invite">초대 코드</label>
                <input
                  type="text"
                  id="pf-invite"
                  name="inviteCode"
                  className="pf-input"
                  value={joinForm.inviteCode}
                  onChange={handleJoinChange}
                  placeholder="예: INV-AB12CD"
                />
              </div>

              <div className="pf-form-group">
                <label className="pf-label" htmlFor="pf-username">내 아이디</label>
                <input
                  type="text"
                  id="pf-username"
                  name="username"
                  className="pf-input"
                  value={joinForm.username}
                  onChange={handleJoinChange}
                  placeholder="가입된 사용자 아이디를 입력하세요"
                />
              </div>

              {error && <div className="pf-error-msg">{error}</div>}

              <div className="pf-actions">
                <button type="button" className="pf-btn pf-btn-cancel" disabled={isSubmitting} onClick={handleClose}>취소</button>
                <button type="submit" className="pf-btn pf-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? '참여 중...' : '참여하기'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>,
    document.body
  );
}
