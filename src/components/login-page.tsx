import React from 'react';
import { localize } from '@deriv-com/translations';

export const LoginPage: React.FC = () => {
    const handleLogin = () => {
        // Use the exact URL that works
        window.location.href =
            'https://oauth.deriv.com/oauth2/authorize?app_id=39777&l=en&redirect_uri=https%3A%2F%2Fmytradeprofxbot.pages.dev%2Fcallback';
    };

    return (
        <div
            className='login-container'
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '2rem',
                backgroundColor: '#f5f5f5',
            }}
        >
            <div
                style={{
                    maxWidth: '400px',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white',
                    textAlign: 'center',
                }}
            >
                <h2 style={{ marginBottom: '1rem' }}>{localize('Welcome to MyTradeProfxBot')}</h2>
                <p style={{ marginBottom: '2rem' }}>
                    {localize('Please log in with your Deriv account to access your trading bot')}
                </p>
                <button
                    onClick={handleLogin}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#ff444f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                    }}
                >
                    {localize('Log in with Deriv')}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
