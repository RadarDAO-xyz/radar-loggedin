const tokenStoreLoc = 'discord_access_token';
const tokenExpLoc = 'discord_expires_in';

const getAccessToken = () => localStorage.getItem(tokenStoreLoc);
const getExpiresAt = () => localStorage.getItem(tokenExpLoc);

let cachedUser = null;
const getUser = async (useCache = true) => {
    if (useCache && cachedUser) return cachedUser;
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${getAccessToken()}`);
    const user = await fetch('https://discord.com/api/users/@me', {
        headers
    }).then(r => r.json());
    return user;
};

const isLoggedIn = () => getAccessToken() && getExpiresAt() > Date.now();

if (document.location.hash.length > 0) {
    const urlparams = new URLSearchParams(document.location.hash.substring(1));
    const acctok = urlparams.get('access_token');
    const expin = urlparams.get('expires_in');
    if (acctok.length > 0 && expin.length > 0) {
        localStorage.setItem(tokenStoreLoc, acctok);
        localStorage.setItem(tokenExpLoc, expin * 1000 + Date.now());
    }
}

const loginButton = document.getElementById(LOGIN_BUTTON_ID);

if (loginButton) {
    loginButton.addEventListener('click', ev => {
        ev.preventDefault();
        document.location = `https://discord.com/oauth2/authorize?&client_id=${CLIENT_ID}&response_type=token&scope=identify%20email&redirect_uri=${encodeURIComponent(
            REDIRECT
        )}`;
    });
}

const logoutButton = document.getElementById(LOGOUT_BUTTON_ID);

if (logoutButton) {
    logoutButton.addEventListener('click', ev => {
        localStorage.removeItem(tokenStoreLoc);
        localStorage.removeItem(tokenExpLoc);
        document.location.hash = '';
        document.location.reload();
    });
}
