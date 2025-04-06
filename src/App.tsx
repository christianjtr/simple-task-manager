import { useState, useEffect, useMemo } from "react";
import { Layout } from "antd";

import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { mockWebSocket, WebSocketEventType } from "./services/mockWebSocket";
import { TaskStatus, type Task } from "./types/task";
import { TaskBoard } from "./components/TaskBoard/TaskBoard";
import { type TaskBoardStageProps } from "./components/TaskBoard/components/TaskBoardStage/TaskBoardStage";
import { useTaskService } from "./hooks/useTaskService";
import styles from "./App.module.scss";

const { Content } = Layout;

const DEFAULT_STAGES: TaskBoardStageProps[] = [
  {
    id: "todo",
    title: "To Do",
    status: TaskStatus.TODO,
    tasks: [],
  },
  {
    id: "in_progress",
    title: "In Progress",
    status: TaskStatus.IN_PROGRESS,
    tasks: [],
  },
  {
    id: "done",
    title: "Done",
    status: TaskStatus.DONE,
    tasks: [],
  }
];

const App = (): React.JSX.Element => {
  const [collapsed, setCollapsed] = useState(false);

  const { tasks } = useTaskService();

  const stagesWithTasks = useMemo(() => {
    return DEFAULT_STAGES.map((eachStage) => ({
      ...eachStage,
      tasks: tasks.filter((eachTask) => eachTask.status === eachStage.status)
    }));
  }, [tasks]);

  useEffect(() => {
    mockWebSocket.connect();

    const unsubscribe = mockWebSocket.subscribe((message) => {
      if (message.type === WebSocketEventType.TASK_UPDATE) {
        const updatedTask = message.payload as Task;
        console.log("Received task update:", updatedTask);
      }
    });

    return () => {
      unsubscribe();
      mockWebSocket.disconnect();
    };
  }, []);

  return (
    <Layout className={styles.root}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header />
        <Content className={styles.main}>
          <TaskBoard stages={stagesWithTasks} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
