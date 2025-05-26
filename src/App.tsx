import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StartScreen from "./components/StartScreen";

// Kiểu dữ liệu cho thẻ bài
type CardType = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

// Hàm sinh bài ngẫu nhiên
const generateCards = (): CardType[] => {
  const values = Array.from({ length: 10 }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const paired = [...values, ...values];
  const shuffled = paired.sort(() => 0.5 - Math.random());

  return shuffled.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
};

export default function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [steps, setSteps] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);

  const timerRef = useRef<any | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (cards.length && cards.every((card) => card.isMatched)) {
      setIsRunning(false);
    }
  }, [cards]);

  const shuffleAnimation = () => {
    setIsShuffling(true);
    const total = cards.length;
    const middle = Math.floor(total / 2);

    const revealInterval = 30; // ms delay between each card
    const updated = [...cards];

    // Lật từng lá từ giữa ra ngoài
    for (let i = 0; i < total; i++) {
      const index =
        i % 2 === 0 ? middle + Math.floor(i / 2) : middle - Math.ceil(i / 2);
      setTimeout(() => {
        updated[index].isFlipped = true;
        setCards([...updated]);
      }, i * revealInterval);
    }

    // Sau 800ms, úp lại tất cả
    setTimeout(() => {
      setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
      setIsShuffling(false);
    }, total * revealInterval + 500);
  };

  const startGame = () => {
    const newDeck = generateCards();
    setCards(newDeck);
    setSteps(0);
    setTime(0);
    setFlippedIndexes([]);
    setIsRunning(true);
    setShowStart(false);
    setTimeout(() => {
      shuffleAnimation();
    }, 200);
  };

  // const resetGame = () => {
  //   const newDeck = generateCards();
  //   setCards(newDeck);
  //   setSteps(0);
  //   setTime(0);
  //   setFlippedIndexes([]);
  //   setIsRunning(true);
  //   shuffleAnimation();
  // };
  const resetGame = () => {
    const newDeck = generateCards();
    setCards(newDeck);
    setShowStart(true); // quay lại màn hình bắt đầu
    setIsRunning(false);
  };

  const handleFlip = (index: number) => {
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndexes.length === 2 ||
      isShuffling
    )
      return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    const newFlipped = [...flippedIndexes, index];

    setCards(newCards);
    setFlippedIndexes(newFlipped);

    if (newFlipped.length === 2) {
      setSteps((s) => s + 1);
      const [i1, i2] = newFlipped;

      if (newCards[i1].value === newCards[i2].value) {
        setTimeout(() => {
          const updated = [...newCards];
          updated[i1].isMatched = true;
          updated[i2].isMatched = true;
          setCards(updated);
          setFlippedIndexes([]);
        }, 500);
      } else {
        setTimeout(() => {
          const updated = [...newCards];
          updated[i1].isFlipped = false;
          updated[i2].isFlipped = false;
          setCards(updated);
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4">
      <AnimatePresence>
        {showStart && <StartScreen onStart={startGame} />}
      </AnimatePresence>

      {!showStart && (
        <>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            🃏 Game Lật Bài
          </h1>

          <div className="flex gap-6 text-lg mb-4">
            <p>
              ⏱️ Thời gian: <span className="font-bold">{time}s</span>
            </p>
            <p>
              🌀 Số bước: <span className="font-bold">{steps}</span>
            </p>
            <button
              onClick={resetGame}
              className="ml-4 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
            >
              🔄 Chơi lại
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`w-20 h-28 relative cursor-pointer ${
                  card.isMatched ? "invisible" : ""
                }`}
                onClick={() => handleFlip(index)}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute w-full h-full rounded-lg shadow-lg"
                  animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute w-full h-full bg-blue-500 rounded-lg backface-hidden flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">?</span>
                  </div>
                  <div
                    className="absolute w-full h-full bg-white rounded-lg text-black flex items-center justify-center backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <span className="text-2xl font-bold">
                      {card.isFlipped ? card.value : ""}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {cards.length > 0 && cards.every((c) => c.isMatched) && (
            <div className="mt-6 text-xl text-green-700 font-bold">
              🎉 Bạn đã hoàn thành trò chơi!
            </div>
          )}
        </>
      )}
    </div>
  );
}
