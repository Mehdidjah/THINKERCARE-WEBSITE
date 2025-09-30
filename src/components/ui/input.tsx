const cn = (...classes: string[]) => classes.join(" ");

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => {
  return (
    <input
      className={cn(`border-b focus:outline-none text-xl p-2 ${className}`)}
      {...props}
    />
  );
};
