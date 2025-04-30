import React from 'react';
import styles from './DeleteItemButton.module.css';

const DeleteItemButton = ({ onDelete }) => {
  return (
    <span className={styles.statusButtons}>
      <button className={styles.crossBtn} onClick={onDelete}>
        ❌
      </button>
    </span>
  );
};

export default DeleteItemButton;
