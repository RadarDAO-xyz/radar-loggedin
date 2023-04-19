const profileButton = document.getElementById('profile');
if (profileButton && getAccessToken() && getExpiresIn() > Date.now()) {
    getUser().then(user => {
        document.getElementById('profilename').textContent = user.username;
    });
    profileButton.addEventListener('click', ev => {
        ev.preventDefault();
        document.location.pathname = 'profile-page';
    });
} else if (profileButton) {
    document.getElementById('logout').style.display = 'none';
    profileButton.style.display = '';
    document.getElementById('profilename').display = '';
}
