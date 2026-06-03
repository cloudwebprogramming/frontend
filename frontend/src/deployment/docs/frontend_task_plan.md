# 프론트엔드 세부 작업 계획서 (3단계 산출물)

이 문서는 역할 4(할 일 등록 및 분배) 프론트엔드 UI 컴포넌트 개발을 위해 쪼갠 세부 작업 계획서입니다.

---

## 1. 구현 대상 및 세부 계획

### [Task 1] API 어댑터 모듈 개발 및 환경 변수 구성
- **환경 변수 파일 신설**
  - 프론트엔드 프로젝트 루트(`frontend/frontend/`) 아래에 `.env.example` 및 `.env.local` 파일 생성.
  - `VITE_API_BASE_URL=http://localhost:8080` 선언.
- **API 함수 (`taskApi.js`)**: `createTask(projectId, taskData)`
- **Mock 처리 구조**:
  - 파일 내에 `const USE_MOCK = true` 상수를 정의합니다.
  - `USE_MOCK`이 true일 경우, 300ms 딜레이 후 생성된 Mock Task 객체(응답 DTO와 동일한 구조)를 리턴하는 `Promise` 함수를 구현합니다.
  - false일 경우, Axios 인스턴스 base URL에 `import.meta.env.VITE_API_BASE_URL` 환경 변수를 전달하여 백엔드 API 서버로 POST 요청을 전송하게 구성합니다.

### [Task 2] TaskFormModal 컴포넌트 개발 (`TaskFormModal.jsx`)
- **기본 구조**:
  - `isOpen` props가 false일 경우 `null`을 렌더링하고, true일 경우 포털(Portal)이나 오버레이 컨테이너를 렌더링합니다.
- **상태 정의**:
  - `formData` 상태를 객체 형태로 관리하여 각각의 input 컨트롤과 양방향 바인딩합니다.
  - API 제출 과정 동안의 Loading 상태(`isSubmitting`)를 관리합니다.
  - 유효성 에러 메시지 저장을 위한 `errors` 상태를 관리합니다.
- **예외 복원성**:
  - Props 수신 시 구조 분해 기본값을 지정하고 (`const { projectId = 1, onTaskCreated = () => {} } = props;`), API 성공 결과 바인딩 시 Optional Chaining(`response?.data?.taskId`)을 적용하여 런타임 크래시를 방지합니다.

### [Task 3] CSS 스타일 개발 (`TaskFormModal.css`)
- **레이아웃**: 화면 전체를 덮는 투명 오버레이와 그 중앙에 떠 있는 카드 레이아웃으로 모달을 구성합니다.
- **스타일링**:
  - 백그라운드 블러 및 투명도 조절로 세련된 UI 구성.
  - Input focus 효과, 버튼 마우스 호버 트랜지션 애니메이션 구현.
  - 폰트 스펙: 폰트 패밀리 Inter/Outfit 지정.

### [Task 4] App.jsx 단독 연동 테스트
- **테스트 환경**:
  - `src/App.jsx` 파일에 임시로 모달 열기 상태(`[isModalOpen, setIsModalOpen]`)와 모달 열기 버튼을 배치합니다.
  - 버튼 클릭 시 `TaskFormModal`이 팝업되고, 등록 폼을 통해 값을 입력한 뒤 제출하여 Mock 데이터 등록 성공 콜백(`onTaskCreated`)이 콘솔에 출력되는지 확인합니다.

---

## 2. [2라운드 추가] 2차 기능 보강 개발 계획 (Task 5~8)

### [Task 5] API 어댑터 고도화 및 프로젝트/멤버 Mock 연동 (`taskApi.js`)
- `getProjects()` 및 `getProjectMembers(projectId)` 구현.
- `USE_MOCK` 상태에 따라 Mock 데이터 셋과 Real API 호출 분기.

### [Task 6] 반응형 모달 스타일 개선 (`TaskFormModal.css`)
- `max-height: 85vh` 및 `overflow-y: auto` 적용.
- 소형 기기/고배율 줌 대응 미디어 쿼리 정의.

### [Task 7] 프로젝트/멤버 드롭박스 동적 바인딩 (`TaskFormModal.jsx`)
- 마운트 시 프로젝트 API 로딩 및 기본 선택(`initialProjectId`) 처리.
- 프로젝트 변경 시 멤버 API 로딩 및 담당자 드롭다운 실시간 교체 바인딩.

### [Task 8] 동적 카테고리 관리 기능 통합 (`CategoryManageSubForm.jsx`)
- 카테고리 관리 서브 모달 팝업 추가.
- 카테고리 추가/삭제 시 메인 폼 카테고리 드롭다운 실시간 동기화.

