$('#login').click(ev => {
    ev.preventDefault();
    document.location = `https://discord.com/oauth2/authorize?&client_id=${CLIENT_ID}&response_type=token&scope=identify%20email&redirect_uri=${location.protocol}//${location.host}/`;
});
$('#logout').click(() => logout());
