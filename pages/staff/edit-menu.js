// pages/staff/edit-menu.js
import React, { useState } from 'react';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebarMenu from '../../components/StaffSidebarMenu';
import styles from './EditMenu.module.css';

const mockMenu = [
    // Chicken
    { id: 1, name: "Grilled Chicken", category: "Chicken", price: 10.00, img: "/chicken1.jpg", available: true },
    { id: 2, name: "Spicy Fried Chicken", category: "Chicken", price: 13.00, img: "/chicken2.jpg", available: true },

    // Fish
    { id: 3, name: "Fish & Chips", category: "Fish", price: 13.00, img: "/fish1.jpg", available: false },
    { id: 4, name: "Grilled Salmon", category: "Fish", price: 15.00, img: "/fish2.jpg", available: true },

    // Steak
    { id: 5, name: "Sirloin Steak", category: "Steak", price: 21.00, img: "/steak1.jpg", available: true },
    { id: 6, name: "Ribeye Steak", category: "Steak", price: 25.00, img: "/steak2.jpg", available: true },

    // Burger
    { id: 7, name: "Classic Beef Burger", category: "Burger", price: 12.00, img: "/burger1.jpg", available: true },
    { id: 8, name: "Chicken Burger", category: "Burger", price: 10.00, img: "/burger2.jpg", available: false },

    // Spaghetti
    { id: 9, name: "Spaghetti Carbonara", category: "Spaghetti", price: 15.00, img: "/spaghetti1.jpg", available: true },
    { id: 10, name: "Spaghetti Bolognese", category: "Spaghetti", price: 15.00, img: "/spaghetti2.jpg", available: true },

    // Drinks
    { id: 11, name: "Iced Lemon Tea", category: "Drinks", price: 2.50, img: "/drink1.jpg", available: true },
    { id: 12, name: "Coca-Cola", category: "Drinks", price: 2.50, img: "/drink2.jpg", available: true },
    { id: 12, name: "Ice Water", category: "Drinks", price: 1.50, img: "/drink2.jpg", available: true },

    // Add more...
];

const EditMenu = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [menuItems, setMenuItems] = useState(mockMenu);

    const toggleAvailability = (id) => {
        setMenuItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, available: !item.available } : item
            )
        );
    };

    const filteredItems = selectedCategory === 'All'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <>
            <StaffHeader />
            <div className={styles.pageLayout}>
                <StaffSidebarMenu selected={selectedCategory} onSelect={setSelectedCategory} />
                <div className={styles.content}>
                    <h2>Edit Menu</h2>
                    <div className={styles.grid}>
                        {filteredItems.map(item => (
                            <div key={item.id} className={styles.card}>
                                <img src={item.img} alt={item.name} className={styles.image} />
                                <h3>{item.name}</h3>
                                <p>${item.price.toFixed(2)}</p>
                                <button
                                    onClick={() => toggleAvailability(item.id)}
                                    className={item.available ? styles.unavailableBtn : styles.availableBtn}
                                >
                                    {item.available ? "Mark as Unavailable" : "Mark as Available"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditMenu;
