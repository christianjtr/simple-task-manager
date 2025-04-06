import { useEffect, useState } from "react";
import { mockApi } from "@src/services/mockApi";
import { Task } from "@src/types/task";
import { mockWebSocket, WebSocketEventType } from "@src/services/mockWebSocket";

interface UseTaskService {
    tasks: Task[];
}

const useTaskService = (): UseTaskService => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const getTasks = async (): Promise<void> => {
        const response = await mockApi.getTasks();
        setTasks(response);
    };

    useEffect(() => {
        getTasks();

        return () => {
            // unsubscribe();
            mockWebSocket.disconnect();
        };
    }, []);

    return {
        tasks,
    };
}

export { useTaskService };