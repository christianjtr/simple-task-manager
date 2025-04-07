import React, { useMemo } from "react";
import { Col, Row } from "antd";

import { TaskStatus, type Task } from "@src/types/task";
import type { TaskBoardStageProps } from "./components/TaskBoardStage/TaskBoardStage";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";

interface TaskBoardProps {
    tasks: Task[];
    stages?: TaskBoardStageProps[];
}

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

const TaskBoard: React.FC<TaskBoardProps> = (props): React.JSX.Element | null => {
    const { stages = DEFAULT_STAGES, tasks } = props;

    const stagesWithTasks = useMemo(() => {
        const data = stages.map((eachStage) => ({
            ...eachStage,
            tasks: tasks.filter((eachTask) => eachTask.status === eachStage.status)
        }));

        return data;
    }, [tasks]);

    if (!tasks) {
        return null;
    }

    return (
        <React.Fragment>
            <Row gutter={[24, 24]}>
                {stagesWithTasks.map((eachStage, index) => (
                    <Col key={`task_board_stage_item_${index}`} span={24 / stages.length}>
                        <TaskBoardStage {...eachStage} />
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}

export { TaskBoard };