import React from "react";
import styles from "./Wxyz.module.css";

function WxyzParticipant(props) {
  const lives = [];
  for (let j = 0; j < parseInt(props.i.lives); j++) {
    lives.push("⭐");
  }

  const location = {
    position: "absolute",
    left: props.locateX[props.index],
    top: props.locateY[props.index],
    transform: "translate(-50%,-50%)",
  };

  return (
    <div style={location} className={styles.participantSpot}>
      <p style={{ textAlign: "center" }}>{props.i.username}</p>
      {lives.map((i) => (
        <span>{i}</span>
      ))}
    </div>
  );
}

export default WxyzParticipant;
