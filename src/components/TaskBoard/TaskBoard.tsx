import React from "react";
import { Col, Row } from "antd";

import type { TaskBoardStageProps } from "./components/TaskBoardStage/TaskBoardStage";
import { TaskBoardStage } from "./components/TaskBoardStage/TaskBoardStage";
interface TaskBoardProps {
    stages: TaskBoardStageProps[];
}

const TaskBoard: React.FC<TaskBoardProps> = (props): React.JSX.Element => {
    const { stages } = props;

    return (
        <React.Fragment>
            <Row gutter={[24, 24]}>
                {stages.map((eachStage, index) => (
                    <Col key={`board_stage_item_${index}`} span={24 / stages.length}>
                        <TaskBoardStage {...eachStage} />
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}

export { TaskBoard };