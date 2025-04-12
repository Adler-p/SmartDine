import React from "react";
import styles from "./StatusUpdateButton.module.css"; 

const StatusUpdateButton = ({ status, onStatusChange }) => {
    return (
        <span className={styles.statusButtons}>
            <button
                className={styles.tickBtn}
                onClick={() => onStatusChange("Completed")}
                disabled={status === "Completed"}
            >
                ✔️
            </button>
            <button
                className={styles.crossBtn}
                onClick={() => onStatusChange("Cancelled")}
                disabled={status === "Cancelled"}
            >
                ❌
            </button>
        </span>
    );
};

export default StatusUpdateButton;
