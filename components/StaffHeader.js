import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; 
import styles from './StaffHeader.module.css';

const StaffHeader = () => {
    const router = useRouter(); 

    // Function to handle logout
    const handleLogout = () => {
        // Can add any logout logic here if necessary (e.g., clearing cookies, tokens, etc.)
        // Redirect to the main page (home page)
        router.push('/'); // Redirects to the main page (/pages/index.js)
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
