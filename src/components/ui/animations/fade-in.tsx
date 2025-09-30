import { motion } from "motion/react";
export const FadeIn = ({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.2, delay, ease: "easeOut" }}
      viewport={{ margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
