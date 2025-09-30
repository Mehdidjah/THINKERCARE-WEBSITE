import { motion } from "motion/react";

export const HeaderOverlay = () => {
  return (
    <motion.h2 className="absolute top-0 flex h-[calc(42%)] text-[calc(1.3vw+7px)] xl:text-[25px]/[1.2] w-full items-center justify-evenly text-end text-primary font-mono">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ duration: 0.01, delay: 0.1 }}
      >
        WHEN
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ duration: 0.01, delay: 0.2 }}
      >
        THINKERS
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ duration: 0.01, delay: 0.3 }}
      >
        BECOMES
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 100 }}
        transition={{ duration: 0.01, delay: 0.4 }}
      >
        MAKERS
      </motion.div>
    </motion.h2>
  );
};
