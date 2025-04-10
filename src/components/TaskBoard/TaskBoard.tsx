import React, { useMemo } from "react";
import { Col, Row } from "antd";
import toastr from "toastr";

import { TaskStatus, type Task } from "@src/types/task";
import type { TaskBoardStageProps } from "./components/TaskBoardStage/TaskBoardStage";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";
import { useAppSelector } from "../../hooks/useReduxStore";

interface TaskBoardProps {
    onTransitionTask: (taskId: Task['id'], task: Partial<Task>) => Promise<void>;
}

const DEFAULT_STAGES: TaskBoardStageProps[] = [
    {
        id: TaskStatus.TODO,
        title: "To Do",
        status: TaskStatus.TODO,
        tasks: [],
    },
    {
        id: TaskStatus.IN_PROGRESS,
        title: "In Progress",
        status: TaskStatus.IN_PROGRESS,
        tasks: [],
    },
    {
        id: TaskStatus.DONE,
        title: "Done",
        status: TaskStatus.DONE,
        tasks: [],
    }
];

const TaskBoard: React.FC<TaskBoardProps> = (props): React.JSX.Element | null => {
    const { onTransitionTask: transitionTask } = props;

    const tasks: Task[] = useAppSelector((state) => state.tasks.tasks);

    const stagesWithTasks = useMemo(() => {
        const data = DEFAULT_STAGES.map((eachStage) => ({
            ...eachStage,
            tasks: tasks
                .map((eachTask) => ({
                    ...eachTask,
                    selected: false,
                    chosen: false,
                    filtered: false,
                }))
                .filter((eachTask) => eachTask.status === eachStage.status)
        }));

        return data;
    }, [tasks]);

    const handleOnTransitionTask = async (taskId: Task['id'], status: TaskStatus): Promise<void> => {
        try {
            await transitionTask(taskId, { status });
            toastr.success(`Task: ${taskId}, moved to ${status}`, 'Success');
        } catch (error) {
            toastr.error(`Cannot transition task: ${taskId}, Issue: ${error}`, 'Ups!');
            throw (error);
        }
    }

    if (stagesWithTasks.length === 0) {
        return null;
    }

    return (
        <React.Fragment>
            <Row gutter={[24, 24]}>
                {stagesWithTasks.map((eachStage, index) => (
                    <Col key={`task_board_stage_item_${index}`} span={24 / DEFAULT_STAGES.length}>
                        <TaskBoardStage {...eachStage} onTransitionTask={handleOnTransitionTask} />
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}

export { TaskBoard };