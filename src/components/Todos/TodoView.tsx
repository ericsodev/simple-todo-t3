import { useSession } from "next-auth/react";
import { trpc } from "../../utils/api";
import { CreateTodo } from "./CreateTodo";
import { TodoList } from "./TodoList";

const TodoView: React.FC = () => {
  const { data: session } = useSession();
  const utils = trpc.useContext();
  return (
    <section className="flex grow flex-col gap-2 md:px-10 md:py-4">
      <section className="self-center py-20">
        <h1 className="text-2xl text-gray-900">
          hey there,{" "}
          <strong className="font-semibold">{session?.user?.name}</strong>
        </h1>
      </section>
      <section className="w-full grow self-center px-4 md:w-1/2 lg:w-1/3 2xl:w-1/4">
        <CreateTodo
          refetchTodo={() => void utils.todo.invalidate()}
        ></CreateTodo>
        <TodoList></TodoList>
      </section>
    </section>
  );
};

export { TodoView };
