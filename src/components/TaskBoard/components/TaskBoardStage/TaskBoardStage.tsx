import React, { useState, useEffect } from "react";
import { Typography, Divider } from "antd";
import { ReactSortable } from "react-sortablejs";

import { TaskStatus, Task } from "@src/types/task";
import { TaskCard } from "../TaskCard/TaskCard";
import styles from "./TaskBoardStage.module.scss";

export interface TaskBoardStageProps {
    id: string;
    title: string;
    status: TaskStatus;
    tasks: Task[];
}

const { Title } = Typography;

const TaskBoardStage: React.FC<TaskBoardStageProps> = (props): React.JSX.Element | null => {
    const { title, status: taskBoardStatus, tasks, id } = props;

    const [stageTasks, setStageTasks] = useState<Task[]>([]);

    useEffect(() => {
        setStageTasks(tasks);
    }, [tasks]);

    return (
        <div className={styles.taskBoardStage} data-testid={`task_board_stage_item_${id}`}>
            <Title level={4} className={styles.title}>{title}</Title>
            <Divider />
            <ReactSortable
                list={stageTasks}
                setList={setStageTasks} className={styles.list}
                group="taskboard"
                animation={150}
            >
                {stageTasks.map((item, index) => (
                    <TaskCard key={`task_card_status_${taskBoardStatus.toLowerCase()}_item_${index}`} {...item} />
                ))}
            </ReactSortable>
        </div>
    );
}

export { TaskBoardStage };
