import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import type { TodoItemType } from "../../utils/api";
import { TodoModal } from "./TodoModal";

const TodoItem: React.FC<{ item: TodoItemType }> = ({ item }) => {
  const [modalOpen, setModalOpen] = useState(false);
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
    <div ref={setNodeRef} style={style}>
      <TodoModal
        isOpen={modalOpen}
        setOpen={setModalOpen}
        item={item}
      ></TodoModal>
      <div
        onClick={() => setModalOpen(true)}
        tabIndex={0}
        className="group grid cursor-pointer grid-cols-12 rounded-md bg-slate-200 py-2 px-4 hover:bg-slate-300 focus:bg-slate-200/60 focus:outline focus:outline-2 focus:outline-slate-500"
      >
        <h2 className="col-span-8 font-medium text-slate-800">{item.name}</h2>
        <span className="col-span-3"></span>
        <span
          className="col-span-1 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          {...attributes}
          {...listeners}
        >
          <ChevronUpDownIcon className="h-5 w-5"></ChevronUpDownIcon>
        </span>
      </div>
    </div>
  );
};

export { TodoItem };
