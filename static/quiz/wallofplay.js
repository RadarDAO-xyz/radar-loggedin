(async function () {
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

    $('.community-generated-grid')
        .css('display', 'flex')
        .css('justify-content', 'center')
        .css('flex-flow', 'wrap')
        .css('gap', '10px');

    const API = 'https://api.radardao.xyz';
    const imageExts = ['png', 'jpg', 'jpeg', 'webp'];
    const videoExts = ['mp4', 'mov', 'webm'];
    const audioExts = ['mp3', 'wav', 'mpeg'];
    $('.community-generated-content-item').hide();
    const submissions = await fetch(`${API}/quiz/wallofplay`).then(r => r.json());
    submissions.forEach(submission => {
        const element = $('.community-generated-content-item').first().clone();
        element.children('.name').text(submission.name);
        element.children('.age').text(submission.age);
        element.children('.location').text(submission.location);
        element.children('.question-or-task-selected').text(submission.task);
        const extension = submission.attachment?.url.split('.').pop();

        let mediaElement = null;
        if (submission.attachment) {
            if (imageExts.includes(extension)) {
                mediaElement = $('<image></image>')
                    .addClass('file-content')
                    .attr('src', submission.attachment.url);
            } else if (videoExts.includes(extension)) {
                mediaElement = $('<video></video>')
                    .addClass('file-content')
                    .attr('src', submission.attachment.url);
            } else if (audioExts.includes(extension)) {
                mediaElement = $(
                    `<audio controls controlsList="nodownload"><source src="${submission.attachment.url}" type="audio/mpeg">Your browser does not support the audio element.</audio>`
                ).addClass('file-content');
            } else {
                mediaElement = $(`<a>${submission.attachment.filename}</a>`)
                    .addClass('file-content')
                    .attr('href', submission.attachment.url);
            }
        }

        if (mediaElement) element.children('.file-content').append(mediaElement); // TODO
        $('.community-generated-grid').append(element);
        element.show();
    });
})();
