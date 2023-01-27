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
    <section>
      hello
      <button onClick={() => void signIn()} type="button">
        sign in here
      </button>
    </section>
  );
};
