(async function () {
    const API = 'https://api.radardao.xyz';

    $('#task-2')
        .children()
        .first()
        .attr('disabled', true)
        .attr('selected', true)
        .attr('hidden', true);

    const searcher = new URL(document.location).searchParams;
    if (searcher.has('success')) {
        $('#email-form').hide();
        const succeeded = searcher.get('success');
        if (succeeded == 'true') {
            $('.w-form-done').show();
        } else {
            $('.w-form-fail').show();
            const textElement = $('.w-form-fail').children().first();
            const reason = searcher.get('reason');
            if (reason) {
                textElement.text(`${textElement.text()} Reason: ${reason}`);
            }
        }
    }

    // eslint-disable-next-line no-undef
    const instance = Bricks({
        container: '.community-generated-grid',
        packed: 'data-packed',
        sizes: [
            {
                columns: 2,
                gutter: 10
            },
            {
                mq: '600px',
                columns: 3,
                gutter: 10
            },
            {
                mq: '800px',
                columns: 3,
                gutter: 10
            },
            {
                mq: '1000px',
                columns: 3,
                gutter: 10
            },
            {
                mq: '1130px',
                columns: 4,
                gutter: 12
            },
            {
                mq: '1400px',
                columns: 5,
                gutter: 12
            },
            {
                mq: '1700px',
                columns: 6,
                gutter: 12
            }
        ]
    }).resize(true);

    $('.community-generated-content-item').hide();
    const submissions = await fetch(`${API}/quiz/wallofplay`).then(r => r.json());
    submissions.forEach(submission => {
        const element = $('.community-generated-content-item').first().clone();
        element.find('.name').text(submission.name);
        if (submission.age) element.find('.age').text(submission.age);
        else element.find('.age').hide();
        element.find('.location').text(submission.location);
        element.find('.question-or-task-selected').text(submission.task);

        let mediaElement = null;
        if (submission.attachment) {
            if (submission.attachment.type.startsWith('image')) {
                mediaElement = $('<img></img>')
                    .addClass('file-content')
                    .attr('src', submission.attachment.url);
            } else if (submission.attachment.type.startsWith('video')) {
                mediaElement = $('<video controls></video>')
                    .addClass('file-content')
                    .attr('src', submission.attachment.url);
            } else if (submission.attachment.type.startsWith('audio')) {
                mediaElement = $(
                    `<audio controls controlsList="nodownload"><source src="${submission.attachment.url}">Your browser does not support the audio element.</audio>`
                ).addClass('file-content');
            } else {
                mediaElement = $(`<a>${submission.attachment.filename}</a>`)
                    .addClass('file-content')
                    .attr('href', submission.attachment.url);
            }
        }

        if (mediaElement) element.find('.file-content').append(mediaElement); // TODO
        $('.community-generated-grid').append(element);
        element.show();
    });
    instance.pack();
    setInterval(() => instance.pack(), 1000);
})();
