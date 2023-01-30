import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { TodoView } from "../components/Todos/TodoView";

const Home: NextPage = () => {
  const { status } = useSession();
  if (status === "authenticated") return <TodoView></TodoView>;
  return <Welcome></Welcome>;
};

export default Home;

const Welcome: React.FC = () => {
  return (
    <section className="flex grow flex-col items-center justify-center">
      <button
        onClick={() => void signIn()}
        type="button"
        className="rounded-lg bg-green-300 py-2 px-4 font-medium text-emerald-800"
      >
        sign in here
      </button>
    </section>
  );
};
