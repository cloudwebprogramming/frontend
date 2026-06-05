import { useState } from 'react';
import ProjectModal from './ProjectModal';

/**
 * 역할 2: 메인 페이지에 갖다 붙이는 진입 버튼 컴포넌트.
 * 버튼을 누르면 프로젝트 등록/참여 모달이 열린다.
 *
 * props:
 *  - label: 버튼 텍스트 (기본값 '+ 새 프로젝트')
 *  - onProjectCreated: (project) => void  // 생성 성공 시 상위로 전달
 *  - onProjectJoined: (project) => void   // 참여 성공 시 상위로 전달
 *  - className: 외부 버튼 스타일 커스터마이즈용 (선택)
 */
export default function ProjectEntryButton(props) {
  const {
    label = '+ 새 프로젝트',
    onProjectCreated = () => {},
    onProjectJoined = () => {},
    className = '',
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </button>

      <ProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onProjectCreated={onProjectCreated}
        onProjectJoined={onProjectJoined}
      />
    </>
  );
}
