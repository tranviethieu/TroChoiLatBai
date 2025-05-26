import { motion } from 'framer-motion';

type StartScreenProps = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-white  flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold mb-6 text-gray-800">🎮 Lật Bài Ký Ức</h1>
      <button
        onClick={onStart}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded shadow"
      >
        Bắt đầu chơi
      </button>
    </motion.div>
  );
}
