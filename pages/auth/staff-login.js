import { useRouter } from 'next/router';
import { useState } from 'react';
import Link from 'next/link';
import styles from './StaffLogin.module.css';
import { AUTH_IP } from '../../constants';

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(AUTH_IP + '/api/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // include cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login success:', data);

        sessionStorage.setItem('accessToken', data?.accessToken);
        router.push('/staff');
      } else {
        const errorData = await response.json();
        setError(errorData.errors?.[0]?.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <h1 className={styles.headerTitle}>SmartDine</h1>

        <div className={styles.loginContainer}>
          {error && <div className={styles.errorText}>{error}</div>}

          <div className={styles.inputBox}>
            <label>Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button onClick={handleLogin} className={styles.button}>
            Login as Staff
          </button>

          <Link href="/">
            <button className={styles.button}>Back to Login</button>
          </Link>
          <Link href="/staff/staff-signup">
            <button className="button">Sign Up Staff Account</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
