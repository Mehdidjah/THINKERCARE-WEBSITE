import { motion } from "motion/react";

export const HighlightHover = ({
  children,
  additional,
}: {
  children: React.ReactNode;
  additional?: string;
}) => {
  return (
    <motion.div
      className="relative inline"
      whileHover="hover"
      initial="initial"
    >
      {children}
      <motion.div
        variants={{
          initial: { width: 0 },
          hover: { width: `calc(100% + ${additional || "0px"})` },
        }}
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-1 left-0 -top-1 bg-primary -z-10"
      />
    </motion.div>
  );
};
