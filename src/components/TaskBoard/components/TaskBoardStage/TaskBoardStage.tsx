import React from "react";
import { Typography, Divider, List } from "antd";

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

const TaskBoardStage: React.FC<TaskBoardStageProps> = (props): React.JSX.Element => {
    const { title, status: taskBoardStatus, tasks, id } = props;

    return (
        <div className={styles.taskBoardStage} data-testid={`task_board_stage_item_${id}`}>
            <Title level={4} className={styles.title}>{title}</Title>
            <Divider />
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={tasks}
                renderItem={(item, index) => (
                    <List.Item key={`task_card_status_${taskBoardStatus.toLowerCase()}_item_${index}`}>
                        <TaskCard {...item} />
                    </List.Item>
                )}
            />
        </div>
    );
}

export { TaskBoardStage };
