import { useEffect } from "react";

import type { Task } from "@src/types/task";
import { mockApi } from "@src/services/mockApi";
import { mockWebSocket, WebSocketEventType } from "@src/services/mockWebSocket";
import { useAppDispatch } from "./useReduxStore";
import * as store from "../store/taskSlice";

interface UseTaskService {
    createTask: (task: Task) => Promise<void>;
    updateTaskById: (taskId: Task['id'], task: Partial<Task>) => Promise<void>;
    deleteTask: (task: Task['id']) => Promise<void>;
}

const useTaskService = (): UseTaskService => {
    const dispatch = useAppDispatch();

    const fetchTasks = async (): Promise<void> => {
        try {
            const response = await mockApi.getTasks();
            dispatch(store.setTasks(response));
        } catch (error) {
            throw error;
        }
    };

    const createTask = async (task: Task): Promise<void> => {
        try {
            const response = await mockApi.createTask(task);
            dispatch(store.addTask(response));
        } catch (error) {
            dispatch(store.setError(error as string));
            throw error;
        }
    };

    const deleteTask = async (taskId: Task['id']): Promise<void> => {
        try {
            await mockApi.deleteTask(taskId);
            dispatch(store.removeTask(taskId));
        } catch (error) {
            dispatch(store.setError(error as string));
            throw error;
        }
    };

    const updateTaskById = async (taskId: Task['id'], task: Partial<Task>): Promise<void> => {
        try {
            const response = await mockApi.updateTask(taskId, task);
            dispatch(store.updateTask(response));
        } catch (error) {
            dispatch(store.setError(error as string));
            throw error;
        }
    }

    useEffect(() => {
        fetchTasks();

        mockWebSocket.connect();

        const unsubscribe = mockWebSocket.subscribe((message) => {
            const messageTypesMap: Partial<Record<WebSocketEventType, () => void>> = {
                [WebSocketEventType.TASK_UPDATE]: () => {
                    console.log("Received task update:", message.payload as Task);
                    dispatch(store.updateTask(message.payload as Task));
                },
                [WebSocketEventType.TASK_CREATE]: () => {
                    console.log("Received task create:", message.payload as Task);
                    dispatch(store.addTask(message.payload as Task));
                },
                [WebSocketEventType.TASK_DELETE]: () => {
                    console.log("Received task delete:", (message.payload as Task).id);
                    dispatch(store.removeTask((message.payload as Task).id));
                },
            }

            messageTypesMap[message.type]?.();
        });

        return () => {
            unsubscribe();
            mockWebSocket.disconnect();
        };
    }, [dispatch]);

    return {
        createTask,
        updateTaskById,
        deleteTask,
    }
}

export { useTaskService };