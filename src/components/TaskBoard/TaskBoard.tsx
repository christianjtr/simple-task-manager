import React, { useMemo } from "react";
import { Col, Row } from "antd";

import { Task, TaskStatus } from "@src/types/task";
import type { TaskBoardStageProps } from "./components/TaskBoardStage/TaskBoardStage";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";

interface TaskBoardProps {
    tasks: Task[];
    stages?: TaskBoardStageProps[];
}

const defaultStages: TaskBoardStageProps[] = [
    {
        id: "todo",
        title: "To Do",
        status: TaskStatus.TODO
    },
    {
        id: "in_progress",
        title: "In Progress",
        status: TaskStatus.IN_PROGRESS
    },
    {
        id: "done",
        title: "Done",
        status: TaskStatus.DONE
    }
];

const TaskBoard: React.FC<TaskBoardProps> = (props): React.JSX.Element => {
    const { stages = defaultStages, tasks } = props;

    const data = useMemo(() => {
        return stages.map((eachStage) => ({
            ...eachStage,
            tasks: tasks.filter((eachTask) => eachTask.status === eachStage.status)
        }));
    }, [tasks]);

    return (
        <React.Fragment>
            <Row gutter={[24, 24]}>
                {data.map((eachStage, index) => (
                    <Col key={`board_stage_item_${index}`} span={24 / stages.length}>
                        <TaskBoardStage {...eachStage} />
                    </Col>
                ))}
            </Row>
            <pre>{JSON.stringify(tasks, null, 2)}</pre>
        </React.Fragment>
    );
}

export { TaskBoard };