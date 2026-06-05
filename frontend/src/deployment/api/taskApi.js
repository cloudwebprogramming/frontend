// 역할 4 API 어댑터 모듈 (Mock 모드 지원)

// Mock 통신을 원할 경우 true로 설정, 실제 백엔드 연동 시 false로 설정
const USE_MOCK = false;

// Vite 환경 변수에서 Base URL 호출 (기본값: http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * D-Day 문자열을 계산하는 헬퍼 함수 (Mock 응답용)
 */
function calculateMockDDay(dueDateString) {
  if (!dueDateString) return '';
  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-Day';
  } else if (diffDays > 0) {
    return `D-${diffDays}`;
  } else {
    return `D+${Math.abs(diffDays)}`;
  }
}

/**
 * 할 일 등록 API 호출
 * @param {number|string} projectId 프로젝트 ID
 * @param {object} taskData 할 일 등록 폼 입력 객체
 */
export async function createTask(projectId, taskData) {
  if (USE_MOCK) {
    // 300ms 딜레이 후 Mock 데이터 응답 (성공 시나리오 시뮬레이션)
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          status: 201,
          data: {
            taskId: Math.floor(Math.random() * 1000) + 100,
            projectId: Number(projectId),
            title: taskData.title,
            assignee: taskData.assignee || '',
            category: taskData.category || '',
            priority: taskData.priority || '보통',
            dueDate: taskData.dueDate,
            dday: calculateMockDDay(taskData.dueDate),
            completed: false,
          },
        };
        resolve(mockResponse);
      }, 300);
    });
  }

  // 실제 백엔드 API 호출 (fetch API 사용)
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '할 일 등록 중 서버 에러가 발생했습니다.');
  }

  const data = await response.json();
  return {
    status: response.status,
    data: data,
  };
}

/**
 * 할 일 담당자 수정 API
 * @param {number|string} taskId 할 일 ID
 * @param {string} assignee 변경할 담당자 이름
 */
export async function updateTaskAssignee(taskId, assignee) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: {
            taskId: Number(taskId),
            assignee: assignee || null,
            status: "success"
          }
        });
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}/assignee`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignee }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '담당자 수정 중 서버 에러가 발생했습니다.');
  }

  const data = await response.json();
  return {
    status: 200,
    data: data,
  };
}

/**
 * 프로젝트 목록 조회 API
 */
export async function getProjects() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: [
            { id: 1, title: "클라우드기반웹개발 팀프로젝트", subject: "클라우드웹개발" },
            { id: 2, title: "데이터베이스 발표 과제", subject: "데이터베이스" }
          ]
        });
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('프로젝트 목록을 로드하지 못했습니다.');
  }
  const data = await response.json();
  return { status: 200, data };
}

/**
 * 특정 프로젝트의 소속 멤버 목록 조회 API
 */
export async function getProjectMembers(projectId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Number(projectId) === 1) {
          resolve({ status: 200, data: ["홍길동", "김철수"] });
        } else if (Number(projectId) === 2) {
          resolve({ status: 200, data: ["이영희", "박민수"] });
        } else {
          resolve({ status: 200, data: [] });
        }
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/members`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('멤버 목록을 로드하지 못했습니다.');
  }
  const data = await response.json();
  return { status: 200, data };
}

/**
 * 특정 프로젝트의 할 일 목록 필터링 및 정렬 조회 API
 */
export async function getTasksFiltered(projectId, params = {}) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: [
            { taskId: 101, projectId: Number(projectId), title: "필터링 테스트 할 일 1", assignee: params.assignee || "홍길동", category: params.category || "자료조사", priority: params.priority || "높음", dueDate: "2026-06-10", dday: "D-7", completed: params.completed !== undefined ? params.completed : false }
          ]
        });
      }, 200);
    });
  }

  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/tasks?${queryParams.toString()}`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('할 일 목록을 조회하지 못했습니다.');
  }
  const data = await response.json();
  return { status: 200, data };
}

/**
 * 프로젝트 진행률 조회 API
 */
export async function getProjectProgress(projectId) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: { projectId: Number(projectId), progress: 75.0, totalTasks: 4, completedTasks: 3 }
        });
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/progress`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('프로젝트 진행률을 조회하지 못했습니다.');
  }
  const data = await response.json();
  return { status: 200, data };
}

/**
 * 마감 임박 할 일 목록 조회 API
 */
export async function getUrgentTasks() {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          data: [
            { taskId: 999, projectId: 1, title: "마감 직전 초비상 할 일", assignee: "김철수", category: "발표자료", priority: "높음", dueDate: "2026-06-04", dday: "D-1", completed: false }
          ]
        });
      }, 200);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/urgent`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('마감 임박 할 일을 조회하지 못했습니다.');
  }
  const data = await response.json();
  return { status: 200, data };
}

/**
 * 프로젝트 생성 API
 */
export async function createProject(projectData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || '프로젝트 생성 실패');
  }
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * 멤버 초대 API
 */
export async function addProjectMember(projectId, memberData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || '멤버 초대 실패');
  }
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * 멤버 초대 수락 API
 */
export async function acceptProjectMember(projectId, username) {
  const response = await fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/members/${username}/accept`, {
    method: 'PUT'
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || '멤버 초대 수락 실패');
  }
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * 회원 가입 API
 */
export async function createUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || '회원 가입 실패');
  }
  const data = await response.json();
  return { status: response.status, data };
}

/**
 * 전체 회원 조회 API
 */
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('회원 목록 조회 실패');
  }
  const data = await response.json();
  return { status: response.status, data };
}
