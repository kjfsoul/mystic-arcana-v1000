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
  return <div className={styles.cosmicbutton}>{/* Component content */}</div>;
};

export default CosmicButton;
