import * as React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { Colors } from "../styles/color";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Direction, GestureEventType, Coordinate } from "../types/types";
import Snake from "./Snake";
import { checkGameOver } from "../utils/checkGameOver";
import Food from "./Food";
import { checkEatsFood } from "../utils/checkEatsFood";
import { randomFoodPosition } from "../utils/randomFoodPosition";
import Header from "./Header";
import { Dimensions } from "react-native";

const SNAKE_INITIAL_POSITION = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION = { x: 5, y: 20 };
const { width, height } = Dimensions.get("window");
const TAIL_SIZE = 10.9;
const GAME_BOUNDS = {
  xMin: 0,
  xMax: Math.floor(width / TAIL_SIZE),
  yMin: 0,
  yMax: Math.floor(height / TAIL_SIZE),
};
const MOVE_INTERVAL = 50;
const SCORE_INCREMENT = 10;

export default function Game(): JSX.Element {
  const [direction, setDirection] = React.useState<Direction>(Direction.Right);
  const [snake, setSnake] = React.useState<Coordinate[]>(
    SNAKE_INITIAL_POSITION
  );
  const [food, setFood] = React.useState<Coordinate>(FOOD_INITIAL_POSITION);
  const [isGameOver, setIsGameOver] = React.useState<boolean>(false);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [score, setScore] = React.useState<number>(0);
  const [scoresFinal, setScoresFinal] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!isGameOver) {
      const intervalId = setInterval(() => {
        !isPaused && moveSnake();
      }, MOVE_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [snake, isGameOver, isPaused]);

  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead = { ...snakeHead }; //create a copy

    // game over
    if (checkGameOver(snakeHead, GAME_BOUNDS)) {
      setIsGameOver((prev) => !prev);

      // Met à jour les scores
      updateScores(score);
      return;
    }

    switch (direction) {
      case Direction.Up:
        newHead.y -= 1;
        break;
      case Direction.Down:
        newHead.y += 1;
        break;
      case Direction.Right:
        newHead.x += 1;
        break;
      case Direction.Left:
        newHead.x -= 1;
        break;
      default:
        break;
    }

    //if eats food
    if (checkEatsFood(newHead, food, 2)) {
      //get another position for apple
      setFood(randomFoodPosition(GAME_BOUNDS.xMax, GAME_BOUNDS.yMax));
      setSnake([newHead, ...snake]);
      setScore(score + SCORE_INCREMENT);
    } else {
      // grow snake
      setSnake([newHead, ...snake.slice(0, -1)]);
    }
  };

  const updateScores = (currentScore: number) => {
    // Ajout du nouveau score à la liste des scores
    const updatedScores = [...scoresFinal, currentScore];

    // Triez les scores par ordre décroissant
    updatedScores.sort((a, b) => b - a);

    // Sélectionnez les trois meilleurs scores
    const topThreeScores = updatedScores.slice(0, 3);

    // Met à jour l'état des scores
    setScoresFinal(topThreeScores);
  };

  const handleGesture = (event: GestureEventType) => {
    // console.log(event.nativeEvent);
    const { translationX, translationY } = event.nativeEvent;
    // console.log(translationX, translationY);
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0) {
        //moving right
        setDirection(Direction.Right);
      } else {
        //moving left
        setDirection(Direction.Left);
      }
    } else {
      if (translationY > 0) {
        //moving down
        setDirection(Direction.Down);
      } else {
        //moving up
        setDirection(Direction.Up);
      }
    }
  };

  const reloadGame = () => {
    setSnake(SNAKE_INITIAL_POSITION);
    setFood(FOOD_INITIAL_POSITION);
    setIsGameOver(false);
    setScore(0);
    setDirection(Direction.Right);
    setIsPaused(false);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <SafeAreaView style={styles.container}>
        <Header
          isPaused={isPaused}
          pauseGame={pauseGame}
          reloadGame={reloadGame}
        >
          <Text
            style={{ fontSize: 22, fontWeight: "bold", color: Colors.primary }}
          >
            {score}
          </Text>
        </Header>
        {isGameOver ? (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>
              Game Over !!! Push Reload button to play again 🐍
            </Text>
            <Text style={styles.scoresTitle}>Top 3 Scores:</Text>
            {scoresFinal.map((s, index) => (
              <Text key={index} style={styles.scoreItem}>
                {index + 1}. {s}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.boundaries}>
            <Snake snake={snake} />
            <Food x={food.x} y={food.y} />
          </View>
        )}
      </SafeAreaView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    flex: 1,
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderColor: Colors.primary,
    borderWidth: 5,
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  scoresTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    color: Colors.secondary,
  },

  scoreItem: {
    fontSize: 20,
    marginVertical: 8,
    fontWeight: "bold",
    color: Colors.tertiary,
  },
});
