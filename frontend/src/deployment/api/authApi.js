const API_BASE_URL = 'http://localhost:8080/api/v1/auth';

/**
 * Sign up
 */
export const signUp = async (name, email, password, passwordConfirm, studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirm,
        studentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '회원가입 실패');
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Send verification code
 */
export const sendVerificationCode = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '인증 코드 전송 실패');
    }

    return data;
  } catch (error) {
    console.error('Send verification code error:', error);
    throw error;
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (email, verificationCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        verificationCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '이메일 인증 실패');
    }

    return data;
  } catch (error) {
    console.error('Verify email error:', error);
    throw error;
  }
};

/**
 * Login
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '로그인 실패');
    }

    // Save token to localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Get user
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Logout
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
