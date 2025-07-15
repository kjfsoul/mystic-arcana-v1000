import React from "react";
import Image from "next/image";
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
  return (
    <div className={styles.tarotcard}>
      <Image 
        src={cardImage} 
        alt={cardName} 
        width={200} 
        height={300} 
        className={styles.cardImage}
      />
      <h3>{cardName}</h3>
      <p>{cardMeaning}</p>
    </div>
  );
};

export default TarotCard;
