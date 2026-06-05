// 역할 2 API 어댑터 모듈 (프로젝트 등록 / 초대 코드 참여) — Mock 모드 지원

// Mock 통신을 원할 경우 true로 설정, 실제 백엔드 연동 시 false로 설정
const USE_MOCK = false;

// Vite 환경 변수에서 Base URL 호출 (기본값: http://localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Mock 초대 코드 생성 헬퍼
 */
function makeMockInviteCode() {
  return 'INV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * 프로젝트 등록 API
 * @param {object} projectData { title, subject, description, creatorUsername? }
 */
export async function createProject(projectData) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 201,
          data: {
            id: Math.floor(Math.random() * 1000) + 100,
            title: projectData.title,
            subject: projectData.subject || '',
            description: projectData.description || '',
            inviteCode: makeMockInviteCode(),
            members: [],
          },
        });
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '프로젝트 등록 중 서버 에러가 발생했습니다.');
  }

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * 초대 코드로 프로젝트 참여 API
 * @param {string} inviteCode 초대 코드
 * @param {string} username 참여할 사용자 아이디
 */
export async function joinProjectByCode(inviteCode, username) {
  if (USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!inviteCode || !inviteCode.startsWith('INV-')) {
          reject(new Error('유효하지 않은 초대 코드입니다.'));
          return;
        }
        resolve({
          status: 200,
          data: {
            id: 1,
            title: '참여한 프로젝트(Mock)',
            subject: '클라우드기반웹개발',
            description: '',
            inviteCode,
            members: [{ username, name: username, status: 'ACCEPTED' }],
          },
        });
      }, 300);
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/projects/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inviteCode, username }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || '프로젝트 참여 중 서버 에러가 발생했습니다.');
  }

  const data = await response.json();
  return { status: response.status, data };
}
