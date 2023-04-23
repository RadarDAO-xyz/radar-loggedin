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

function inputUpdated() {
    if (!submitting) $('#submit-signal').text('Submit Signal!');
}
$('#submit-url').keydown(inputUpdated);
$('#submit-description').keydown(inputUpdated);
$('#submit-tags').keydown(inputUpdated);
$('#Channels').change(inputUpdated);
$('#Search-channels').keydown(inputUpdated);
$('#Create-post-in-channel').change(inputUpdated);
$('#Discussion-title').keydown(inputUpdated);

let newpost = false;
$('.underline.signal-submit')
    .first()
    .click(() => {
        newpost = true;
    });

let submitting = false;
$('#submit-signal').click(async () => {
    if (!isLoggedIn()) return;
    if (submitting) return;

    const submittedUrl = $('#submit-url').val();
    const submittedDescription = $('#submit-description').val();
    const keywords = $('#submit-tags')
        .val()
        .split(',')
        .map(x => x.trim())
        .filter(x => x);

    if (!submittedUrl) {
        return $('#submit-signal').text('URL IS MISSING');
    } else if (!submittedDescription) {
        return $('#submit-signal').text('WHY IS MISSING');
    } else if (keywords.length == 0) {
        return $('#submit-signal').text('KEYWORDS ARE MISSING');
    }

    if (newpost) {
        if (!$('#Discussion-title').val()) {
            return $('#submit-signal').text('TITLE IS MISSING');
        } else if ($('#Create-post-in-channel').val() === 'not') {
            return $('#submit-signal').text('CHANNEL NOT SELECTED');
        }
    } else {
        // EXISTING
        if ($('.found-box-channel.selected').length == 0) {
            return $('#submit-signal').text('DISCUSSION NOT SELECTED');
        }
    }

    submitting = true;
    $('#submit-signal').text('Submitting signal...');

    let url;
    if (newpost) {
        url = new URL(`${API}/discussions/${$('#Create-post-in-channel').val()}`);
    } else {
        // EXISTING
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
            url: submittedUrl,
            reason: submittedDescription,
            keywords: keywords,
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
