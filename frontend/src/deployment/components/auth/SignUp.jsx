import { useState } from 'react';
import { signUp, sendVerificationCode, verifyEmail } from '../../api/authApi.js';
import './SignUp.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    studentId: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateSignUpFields = () => {
    if (!formData.name.trim()) return '이름을 입력해주세요.';
    if (!formData.studentId.trim()) return '학번을 입력해주세요.';
    if (!formData.email.trim()) return '학교 이메일을 입력해주세요.';
    if (!formData.password) return '비밀번호를 입력해주세요.';
    if (formData.password !== formData.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    return '';
  };

  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      setError('학교 이메일을 입력해주세요.');
      return;
    }

    setSendingCode(true);
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendVerificationCode(formData.email);
      setEmailSent(true);
      setMessage(emailSent ? '인증 코드가 재전송되었습니다.' : '인증 코드가 이메일로 전송되었습니다.');
      setShowSendModal(true);
    } catch (err) {
      setError(err.message || '인증 코드 전송 실패');
    } finally {
      setSendingCode(false);
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailSent) {
      setError('먼저 인증 코드를 전송해주세요.');
      return;
    }
    if (!verificationCode.trim()) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    setVerifyingCode(true);
    setLoading(true);
    setError('');

    try {
      await verifyEmail(formData.email, verificationCode);
      setEmailVerified(true);
      setMessage('이메일 인증이 완료되었습니다. 나머지 정보를 입력하고 회원가입을 완료해주세요.');
    } catch (err) {
      setError(err.message || '인증 실패');
    } finally {
      setVerifyingCode(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = validateSignUpFields();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    if (!emailVerified) {
      setError(emailSent ? '인증 코드를 확인해주세요.' : '학교 이메일 인증 코드를 전송해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await signUp(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirm,
        formData.studentId
      );
      setMessage('회원가입이 완료되었습니다.');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setEmailSent(false);
    setEmailVerified(false);
    setVerificationCode('');
    setShowSendModal(false);
    setMessage('');
    setError('');
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>회원가입</h2>
        <p className="subtitle">학교 메일로만 가입 가능합니다.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>학번 *</label>
            <input
              type="text"
              name="studentId"
              placeholder="학번을 입력하세요"
              value={formData.studentId}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>학교 이메일 *</label>
            <div className="inline-field">
              <input
                type="email"
                name="email"
                placeholder="@schooldomain.ac.kr"
                value={formData.email}
                onChange={(e) => {
                  handleInputChange(e);
                  resetVerification();
                }}
                disabled={emailSent}
                required
              />
              <button
                type="button"
                className="inline-btn"
                onClick={handleSendCode}
                disabled={loading || emailVerified}
              >
                {sendingCode ? '전송 중' : emailSent ? '재전송' : '전송'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>인증 코드 *</label>
            <div className="inline-field">
              <input
                type="text"
                placeholder="6자리 인증 코드"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  setError('');
                }}
                disabled={!emailSent || emailVerified}
                maxLength="6"
              />
              <button
                type="button"
                className="inline-btn"
                onClick={handleVerifyEmail}
                disabled={loading || !emailSent || emailVerified}
              >
                {verifyingCode ? '확인 중' : emailVerified ? '완료' : '확인'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>비밀번호 *</label>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인 *</label>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button type="submit" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="login-link">
          이미 계정이 있으신가요? <a href="/login">로그인</a>
        </p>
      </div>

      {showSendModal && (
        <div className="signup-modal-backdrop" role="presentation">
          <div className="signup-modal" role="dialog" aria-modal="true" aria-labelledby="send-code-modal-title">
            <h3 id="send-code-modal-title">전송되었습니다</h3>
            <p>학교 이메일로 인증 코드가 전송되었습니다.</p>
            <button type="button" onClick={() => setShowSendModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
