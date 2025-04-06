import React from "react";
import { Typography, Divider, List } from "antd";

import { TaskStatus, Task } from "@src/types/task";
import { TaskCard } from "../TaskCard/TaskCard";
import styles from "./TaskBoardStage.module.scss";

export interface TaskBoardStageProps {
    id: string;
    title: string;
    status: TaskStatus;
    tasks?: Task[];
}

const { Title } = Typography;

const TaskBoardStage: React.FC<TaskBoardStageProps> = (props): React.JSX.Element => {
    const { title, status: taskBoardStatus, tasks } = props;

    return (
        <div className={styles.taskBoardStage}>
            <Title level={4} className={styles.title}>{title}</Title>
            <Divider />
            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={tasks}
                renderItem={(item, index) => (
                    <List.Item key={`board_stage_${taskBoardStatus.toLowerCase()}_item_${index}`}>
                        <TaskCard {...item} />
                    </List.Item>
                )}
            />
        </div>
    );
}

export { TaskBoardStage };
