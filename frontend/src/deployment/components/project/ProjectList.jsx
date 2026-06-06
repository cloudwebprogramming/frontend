import { useState, useEffect } from 'react';
import { getProjects } from '../../api/taskApi';
import './ProjectList.css';

export default function ProjectList({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const res = await getProjects();
        if (res.status === 200) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error(err);
        setError('프로젝트 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) return <div className="pl-loading">프로젝트 로딩 중...</div>;
  if (error) return <div className="pl-error">{error}</div>;

  return (
    <div className="pl-container">
      <h2 className="pl-title">내 프로젝트 목록</h2>
      <div className="pl-grid">
        {projects.length === 0 ? (
          <p className="pl-empty">참여 중인 프로젝트가 없습니다. 새 프로젝트를 생성하거나 참여해보세요!</p>
        ) : (
          projects.map((project) => (
            <div 
              key={project.id} 
              className="pl-card" 
              onClick={() => onSelectProject(project)}
            >
              <div className="pl-card-header">
                <span className="pl-subject">{project.subject}</span>
                <h3 className="pl-project-title">{project.title}</h3>
              </div>
              <div className="pl-card-body">
                <p className="pl-description">{project.description || '설명이 없습니다.'}</p>
              </div>
              <div className="pl-card-footer">
                <span className="pl-invite-code">코드: {project.inviteCode}</span>
                <button className="pl-enter-btn">진입하기</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}