import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './StaffHeader.module.css';
import { BACKEND_IP } from '../constants';

const StaffHeader = () => {
    const router = useRouter();

    // Function to handle logout
    const handleLogout = async () => {
        try {
            // Send a POST request to the logout API
            const res = await fetch(BACKEND_IP + '/api/users/signout', {
                method: 'POST',
                credentials: 'include',
            });

            if (res.ok) {
                // If logout is successful, redirect to the login page
                router.push(BACKEND_IP + '/auth/staff-login');
            } else {
                alert('Logout failed');
            }
        } catch (err) {
            console.error('Error logging out:', err);
            alert('Error logging out');
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftButtons}>
                <Link href="/staff/edit-menu">
                    <a>
                        <button className={styles.button}>Edit Menu</button>
                    </a>
                </Link>
                <Link href="/staff/past-orders">
                    <a>
                        <button className={styles.button}>View All Past Orders</button>
                    </a>
                </Link>
            </div>
            <div className={styles.title}>
                <Link href="/staff">
                    <a><span>SmartDine</span></a>
                </Link>
            </div>
            <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </header>
    );
};

export default StaffHeader;
