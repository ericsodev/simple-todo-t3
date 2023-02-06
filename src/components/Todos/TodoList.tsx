import { trpc } from "../../utils/api";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { TodoItem } from "./TodoItem";
import type { TodoItemType } from "../../utils/api";

const TodoList: React.FC = () => {
  const { data } = trpc.todo.getTodos.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const orderMutation = trpc.todo.reorderTodos.useMutation();
  const utils = trpc.useContext();
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const todoOrders = useMemo(() => todos.map((x) => x.order), [todos]);
  useEffect(() => {
    if (data) setTodos(data);
  }, [data, setTodos]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (active.id === over?.id || !over) return;
    setTodos((prev) => {
      const activeIdx = prev.findIndex((x) => x.order === active.id);
      const overIdx = prev.findIndex((x) => x.order === over?.id) ?? 0;
      if (!prev[activeIdx] || !prev[overIdx]) return prev;
      void orderMutation
        .mutateAsync({
          todoId: (prev[activeIdx] as TodoItemType).id,
          newOrder: overIdx + 1, // 1-based indexing in db order
        })
        .then(() => {
          void utils.todo.getTodos.invalidate();
        });
      return arrayMove(prev, activeIdx, overIdx);
    });
  };
  if (!todos) return <div>loading</div>;
  return (
    <div className="flex flex-col gap-2">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={todoOrders}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((todo) => (
            <TodoItem key={todo.id} item={todo}></TodoItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export { TodoList };
