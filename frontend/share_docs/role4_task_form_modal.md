# [역할 4] 할일 등록 및 분배 컴포넌트 연동 명세 (2라운드)

이 문서는 역할 4(할 일 등록 및 분배) 프론트엔드 UI 컴포넌트를 타 화면(프로젝트 상세, 사이드바, 상단 탭 등)에 안전하게 삽입하기 위한 연동 명세입니다.

---

## 1. TaskFormModal 컴포넌트 통합 가이드

- **컴포넌트 경로**: `src/deployment/components/task/TaskFormModal.jsx`
- **디자인 형식**: 화면 뷰포트 크기 및 브라우저 줌 확대/축소율에 유연하게 대응하는 **반응형 모달 오버레이**입니다.

### 1.1. Props 명세

상위 컴포넌트에서 `TaskFormModal`을 임포트하여 아래와 같이 호출합니다.

```jsx
import { useState } from 'react';
import TaskFormModal from './deployment/components/task/TaskFormModal';

function ProjectDetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>할 일 분배하기</button>

      <TaskFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialProjectId={1} // (선택) 모달 열릴 때 기본 선택되어 있을 프로젝트 ID
        onTaskCreated={(newTask) => {
          console.log('등록된 신규 할 일 객체:', newTask);
          // 이후 프로젝트 상세 목록 상태 업데이트 로직 처리
        }} 
      />
    </div>
  );
}
```

| Prop명 | 타입 | 필수 여부 | 설명 | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `isOpen` | Boolean | **필수** | 모달의 팝업 노출 상태 제어 | true: 팝업 노출, false: 닫힘 |
| `onClose` | Function | **필수** | 모달 내부의 닫기, 취소, 오버레이 클릭 시 상위 `isOpen` 상태를 false로 바꾸기 위한 콜백 | |
| `initialProjectId` | Number | 선택 | 모달 진입 시 드롭다운에서 최초로 선택되어 있을 프로젝트 ID | 생략 시 첫 번째 프로젝트 자동 선택 |
| `onTaskCreated` | Function | 선택 | 등록 완료 시 백엔드 응답 데이터(Response DTO)를 수신받는 콜백 | 생성 완료된 Task 객체가 인자로 전달됨 |

---

## 2. 모달 내 데이터 연동 의존성 (협업 필수 사항)

이 모달은 단독 구동 시 내부적으로 아래 API들을 호출하여 드롭다운 및 선택 옵션을 동적으로 완성합니다. 따라서 타 파트 개발자는 아래 명시된 필드 구조로 API 응답을 반환해 주어야 모달 내 목록이 정상 노출됩니다.

1. **프로젝트 선택 드롭박스 채우기**:
   - 호출 API: `GET /api/v1/projects`
   - 필수 매핑 필드: `id` (value 매핑), `title` (드롭다운 label 매핑)
2. **담당자 지정 드롭박스 채우기**:
   - 호출 API: `GET /api/v1/projects/{projectId}/members`
   - 필수 매핑 필드: `username` (value 및 label 매핑)

---

## 3. CSS 스타일 및 뷰포트 충돌 방지 안내

- **클래스명 격리**: 모든 모달 관련 스타일은 `.tf-modal-container`, `.tf-modal-overlay`, `.tf-input` 등 `tf-` 프리픽스로 캡슐화되어 있습니다. 다른 팀원들이 정의한 전역 클래스명과 충돌을 일으키지 않습니다.
- **모달 잘림/반응성 대책**:
  - 모달 컨테이너에 `max-height: 85vh; overflow-y: auto;`가 선언되어 있어 화면 해상도가 작거나 고배율로 확대되어도 폼이 화면 밑으로 잘려 나가지 않고 모달 내부 스크롤로 해결됩니다.
  - 최상위 z-index는 `1000`으로 잡혀 있습니다. 다른 오버레이 요소(예: 헤더 네비게이션바 등)가 모달을 덮지 않도록 z-index 조율이 필요합니다.
