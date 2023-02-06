import { Dialog, Transition } from "@headlessui/react";
import dayjs from "dayjs";
import type { SetStateAction } from "react";
import { Fragment } from "react";
import type { TodoItemType } from "../../utils/api";
import { trpc } from "../../utils/api";
type Props = {
  isOpen: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  item: TodoItemType;
};
const TodoModal: React.FC<Props> = ({ item, isOpen, setOpen }) => {
  const util = trpc.useContext();
  const deleteMutation = trpc.todo.deleteTodo.useMutation();
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ todoId: item.id });
    await util.todo.getTodos.invalidate();

    setOpen(false);
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {item.name}
                </Dialog.Title>
                <div className="mt-2">
                  {item.dueDate && (
                    <h2 className="font-medium text-gray-600">
                      {dayjs(item.dueDate).format("MMM D, YYYY")}
                    </h2>
                  )}
                  {item.desc && (
                    <h2 className="mt-4 text-gray-700">{item.desc}</h2>
                  )}
                  <span className="flex">
                    <button
                      onClick={() => {
                        void handleDelete();
                      }}
                      className="ml-auto rounded-lg bg-red-300 px-3 py-1.5 text-sm font-medium text-black/70 transition-all"
                    >
                      {deleteMutation.isLoading ? "deleting" : "delete"}
                    </button>
                  </span>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export { TodoModal };
