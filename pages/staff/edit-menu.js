import React, { useState, useEffect } from 'react';
import StaffHeader from '../../components/StaffHeader';
import StaffSidebarMenu from '../../components/StaffSidebarMenu';
import styles from './EditMenu.module.css';
import axios from 'axios';

const EditMenu = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenuItems = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/menu', {
                    params: { category: selectedCategory !== 'All' ? selectedCategory : undefined },
                });
                setMenuItems(response.data);
                setError(null); // Clear any previous error
            } catch (err) {
                setError('Failed to load menu items.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [selectedCategory]);

    const toggleAvailability = async (id) => {
        try {
            const item = menuItems.find(item => item.id === id);
            await axios.put(`/api/menu/${id}/out-of-stock`, {}, { headers: { Authorization: `Bearer ${yourToken}` } });
            setMenuItems(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, availability: 'out_of_stock' } : item
                )
            );
        } catch (error) {
            console.error('Error updating item availability', error);
        }
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
                    {loading && <p>Loading menu items...</p>}
                    {error && <p>{error}</p>}
                    <div className={styles.grid}>
                        {filteredItems.map(item => (
                            <div key={item.id} className={styles.card}>
                                <img src={item.imageUrl} alt={item.name} className={styles.image} />
                                <h3>{item.name}</h3>
                                <p>${item.price.toFixed(2)}</p>
                                <button
                                    onClick={() => toggleAvailability(item.id)}
                                    className={item.availability === 'available' ? styles.unavailableBtn : styles.availableBtn}
                                >
                                    {item.availability === 'available' ? "Mark as Unavailable" : "Mark as Available"}
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
