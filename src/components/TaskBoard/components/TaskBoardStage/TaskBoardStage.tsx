import React, { useState, useEffect } from "react";
import { Typography, Divider } from "antd";
import { ReactSortable, SortableEvent } from "react-sortablejs";

import { TaskStatus, Task } from "@src/types/task";
import { TaskCard } from "../TaskCard/TaskCard";
import styles from "./TaskBoardStage.module.scss";

export interface DraggableItem extends Task {
    selected?: boolean;
    chosen?: boolean;
    filtered?: boolean;
}
export interface TaskBoardStageProps {
    id: TaskStatus;
    title: string;
    status: TaskStatus;
    tasks: DraggableItem[];
    onTransitionTask?: (taskId: Task['id'], status: TaskStatus) => Promise<void>;
}

const { Title } = Typography;

const TaskBoardStage: React.FC<TaskBoardStageProps> = (props): React.JSX.Element | null => {
    const { title, status: taskBoardStatus, tasks, id, onTransitionTask: transitionTask } = props;

    const [stageTasks, setStageTasks] = useState<DraggableItem[]>([]);

    const handleOnDraggingEnded = (event: SortableEvent) => {
        if (event.pullMode) {
            const taskId = event.item.id;
            const status = event.to.id;
            transitionTask?.(taskId, status as TaskStatus);
        }
    }

    useEffect(() => {
        setStageTasks(tasks);
    }, [tasks]);

    if (stageTasks.length === 0) {
        return null;
    }

    return (
        <div className={styles.taskBoardStage} data-testid={`task_board_stage_item_${id}`}>
            <Title level={4} className={styles.title}>{title}</Title>
            <Divider />
            <ReactSortable
                id={id}
                list={stageTasks}
                setList={setStageTasks}
                group="taskboard"
                className={styles.list}
                onEnd={handleOnDraggingEnded}
            >
                {stageTasks.map((item, index) => (
                    <TaskCard key={`task_card_status_${taskBoardStatus.toLowerCase()}_item_${index}`} {...item} />
                ))}
            </ReactSortable>
        </div>
    );
}

export { TaskBoardStage };
