import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function StaffLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Just redirecting for now
        router.push('/staff');
    };

    return (
        <div className="container">
            <h1>SmartDine</h1>

            <div className="loginContainer">
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="inputBox"
                />

                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="inputBox"
                />

                <button onClick={handleLogin} className="button">Login as Staff</button>

                <Link href="/">
                    <button className="button">Back to Login</button>
                </Link>
            </div>
        </div>
    );
}
