import React, { useMemo } from "react";
import { Card, Typography } from "antd";

import { OptimizedImage } from "@components/OptimizedImage/OptimizedImage";
import { Task } from "@src/types/task";
import { formatDateForDisplay } from "@src/utils/formatDateForDisplay";
import styles from "./TaskCard.module.scss";

const { Text } = Typography;

const TaskCard: React.FC<Task> = (props): React.JSX.Element => {
    const { title, description, updatedAt, id, image } = props;

    const updateAtToDisplay = useMemo(() => formatDateForDisplay(updatedAt), [updatedAt]);

    return (
        <div id={id} data-testid={`task_card_item_${id}`}>
            <Card
                classNames={{
                    cover: styles.image,
                }}
                cover={image ? <OptimizedImage src={image.url} alt={image.alt || ""} /> : undefined}
                id={id}
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
