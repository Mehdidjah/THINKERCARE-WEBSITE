export const Underline = ({
  children,
  height = "2px",
  bottom = "0",
  background = "var(--color-foreground)",
}: {
  children: React.ReactNode;
  height?: string;
  bottom?: string;
  background?: string;
}) => {
  return (
    <div className="relative group/underline">
      {children}
      <div
        className={`absolute bottom-1 left-0 w-0 group-hover/underline:w-full transition-[width] delay-50 duration-300`}
        style={{ height, bottom, background }}
      ></div>
    </div>
  );
};
