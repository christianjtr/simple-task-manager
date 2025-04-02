import { useState, useEffect } from "react";
import { Layout } from "antd";
import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { mockWebSocket, WebSocketEventType } from "./services/mockWebSocket";
import { Task } from "./types/task";
import styles from "./App.module.scss";

const { Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

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
          {/* implement Kanban board here */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
