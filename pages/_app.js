// pages/_app.js
import '../styles/global.css';  // Import the global styles

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default MyApp;
