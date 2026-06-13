import "./MyPage.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../api/authApi";
import { getProjects, getTasksFiltered, updateTaskStatus } from "../../api/taskApi";

function getTaskState(task) {
  if (task.status) return task.status;
  return task.completed ? "완료" : "예정";
}

function MyPage() {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.name || user?.username || "홍길동";
  const [tasks, setTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const getDday = (date) => {
    if (!date) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(date);
    due.setHours(0, 0, 0, 0);

    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const formatDday = (date) => {
    if (!date) return "미정";
    const dday = getDday(date);
    if (dday === 0) return "D-Day";
    if (dday > 0) return `D-${dday}`;
    return `D+${Math.abs(dday)}`;
  };

  const loadMyTasks = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const projectRes = await getProjects();
      const projects = projectRes.data || [];
      const taskResponses = await Promise.all(projects.map((project) => getTasksFiltered(project.id)));
      const mergedTasks = taskResponses.flatMap((res, index) => {
        const project = projects[index];
        return (res.data || []).map((task) => ({
          ...task,
          projectTitle: project.title,
          projectSubject: project.subject,
        }));
      });

      setTasks(mergedTasks.filter((task) => (
        task.assignee === userName || task.assignee === "전체"
      )));
    } catch {
      setMessage("내 할 일을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, [userName]);

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => !selectedStatus || getTaskState(task) === selectedStatus)
      .sort((a, b) => getDday(a.dueDate) - getDday(b.dueDate));
  }, [tasks, selectedStatus]);

  const updateStatus = async (taskId, status) => {
    setTasks((prev) => prev.map((task) => (
      task.taskId === taskId ? { ...task, status, completed: status === "완료" } : task
    )));

    try {
      const res = await updateTaskStatus(taskId, status);
      if (res.status === 200) {
        setTasks((prev) => prev.map((task) => (
          task.taskId === taskId ? { ...task, ...res.data } : task
        )));
      }
    } catch {
      setMessage("상태 변경에 실패했습니다.");
      await loadMyTasks();
    }
  };

  const urgentTasks = tasks.filter((task) => getTaskState(task) !== "완료" && getDday(task.dueDate) <= 2);
  const scheduledCount = tasks.filter((task) => getTaskState(task) === "예정").length;
  const inProgressCount = tasks.filter((task) => getTaskState(task) === "진행").length;
  const completedCount = tasks.filter((task) => getTaskState(task) === "완료").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <main className="mypage-container">
      <section className="mypage-profile-card">
        <div className="mypage-avatar">홍</div>
        <div>
          <span className="mypage-label">데모 사용자</span>
          <h2>{userName}</h2>
          <p>팀프로젝트 업무와 마감 일정을 확인할 수 있습니다.</p>
        </div>
      </section>

      <section className="mypage-summary-grid">
        <article className="mypage-summary-card primary">
          <span className="mypage-label">내 진행률</span>
          <strong>{progress}%</strong>
          <div className="mypage-progress-bar">
            <div className="mypage-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>{completedCount}개 완료 / 전체 {tasks.length}개</p>
        </article>

        <article className="mypage-summary-card">
          <span className="mypage-label">진행 중</span>
          <strong>{inProgressCount}</strong>
          <p>현재 처리 중인 업무</p>
        </article>

        <article className="mypage-summary-card">
          <span className="mypage-label">예정</span>
          <strong>{scheduledCount}</strong>
          <p>아직 시작 전인 업무</p>
        </article>

        <article className="mypage-summary-card">
          <span className="mypage-label">완료</span>
          <strong>{completedCount}</strong>
          <p>정리까지 끝난 업무</p>
        </article>
      </section>

      <section className="mypage-status-toolbar">
        <div>
          <h2>내 할 일 상태 관리</h2>
          <p>담당 업무를 상태별로 보고 바로 변경하세요.</p>
        </div>
        <div className="mypage-status-tabs" aria-label="내 할 일 상태 필터">
          {["", "예정", "진행", "완료"].map((status) => (
            <button
              type="button"
              key={status || "all"}
              className={selectedStatus === status ? "active" : ""}
              onClick={() => setSelectedStatus(status)}
            >
              {status || "전체"}
            </button>
          ))}
        </div>
      </section>

      {message && <div className="mypage-message">{message}</div>}

      <section className="mypage-content-grid">
        <article className="mypage-panel">
          <div className="mypage-panel-header">
            <h2>마감 임박 일정</h2>
            <span>{urgentTasks.length}건</span>
          </div>

          <div className="mypage-list">
            {isLoading ? (
              <p className="mypage-empty">마감 일정을 불러오는 중...</p>
            ) : urgentTasks.length === 0 ? (
              <p className="mypage-empty">마감 임박 업무가 없습니다.</p>
            ) : (
              urgentTasks.map((task) => (
                <div key={task.taskId} className="mypage-list-item urgent">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.projectTitle}</p>
                  </div>
                  <span>{formatDday(task.dueDate)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="mypage-panel">
          <div className="mypage-panel-header">
            <h2>내 할 일</h2>
            <span>{visibleTasks.length}건</span>
          </div>

          <div className="mypage-list">
            {isLoading ? (
              <p className="mypage-empty">내 할 일을 불러오는 중...</p>
            ) : visibleTasks.length === 0 ? (
              <p className="mypage-empty">조건에 맞는 할 일이 없습니다.</p>
            ) : visibleTasks.map((task) => (
              <div key={task.taskId} className="mypage-list-item">
                <select
                  className={`mypage-status-select state-${getTaskState(task)}`}
                  value={getTaskState(task)}
                  onChange={(e) => updateStatus(task.taskId, e.target.value)}
                >
                  <option value="예정">예정</option>
                  <option value="진행">진행</option>
                  <option value="완료">완료</option>
                </select>
                <div className="mypage-task-main">
                  <strong>{task.title}</strong>
                  <p>{task.projectTitle} · {task.assignee || "담당자 미지정"}</p>
                </div>
                <span className="mypage-dday">{formatDday(task.dueDate)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mypage-footer-actions">
        <button
          type="button"
          className="mypage-logout-button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          로그아웃
        </button>
      </section>
    </main>
  );
}

export default MyPage;
