const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col bg-gray-100">{children}</main>
    </>
  );
};

export { Layout };

const Header: React.FC = () => {
  return (
    <header className="relative bg-gray-100  py-4 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/10 to-transparent"></div>
      <h2 className="text-xl font-semibold text-gray-800">your todo app</h2>
    </header>
  );
};
