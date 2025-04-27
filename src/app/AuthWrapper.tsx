import React from 'react';
import Cookies from 'js-cookie';
import ChunkLoader from '@/components/loader/chunk-loader';
import { generateDerivApiInstance } from '@/external/bot-skeleton/services/api/appId';
import { observer as globalObserver } from '@/external/bot-skeleton/utils/observer';
import { clearAuthData } from '@/utils/auth-utils';
import { localize } from '@deriv-com/translations';
import { URLUtils } from '@deriv-com/utils';
import App from './App';

const setLocalStorageToken = async (
    loginInfo: URLUtils.LoginInfo[],
    paramsToDelete: string[],
    setIsAuthComplete: React.Dispatch<React.SetStateAction<boolean>>
) => {
    if (loginInfo.length) {
        try {
            const defaultActiveAccount = URLUtils.getDefaultActiveAccount(loginInfo);
            if (!defaultActiveAccount) return;

            const accountsList: Record<string, string> = {};
            const clientAccounts: Record<string, { loginid: string; token: string; currency: string }> = {};

            loginInfo.forEach((account: { loginid: string; token: string; currency: string }) => {
                accountsList[account.loginid] = account.token;
                clientAccounts[account.loginid] = account;
            });

            localStorage.setItem('accountsList', JSON.stringify(accountsList));
            localStorage.setItem('clientAccounts', JSON.stringify(clientAccounts));

            URLUtils.filterSearchParams(paramsToDelete);
            const api = await generateDerivApiInstance();

            if (api) {
                const { authorize, error } = await api.authorize(loginInfo[0].token);
                api.disconnect();
                if (error) {
                    // Check if the error is due to an invalid token
                    if (error.code === 'InvalidToken') {
                        // Set isAuthComplete to true to prevent the app from getting stuck in loading state
                        setIsAuthComplete(true);

                        // Only emit the InvalidToken event if logged_state is true
                        if (Cookies.get('logged_state') === 'true') {
                            // Emit an event that can be caught by the application to retrigger OIDC authentication
                            globalObserver.emit('InvalidToken', { error });
                        }

                        if (Cookies.get('logged_state') === 'false') {
                            // If the user is not logged out, we need to clear the local storage
                            clearAuthData();
                        }
                    }
                } else {
                    const firstId = authorize?.account_list[0]?.loginid;
                    const filteredTokens = loginInfo.filter(token => token.loginid === firstId);
                    if (filteredTokens.length) {
                        localStorage.setItem('authToken', filteredTokens[0].token);
                        localStorage.setItem('active_loginid', filteredTokens[0].loginid);
                        return;
                    }
                }
            }

            localStorage.setItem('authToken', loginInfo[0].token);
            localStorage.setItem('active_loginid', loginInfo[0].loginid);
        } catch (error) {
            console.error('Error setting up login info:', error);
        }
    }
};

export const AuthWrapper = () => {
    const [isAuthComplete, setIsAuthComplete] = React.useState(false);
    const { loginInfo, paramsToDelete } = URLUtils.getLoginInfoFromURL();

    React.useEffect(() => {
        const initializeAuth = async () => {
            // Check if we're in production (your Cloudflare domain)
            const isProduction =
                window.location.hostname.includes('https://bot-2zd.pages.dev/') ||
                window.location.hostname.includes('cloudflare') ||
                window.location.hostname.includes('pages.dev');

            // For development: Use hardcoded credentials if no login info from URL
            if (!loginInfo.length) {
                if (isProduction) {
                    // In production, don't use hardcoded credentials
                    // Just set auth complete to show login page
                    console.log('Production environment detected. Skipping hardcoded credentials.');
                    setIsAuthComplete(true);
                } else {
                    // In development, use hardcoded credentials
                    console.log('Using development credentials for authentication');
                    const devLoginInfo = [
                        {
                            loginid: 'CR12345', // You can use any placeholder ID here
                            token: 'WBDJ0crRK3hyyXd', // Your API token
                            currency: 'USD', // Your account currency
                        },
                    ];

                    await setLocalStorageToken(devLoginInfo, paramsToDelete, setIsAuthComplete);
                }
            } else {
                // Normal flow for when URL contains login info
                await setLocalStorageToken(loginInfo, paramsToDelete, setIsAuthComplete);
            }

            URLUtils.filterSearchParams(['lang']);
            setIsAuthComplete(true);
        };
        initializeAuth();
    }, [loginInfo, paramsToDelete]);

    if (!isAuthComplete) {
        return <ChunkLoader message={localize('Initializing...')} />;
    }

    return <App />;
};
