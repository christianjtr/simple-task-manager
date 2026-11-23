type StringMap = { readonly [key: string]: string | StringMap };

export const en = {
  app: {
    exampleLoaded: "Example project loaded",
    exampleLoadFailed: "Could not load the example",
  },
  header: {
    toggleThemeAria: "Toggle theme",
    noProject: "No project",
    createProjectPrompt: "Create a project to get started",
    lightMode: "Light mode",
    darkMode: "Dark mode",
  },
  help: {
    buttonAria: "Help",
    buttonTooltip: "Help and data information",
    title: "Help",
    close: "Close",
    aboutTitle: "About Tasklane",
    aboutText:
      "Tasklane is a local-first Kanban board. Projects and tasks stay in this browser; there is no account, server, or realtime sync.",
    storageTitle: "Storage and limitations",
    storageText: "Data is saved in IndexedDB, scoped to this browser and origin.",
    storageItem1: "Clearing site data removes projects and tasks.",
    storageItem2: "Storage is subject to the browser quota.",
    storageItem3: "Use JSON export to move or keep a portable copy.",
    storageItem4: "A workspace can hold up to 50 projects.",
    contractTitle: "JSON backup contract",
    contractText:
      "Exported files are JSON objects with version 1, an exportedAt ISO timestamp, and projects and tasks arrays.",
    exampleLabel: "Example shape",
    contractValues:
      "Status is TODO, IN_PROGRESS or DONE. Priority is low, medium or high. Dates use ISO 8601 strings.",
    rulesTitle: "Import behavior",
    rulesItem1: "Invalid files are rejected before any data is written.",
    rulesItem2: "Records are matched by id; existing records with the same id are replaced.",
    rulesItem3: "Duplicate ids and tasks whose project is missing are skipped.",
    rulesItem4: "Import does not delete existing projects or tasks.",
  },
  sidebar: {
    brand: "Tasklane",
    version: "v1",
    showProjects: "Show projects",
    hideProjects: "Hide projects",
    toggleSidebarAria: "Toggle sidebar",
    projects: "Projects",
    projectCount: "{count} / {limit}",
    limitReached: "Maximum 50 projects reached",
    newProject: "New project",
    editProject: "Edit project",
    loadExample: "Load example",
    projectCreated: "Project created",
    projectCreateFailed: "Could not create the project",
    projectUpdated: "Project updated",
    projectUpdateFailed: "Could not update the project",
    projectDeleted: "Project deleted",
    projectDeleteFailed: "Could not delete the project",
    deleteProjectTitle: "Delete project?",
    deleteProjectDescription: "Its tasks will be deleted too.",
    delete: "Delete",
    cancel: "Cancel",
    projectActionsTooltip: "Project actions",
    projectActionsAria: "Actions for {name}",
    name: "Name",
    enterName: "Enter a name",
    nameMax: "Maximum 80 characters",
    nameExample: "E.g. Work",
    color: "Color",
    description: "Description",
    optional: "Optional",
    createProject: "Create project",
    saveChanges: "Save changes",
  },
  emptyState: {
    title: "Organize your work",
    description:
      "Create your first project from the sidebar or load an example to explore the board.",
    loadExample: "Load example",
  },
  stage: {
    dropTasks: "Drop tasks here",
    countAriaOne: "1 task",
    countAriaOther: "{count} tasks",
  },
  announcements: {
    taskFallback: "task",
    noDestination: "no destination",
    dragStart: "Picked up {task}",
    dragOver: "{task} is over {target}",
    dragOverNoDestination: "{task} has no destination",
    dragEnd: "{task} was moved to {target}",
    dragCancel: "Move of {task} cancelled",
  },
  taskMessages: {
    updated: "Task updated",
    created: "Task created",
    saveFailed: "Could not save the task",
    deleted: "Task deleted",
    deleteFailed: "Could not delete the task",
    moved: "Task {id} moved to {status}",
    moveFailed: "Cannot move task {id}: {error}",
  },
  board: {
    tasks: "Tasks",
    countAriaOne: "1 task",
    countAriaOther: "{count} tasks",
    taskSingular: "task",
    taskPlural: "tasks",
    newTask: "New task",
    noFilteredTasks: "No tasks match these filters",
    clearFilters: "Clear filters",
  },
  filters: {
    searchPlaceholder: "Search tasks...",
    searchAria: "Search tasks",
    priorityPlaceholder: "Priority",
    priorityAria: "Filter by priority",
    tagPlaceholder: "Tag",
    tagAria: "Filter by tag",
    clear: "Clear",
  },
  priority: {
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  taskForm: {
    editTask: "Edit task",
    newTask: "New task",
    title: "Title",
    enterTitle: "Enter a title",
    titleMax: "Maximum 120 characters",
    titleExample: "E.g. Prepare meeting",
    description: "Description",
    optional: "Optional",
    status: "Status",
    priority: "Priority",
    dueDate: "Due date",
    tags: "Tags",
    tagsPlaceholder: "Type and press Enter",
    cancel: "Cancel",
    saveChanges: "Save changes",
    createTask: "Create task",
  },
  taskCard: {
    drag: "Drag {title}",
    updated: "Updated {date}",
    due: "Due {date}",
    edit: "Edit",
    showMore: "Show more",
    showLess: "Show less",
    actionsTooltip: "Task actions",
    actionsAria: "Actions for {title}",
    deleteTitle: "Delete task?",
    deleteDescription: "This task will be removed from the board.",
    delete: "Delete",
    cancel: "Cancel",
    moveLegend: "Move {title}",
    movePreviousAria: "Move {title} to previous column",
    movePreviousTitle: "Move to previous column",
    moveUpAria: "Move {title} up",
    moveUpTitle: "Move up",
    moveDownAria: "Move {title} down",
    moveDownTitle: "Move down",
    moveNextAria: "Move {title} to next column",
    moveNextTitle: "Move to next column",
  },
  backup: {
    data: "Data",
    tooltip: "Data export/import",
    exportJson: "Export JSON",
    importJson: "Import JSON",
    importing: "Importing...",
    fileAria: "Backup file",
    exportSuccess: "Backup exported",
    importSuccess: "Backup imported",
    importFailed: "Could not import the backup",
    importComplete: "Import complete",
    close: "Close",
    importedProjects: "Projects imported:",
    importedTasks: "Tasks imported:",
    skipped: "Skipped: {projects} projects, {tasks} tasks",
  },
  seed: {
    projectName: "Example project",
    projectDescription: "Starter project for exploring the board.",
    task1Title: "Define scope",
    task1Description: "Write down the project goals.",
    task1Tag: "planning",
    task2Title: "Design the board",
    task2Description:
      "Sketch the columns and card design, including how task priority, due dates, tags, and the new three-dot actions menu should appear on each card at desktop and mobile widths.",
    task2Tag: "design",
    task3Title: "Set up the environment",
    task3Description: "Install dependencies and configure the repository.",
    task3Tag: "setup",
  },
} as const satisfies StringMap;

type NestedKeyOf<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${NestedKeyOf<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = NestedKeyOf<typeof en>;

type TranslationParams = Record<string, string | number>;

export function t(key: TranslationKey, params?: TranslationParams): string {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, en);

  if (typeof value !== "string") return key;
  return value.replace(
    /\{(\w+)\}/g,
    (_, name: string) => params?.[name]?.toString() ?? `{${name}}`,
  );
}
