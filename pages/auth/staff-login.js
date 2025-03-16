import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import styles from './StaffLogin.module.css';

export default function StaffLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Just redirecting for now
        router.push('/staff');
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageContent}>
                <h1 className={styles.headerTitle}>SmartDine</h1>

                <div className={styles.loginContainer}>
                    <div className={styles.inputBox}>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>

                    <div className={styles.inputBox}>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>

                    <button onClick={handleLogin} className={styles.button}>Login as Staff</button>

                    <Link href="/">
                        <button className={styles.button}>Back to Login</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
