import React, { memo, useMemo } from "react";
import { Card, Typography } from "antd";

import { OptimizedImage } from "@components/OptimizedImage/OptimizedImage";
import { Task } from "@src/types/task";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import styles from "./TaskCard.module.scss";

const { Meta } = Card;
const { Text } = Typography;

const TaskCard: React.FC<Task> = (props): React.JSX.Element => {
    const { title, description, updatedAt, image } = props;

    // const MemoizedImageComponent = memo(() => {
    //     if (!image) {
    //         return null;
    //     }
    //     return (<OptimizedImage src={image.url} alt={image.alt || ""} />);
    // });

    const updateAtToDisplay = useMemo(() => formatDateForDisplay(updatedAt), [updatedAt]);

    return (
        // <Card cover={<MemoizedImageComponent />}>
        <Card
            title={title}
            extra={<Text type="secondary">{updateAtToDisplay}</Text>}
            className={styles.taskCard}
        >
            {description}
        </Card>
    );
}

export { TaskCard };
