import React, { useState, useEffect } from "react";
import { Typography, Divider, List } from "antd";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';

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
    const { title, status: taskBoardStatus, tasks: initialTasks } = props;

    const [tasks, setTasks] = useState<Task[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
    );

    const handleDragEnd = (event: { active: Task, over: Task }) => {
        const { active, over } = event;
        const isSameId = active.id === over.id;

        if (!isSameId) {
            setTasks((prevTasks) => {
                const oldIndex = prevTasks.findIndex((eachTask) => eachTask.id === active.id);
                const newIndex = prevTasks.findIndex((eachTask) => eachTask.id === over.id);
                return arrayMove(prevTasks, oldIndex, newIndex);
            });
        }
    }

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    return (
        <div className={styles.taskBoardStage}>
            <Title level={4} className={styles.title}>{title}</Title>
            <Divider />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event as unknown as { active: Task, over: Task })}
            >
                <SortableContext
                    items={tasks}
                    strategy={verticalListSortingStrategy}
                >
                    <List
                        grid={{ gutter: 16, column: 1 }}
                        dataSource={tasks}
                        renderItem={(item, index) => (
                            <List.Item key={`board_stage_${taskBoardStatus.toLowerCase()}_item_${index}`}>
                                <TaskCard {...item} />
                            </List.Item>
                        )}
                    />
                </SortableContext>
            </DndContext>
        </div>
    );
}

export { TaskBoardStage };
