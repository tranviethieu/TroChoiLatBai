import { useEffect, useState, useRef } from "react";
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

    const revealInterval = 30;
    const updated = [...cards];

    for (let i = 0; i < total; i++) {
      const index =
        i % 2 === 0 ? middle + Math.floor(i / 2) : middle - Math.ceil(i / 2);
      setTimeout(() => {
        updated[index].isFlipped = true;
        setCards([...updated]);
      }, i * revealInterval);
    }

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

  const resetGame = () => {
    const newDeck = generateCards();
    setCards(newDeck);
    setShowStart(true);
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
      {showStart ? (
        <StartScreen onStart={startGame} />
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            🃏 Game Lật Bài
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-lg mb-4">
            <p>
              ⏱️ Thời gian: <span className="font-bold">{time}s</span>
            </p>
            <p>
              🌀 Số bước: <span className="font-bold">{steps}</span>
            </p>
            <button
              onClick={resetGame}
              className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
            >
              🔄 Chơi lại
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`card-3d w-20 h-28 sm:w-24 sm:h-32 ${
                  card.isMatched ? "invisible" : ""
                }`}
                onClick={() => handleFlip(index)}
              >
                <div
                  className={`card-inner ${
                    card.isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  <div className="card-front">?</div>
                  <div className="card-back">{card.value}</div>
                </div>
              </div>
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
