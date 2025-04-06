import React, { memo, useMemo } from "react";
import { Card, Typography } from "antd";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { OptimizedImage } from "@components/OptimizedImage/OptimizedImage";
import { Task } from "@src/types/task";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import styles from "./TaskCard.module.scss";

const { Text } = Typography;

const TaskCard: React.FC<Task> = (props): React.JSX.Element => {
    const { title, description, updatedAt, id, image } = props;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const sortableStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // const MemoizedImageComponent = memo(() => {
    //     if (!image) {
    //         return null;
    //     }
    //     return (<OptimizedImage src={image.url} alt={image.alt || ""} />);
    // });

    const updateAtToDisplay = useMemo(() => formatDateForDisplay(updatedAt), [updatedAt]);

    return (
        <div ref={setNodeRef} style={sortableStyle} {...attributes} {...listeners}>
            {/* <Card cover={<MemoizedImageComponent />}> */}
            <Card
                title={title}
                extra={<Text type="secondary">{updateAtToDisplay}</Text>}
                className={styles.taskCard}
            >
                {description}
            </Card>
        </div>
    );
}

export { TaskCard };
