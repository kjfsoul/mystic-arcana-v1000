import React from "react";
import styles from "./TarotCard.module.css";

interface TarotCardProps {
  cardName: string;
  cardImage: string;
  cardMeaning: string;
}

const TarotCard: React.FC<TarotCardProps> = ({
  cardName,
  cardImage,
  cardMeaning,
}) => {
  return <div className={styles.tarotcard}>{/* Component content */}</div>;
};

export default TarotCard;
