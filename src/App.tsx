import { useState, useEffect } from "react";
import { Layout } from "antd";

import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { mockWebSocket, WebSocketEventType } from "./services/mockWebSocket";
import { type Task } from "./types/task";
import { TaskBoard } from "./components/TaskBoard/TaskBoard";
import { useTaskService } from "./hooks/useTaskService";
import styles from "./App.module.scss";

const { Content } = Layout;

const App = (): React.JSX.Element => {
  const [collapsed, setCollapsed] = useState(false);

  const { tasks } = useTaskService();

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
          <TaskBoard tasks={tasks} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
