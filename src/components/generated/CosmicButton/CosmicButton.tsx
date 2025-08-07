import React from "react";
import styles from "./CosmicButton.module.css";
interface CosmicButtonProps {
  text: string;
  onClick: string;
  variant: string;
}
const CosmicButton: React.FC<CosmicButtonProps> = ({
  text,
  onClick,
  variant,
}) => {
  return (
    <div
      className={`${styles.cosmicbutton} ${styles[variant] || ""}`}
      onClick={() => onClick}
    >
      {text}
    </div>
  );
};
export default CosmicButton;
