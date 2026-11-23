import { Header } from "@src/components/Header/Header";
import { ProjectEmptyState } from "@src/components/ProjectEmptyState/ProjectEmptyState";
import { Sidebar } from "@src/components/Sidebar/Sidebar";
import { TaskBoard } from "@src/components/TaskBoard/TaskBoard";
import { loadExampleData } from "@src/db/seed";
import { useActiveProject } from "@src/hooks/useActiveProject";
import { type ThemeMode, useTheme } from "@src/hooks/useTheme";
import { t } from "@src/i18n/en";
import { getThemeConfig } from "@styles/themes/default";
import { App as AntApp, ConfigProvider, Layout, Skeleton } from "antd";
import enUS from "antd/locale/en_US";
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
      message.success(t("app.exampleLoaded"));
    } catch (caught) {
      message.error(caught instanceof Error ? caught.message : t("app.exampleLoadFailed"));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Layout className="h-full min-h-0 bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Sider
        theme={theme}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        trigger={null}
        width={260}
        className="!h-full !bg-white dark:!bg-slate-900"
      >
        <Sidebar
          projects={projects}
          activeProjectId={activeProject?.id}
          collapsed={collapsed}
          theme={theme}
          isLoading={isSeeding}
          onSelectProject={setActiveProject}
          onLoadExample={() => void handleLoadExample()}
          onToggleSidebar={() => setCollapsed((current) => !current)}
        />
      </Sider>

      <Layout className="flex h-full min-h-0 min-w-0 flex-col">
        <Header activeProject={activeProject} theme={theme} onToggleTheme={onToggleTheme} />
        <Content className="m-4 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:m-6 md:p-6">
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : activeProject ? (
            <TaskBoard projectId={activeProject.id} />
          ) : (
            <ProjectEmptyState
              onLoadExample={() => void handleLoadExample()}
              isLoading={isLoading}
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
    <ConfigProvider locale={enUS} theme={getThemeConfig(theme)}>
      <AntApp className="h-full">
        <AppShell theme={theme} onToggleTheme={toggleTheme} />
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
