import { Header } from "@src/components/Header/Header";
import { ProjectEmptyState } from "@src/components/ProjectEmptyState/ProjectEmptyState";
import { Sidebar } from "@src/components/Sidebar/Sidebar";
import { TaskBoard } from "@src/components/TaskBoard/TaskBoard";
import { loadExampleData } from "@src/db/seed";
import { useActiveProject } from "@src/hooks/useActiveProject";
import { type ThemeMode, useTheme } from "@src/hooks/useTheme";
import { getThemeConfig } from "@styles/themes/default";
import { App as AntApp, ConfigProvider, Layout, Skeleton } from "antd";
import { useState } from "react";

const { Content, Sider } = Layout;

interface AppShellProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const AppShell = ({ theme, onToggleTheme }: AppShellProps) => {
  const { message } = AntApp.useApp();
  const { projects, isLoading, activeProject, setActiveProject } = useActiveProject();
  const [collapsed, setCollapsed] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleLoadExample = async () => {
    setIsSeeding(true);
    try {
      await loadExampleData();
      message.success("Proyecto de ejemplo cargado");
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : "No se pudo cargar el ejemplo");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sider
        theme={theme}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        trigger={null}
        width={260}
        className="!bg-white dark:!bg-slate-900"
      >
        <Sidebar
          projects={projects}
          activeProjectId={activeProject?.id}
          collapsed={collapsed}
          theme={theme}
          isLoading={isSeeding}
          onSelectProject={setActiveProject}
          onLoadExample={() => void handleLoadExample()}
        />
      </Sider>

      <Layout className="min-w-0">
        <Header
          activeProject={activeProject}
          collapsed={collapsed}
          theme={theme}
          onToggleSidebar={() => setCollapsed((current) => !current)}
          onToggleTheme={onToggleTheme}
        />
        <Content className="m-4 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:m-6 md:p-6">
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : activeProject ? (
            <TaskBoard projectId={activeProject.id} />
          ) : (
            <ProjectEmptyState
              onLoadExample={() => void handleLoadExample()}
              isLoading={isSeeding}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <ConfigProvider theme={getThemeConfig(theme)}>
      <AntApp>
        <AppShell theme={theme} onToggleTheme={toggleTheme} />
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
