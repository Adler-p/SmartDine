// components/StaffSidebarMenu.js
import React from 'react';
import styles from './StaffSidebarMenu.module.css';

const categories = ['All', 'Chicken', 'Fish', 'Steak', 'Burger', 'Spaghetti', 'Drinks'];

const StaffSidebarMenu = ({ selected, onSelect }) => {
    return (
        <div className={styles.sidebar}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.categoryButton} ${selected === cat ? styles.active : ''}`}
                    onClick={() => onSelect(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default StaffSidebarMenu;
