import "./MyPage.css";

function MyPage() {

  const tasks = [
    {
      id: 1,
      title: "발표자료 제작",
      dueDate: "2026-06-09",
      completed: false
    },
    {
      id: 2,
      title: "자료조사",
      dueDate: "2026-06-20",
      completed: true
    },
    {
      id: 3,
      title: "보고서 작성",
      dueDate: "2026-06-08",
      completed: false
    }
  ];

  const getDday = (date) => {
    const today = new Date();
    const due = new Date(date);

    return Math.ceil(
      (due - today) /
      (1000 * 60 * 60 * 24)
    );
  };

  const urgentTasks =
    tasks.filter(
      task =>
        !task.completed &&
        getDday(task.dueDate) <= 2
    );

  const completedCount =
    tasks.filter(
      task => task.completed
    ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          completedCount /
          tasks.length *
          100
        );

  return (
    <div className="mypage-container">

      <h1>마이페이지</h1>

      <div className="progress-section">

        <h2>내 진행률</h2>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`
            }}
          />
        </div>

        <p>{progress}%</p>

      </div>

      <div className="urgent-section">

        <h2>마감 임박 일정</h2>

        {
          urgentTasks.map(task => (
            <div
              key={task.id}
              className="urgent-task"
            >
              🚨 {task.title}
              {" "}
              (D-{getDday(task.dueDate)})
            </div>
          ))
        }

      </div>

      <div className="task-section">

        <h2>내 할 일</h2>

        {
          tasks.map(task => (
            <div
              key={task.id}
              className="task-item"
            >
              {
                task.completed
                  ? "✅"
                  : "⬜"
              }

              {" "}

              {task.title}
            </div>
          ))
        }

      </div>

    </div>
  );
}

export default MyPage;