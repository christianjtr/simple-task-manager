import { useState } from "react";
import { Layout } from "antd";

import { Header } from "./components/Header/Header";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { TaskBoard } from "./components/TaskBoard/TaskBoard";
import styles from "./App.module.scss";

const { Content } = Layout;

const App = (): React.JSX.Element => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.root}>
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header />
        <Content className={styles.main}>
          <TaskBoard />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
