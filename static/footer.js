// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API = 'https://api.radardao.xyz';

const tokenStoreLoc = 'discord_access_token';
const tokenExpLoc = 'discord_expires_in';

const getAccessToken = () => localStorage.getItem(tokenStoreLoc);
const getExpiresAt = () => localStorage.getItem(tokenExpLoc);

let cachedUser = null; // This becomes a promise

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUser = async (useCache = true) => {
    if (useCache && cachedUser) return cachedUser;
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${getAccessToken()}`);
    const user = fetch('https://discord.com/api/users/@me', {
        headers
    }).then(r => r.json());
    cachedUser = user;
    return user;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isLoggedIn = () => getAccessToken() && getExpiresAt() > Date.now();

/**
 * Checks if login credentials are available in the URL
 */
if (document.location.hash.length > 0) {
    const urlparams = new URLSearchParams(document.location.hash.substring(1));
    const acctok = urlparams.get('access_token');
    const expin = urlparams.get('expires_in');
    if (acctok.length > 0 && expin.length > 0) {
        localStorage.setItem(tokenStoreLoc, acctok);
        localStorage.setItem(tokenExpLoc, expin * 1000 + Date.now());
    }
}

/**
 * Checks if logged in member is in RADAR server
 */
async function checkRadarMember() {
    if (isLoggedIn()) {
        const { is_member } = await fetch(
            `${API}/isMember/${await getUser().then(u => u.id)}`
        ).then(r => r.json());
        if (!is_member) logout();
    }
}

const loginButton = document.getElementById('login');

if (loginButton) {
    loginButton.addEventListener('click', ev => {
        ev.preventDefault();
        document.location = `https://discord.com/oauth2/authorize?&client_id=${CLIENT_ID}&response_type=token&scope=identify%20email&redirect_uri=${location.protocol}//${location.host}/`;
    });
}

const logoutButton = document.getElementById('logout');

async function logout() {
    localStorage.removeItem(tokenStoreLoc);
    localStorage.removeItem(tokenExpLoc);
    document.location.hash = '';
    document.location.reload();
}

if (logoutButton) logoutButton.addEventListener('click', logout);

checkRadarMember();
