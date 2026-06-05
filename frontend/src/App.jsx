import { useState } from 'react'

import './App.css'
import TaskRegistrationDashboard from './deployment/components/task/TaskRegistrationDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* 역할 4: 할일 등록 및 API 연동 대시보드 (격리 완료) */}
      <TaskRegistrationDashboard />


    </>
  )
}

export default App
