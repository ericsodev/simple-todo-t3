import { trpc } from "../../utils/api";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import type { RouterOutputs } from "../../utils/api";
import { useEffect, useMemo, useState } from "react";

type TodoItem = RouterOutputs["todo"]["getTodos"][0];

const TodoList: React.FC = () => {
  const { data } = trpc.todo.getTodos.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const orderMutation = trpc.todo.reorderTodos.useMutation();
  const [todos, setTodos] = useState<TodoItem[]>([]);
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
      orderMutation.mutate({
        todoId: (prev[activeIdx] as TodoItem).id,
        newOrder: overIdx,
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

const TodoItem: React.FC<{ item: TodoItem }> = ({ item }) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: item.order,
      transition: {
        duration: 150, // milliseconds
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <div
        tabIndex={0}
        className="grid cursor-pointer grid-cols-12 rounded-md bg-slate-200 py-2 px-4 hover:bg-slate-300 focus:bg-slate-200/60 focus:outline focus:outline-2 focus:outline-slate-500"
      >
        <h2 className="col-span-8 font-medium text-slate-800">{item.name}</h2>
      </div>
    </div>
  );
};

export { TodoList };
