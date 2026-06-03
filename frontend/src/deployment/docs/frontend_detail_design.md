# 프론트엔드 세부 구현 사항 및 인터페이스 설계서 (내부용)

- **작성일**: 2026-06-03
- **대상 범위**: 역할 4 프론트엔드 내부 상세 설계
- **보관 위치**: `frontend/frontend/src/deployment/docs/`

---

## 1. 디렉토리 및 컴포넌트 구조

모든 프론트엔드 작업물은 `src/deployment` 폴더 내에 격리 개발하여 다른 팀원들의 수정 영역과 파일 충돌을 방지합니다.

```
src/deployment
 ┣ api
 ┃ ┗ taskApi.js
 ┣ components
 ┃ ┗ task
 ┃   ┣ TaskFormModal.jsx
 ┃   ┗ TaskFormModal.css
 ┗ docs
   ┗ frontend_detail_design.md
```

또한, 프론트엔드 프로젝트 루트(`frontend/frontend/`)에 동적 환경 변수 구성을 위해 다음 파일들을 신설합니다:
- `.env.example` (협업 배포용 변수 구조 정리)
- `.env.local` (로컬 개발용 변수 세팅)

---

## 2. 세부 설계 및 구현 전략

### 2.1. API 호스트 주소의 동적 환경변수 처리
- **배경**: GitHub Codespace 등 클라우드 환경에서는 프론트/백엔드 서버의 도메인이 수시로 변경되므로 주소를 하드코딩해서는 안 됩니다.
- **적용**: `taskApi.js` 내에서 Axios 인스턴스 또는 fetch API 호출 시 base URL로 **`import.meta.env.VITE_API_BASE_URL`**을 참조하도록 구성합니다.
- **기본 설정**:
  - `VITE_API_BASE_URL`의 로컬 기본값은 `http://localhost:8080`입니다.
  - 이 값은 Git 관리 대상에서 제외되는 `.env.local` 파일에서 주입되며, 템플릿 파일인 `.env.example`을 제공하여 배포 환경에서 설정 가능하도록 돕습니다.

### 2.2. Axios 통신과 Mock 데이터의 손쉬운 전환 (`taskApi.js`)
- **API 어댑터 설계**: API 호출 로직을 컴포넌트 내부에서 직접 수행하지 않고 `taskApi.js` 파일에 위임합니다.
- **Mock 토글 기능**: `taskApi.js` 내부에 `USE_MOCK` 플래그를 두어, True일 때는 로컬 인메모리(setTimeout을 포함한 Promise 객체)로 동작하고 False일 때는 실제 Axios 네트워크 통신을 수행하도록 제어합니다.

### 2.3. 유연하고 강인한 컴포넌트 데이터 바인딩
- **구조 분해 기본값 적용**: 외부 혹은 상위 컴포넌트로부터 데이터를 전달받을 때 `const { projectId = 1 } = props;` 와 같이 디폴트 값을 명시적으로 처리하여 깨짐을 미연에 방지합니다.
- **Optional Chaining**: 백엔드 또는 Mock API로부터 전달받는 결과 데이터 처리 시 `response.data?.taskId` 또는 `response.data?.dday` 처럼 안전한 접근 연산자(`?.`)를 필수적으로 적용하여 예기치 못한 데이터 필드 유실에도 UI 크래시가 발생하지 않도록 합니다.

### 2.4. 현대적인 UI 디자인 및 스타일링 시스템 (`TaskFormModal.css`)
- **Vanilla CSS 제약사항 준수**: Tailwind CSS 등 외부 라이브러리를 사용하지 않고 Vanilla CSS 및 CSS Variables를 설계에 반영합니다.
- **비주얼 컨셉 (Glassmorphism & Overlay Theme)**:
  - 투명도가 가미된 배경과 미세한 테두리(`backdrop-filter: blur(12px)`)로 고급스럽고 트렌디한 느낌을 연출합니다.
  - 모달 오버레이 뒤쪽 배경을 어둡고 흐리게 만들어 사용자가 폼 입력에 온전히 집중할 수 있도록 돕습니다.
  - 입력 필드와 버튼에 부드러운 호버 애니메이션을 적용합니다.

---

## 3. [2라운드 추가] 2차 기능 추가 설계 및 구현 전략

### 3.1. 뷰포트 줌 및 반응형 모달 보정 스타일링
- **해결 스타일 설계 (`TaskFormModal.css`)**:
  - 모달 컨테이너(`tf-modal-container`):
    - `max-height: 85vh;` (화면 높이의 85%만 차지하게 제한)
    - `overflow-y: auto;` (내용이 넘칠 경우 모달 카드 내부에 세로 스크롤바 활성화)
  - 미디어 쿼리(`@media`): 뷰포트 높이가 600px 미만인 소형 환경이나 고비율 줌인 시 폼 레이아웃의 그리드를 한 줄 배치(Single Column)로 래핑하여 시인성 확보.

### 3.2. 프로젝트 및 멤버 드롭박스 동적 데이터 흐름
- **프로젝트 목록 Fetching**:
  - 모달 마운트 시 `taskApi.js`를 통해 전체 프로젝트 목록을 로드하여 프로젝트 선택 드롭다운 박스를 구성합니다.
- **멤버 목록 Fetching**:
  - 사용자가 프로젝트 드롭다운에서 프로젝트를 선택/변경할 때마다 해당 프로젝트 ID를 인자로 하여 `taskApi.js`를 호출, 해당 프로젝트의 소속 멤버 목록을 비동기 조회하여 담당자(`assignee`) 드롭다운에 실시간 업데이트 바인딩합니다.
- **Mock 데이터 주입 (`taskApi.js`)**:
  - `USE_MOCK`이 true일 때 프로젝트 목록(2개)과 각 프로젝트별 팀원 목록을 모킹 프로미스로 반환하여 로컬 테스트 가능성 확보.

### 3.3. 동적 카테고리 관리 기능 (Sub-Form 모달)
- **UI 흐름**:
  - 카테고리 선택 드롭다운 옆에 조그마한 `[관리]` 버튼을 둡니다.
  - 클릭 시 `CategoryManageSubForm` 컴포넌트가 모달 내부에 떠오르거나(서브 오버레이) 하단에 확장 노출됩니다.
- **로컬 상태 동적 변경**:
  - 사용자가 새 카테고리를 텍스트로 추가하거나 기존 카테고리를 삭제하면, 로컬 컴포넌트의 카테고리 배열 상태(`categories`)를 변경하고, 메인 폼의 카테고리 선택 값도 갱신합니다.

