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
    $('#w-tabs-0-data-w-tab-0').show();
} else {
    $('#profilename').text('Login');
    $('#profile').show();
    $('#logout').hide();
    // Some other script is overriding this, so it's delayed
    setTimeout(() => $('#w-tabs-0-data-w-tab-0').hide(), 100);
}

async function fillChannelList() {
    const data = await fetch(`${API}/channels/`).then(r => r.json());

    $('#Channels').empty();
    $('#Create-post-in-channel').empty();
    $('#Channels').append($('<option value="not">ALL CHANNELS</option>'));
    $('#Create-post-in-channel').append(
        $('<option selected disabled hidden value="not">SELECT A CHANNEL</option>')
    );
    data.forEach(channel => {
        $('#Channels').append($(`<option value="${channel.id}" >#${channel.name}</option>`));
        $('#Create-post-in-channel').append(
            $(`<option value="${channel.id}" >#${channel.name}</option>`)
        );
    });
}
fillChannelList();

async function fetchDiscussions(q, channel) {
    const url = new URL(`${API}/discussions`);
    if ($('#Search-channels').val().length > 0) {
        url.searchParams.set('q', q);
    }
    if ($('#Channels').val() !== 'not') {
        url.searchParams.set('channelId', channel);
    }
    console.log(url.toString());
    const data = await fetch(url.toString()).then(r => r.json());
    console.log(data);
    return data;
}

const foundBox = $('<div id="found-box" class="found-box"></div>').hide();
$('.find-related-discord-discussion-block').first().append(foundBox);

let waiting = false;
let lastSearched = '';
function runIfSafe() {
    if (waiting) return;
    waiting = true;
    setTimeout(async () => {
        lastSearched = $('#Search-channels').val() + $('#Channels').val();
        const discussions = await fetchDiscussions(
            $('#Search-channels').val(),
            $('#Channels').val()
        );
        populateChannelBox(discussions);
        waiting = false;
        if (lastSearched !== $('#Search-channels').val() + $('#Channels').val()) {
            runIfSafe();
        }
    }, 1000);
}

function populateChannelBox(discussions) {
    $('#found-box').show().empty();
    discussions.forEach(discussion => {
        const element = $(
            `<div class="found-box-channel" thread="${discussion.thread_id}" forum="${discussion.channel_id}">${discussion.thread_name}</div>`
        ).click(function () {
            $('.found-box-channel').removeClass('selected');
            $(this).addClass('selected');
        });
        $('#found-box').append(element);
    });
}

$('#Search-channels').keypress(() => runIfSafe());
$('#Search-channels').keydown(ev => {
    if (ev.key === 'Backspace' || ev.key === 'Delete') runIfSafe();
});
$('#Channels').change(() => runIfSafe());

let submitting = false;
$('#submit-signal').click(async () => {
    if (!isLoggedIn()) return;
    if (submitting) return;
    submitting = true;
    $('#submit-signal').text('Submitting signal...');
    let url;
    if ($('#Discussion-title').val() && $('#Create-post-in-channel').val() !== 'not') {
        url = new URL(`${API}/discussions/${$('#Create-post-in-channel').val()}`);
    } else {
        // Existing
        url = new URL(
            `${API}/discussions/${$('.found-box-channel.selected').attr('forum')}/${$(
                '.found-box-channel.selected'
            ).attr('thread')}`
        );
    }
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${getAccessToken()}`);
    headers.set('Content-Type', 'application/json');
    const message = await fetch(url, {
        headers,
        method: 'POST',
        body: JSON.stringify({
            url: $('#submit-url').first().val(),
            reason: $('#submit-description').first().val(),
            keywords: $('#submit-tags')
                .first()
                .val()
                .split(',')
                .map(x => x.trim())
                .filter(x => x),
            title: $('#Discussion-title').val() || undefined
        })
    }).then(r => r.json());
    if (message?.id) {
        $('#submit-signal').text('Signal Submitted!');
    } else {
        $('#submit-signal').text('Error while submitting...');
    }
    console.log(message);
});
