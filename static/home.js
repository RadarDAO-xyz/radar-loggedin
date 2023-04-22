if (isLoggedIn()) {
    $('#profile').click(ev => {
        ev.preventDefault();
        document.location.pathname = 'profile-page';
    });
    getUser().then(user => {
        $('#profilename').text(user.username);
    });
    $('#profile').show();
    $('#logout').show();
    $('#w-tabs-0-data-w-tab-1').show();
} else {
    $('#profilename').text('Login');
    $('#profile').show();
    $('#logout').hide();
    $('#w-tabs-0-data-w-tab-1').hide();
}

async function fillChannelList() {
    const data = await fetch(`https://${API}/channels/`).then(r => r.json());

    $('#Channels').empty();
    data.forEach(channel => {
        $('#Channels').append($(`<option value="${channel.id}" >${channel.name}</option>`));
    });
}

fillChannelList();
