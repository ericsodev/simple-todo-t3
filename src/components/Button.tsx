interface Props extends React.PropsWithChildren {
  size: "sm" | "base" | "md" | "large";
  color: "";
}
const Button: React.FC<Props> = ({ children }) => {
  return <button>{children}</button>;
};

export { Button };
