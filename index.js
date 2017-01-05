'use strict';

const $ = require('cash-dom');
const r = require('qwest');
const urlJoin = require('url-join');
const isUrl = require('is-absolute-url');

const proxy = 'https://cors-anywhere.herokuapp.com/';
const baseUrl = 'http://boun.cr/';

/*$('#submit').on('click', function () { 
    console.log('asdfasdfs');
});
*/
//$('#submit').on('click', () => console.log('inline lambda'));

let $submitBtn = $('#submit');
let $urlField = $('#manageUrl');
let $output = $('.output');

$submitBtn.on('click', () => {
    let input = $urlField.val();
    if (!isUrl(input)) {
        // do fucking proper error message later...
        alert('Nije url');
        return;
    }
    let token = last(input.split('/'));
    fetchManagePage(token)
        .then(tokens => $output.html(renderRelated(tokens)))
        .then(() => {
            let $toggleBtns = $output.find('.button-toggle');
            $toggleBtns.each(el => {
                let $el = $(el);
                let token = $el.attr('data-token');
                getStatus(token).then(status => {
                    setStatus(el, status);
                    $el.on('click', toggleStatus);
                    $el.removeAttr('disabled');
                });
            });
        });
});

function getStatus(token) {
    return changeStatus(token)
        .then(() => changeStatus(token));
}

function changeStatus(token){
    let deleteUrl = `http://boun.cr/manage/delete/${ token }`;
    let url = urlJoin(proxy, deleteUrl);
    return r.post(url, null, { responseType: 'text'})
        .then((_, nextAction) => nextAction);
}

function setStatus(el, status) {
    let $el = $(el);
    $el.toggleClass('enable', status === 'enable');
    $el.toggleClass('disable', status === 'disable');
    $el.text(status);
}

function toggleStatus({ target: el }) {
    let token = el.getAttribute('data-token');
    changeStatus(token).then(status => setStatus(el, status));
}

function fetchManagePage(token) {
    let manageUrl = `http://boun.cr/manage/${ token }`;
    let url = urlJoin(proxy, manageUrl);
    return r.get(url, null, { responseType: 'document' })
        .then((_, doc) => {
            let $doc = $(doc);
            return $doc.find('#related-container a')
                .map(el => readManageLink(el))
                .slice(1);
        });
}

function readManageLink(el){
    let name = el.textContent;
    let token = last(el.getAttribute('href').split('/'));
    return { name, token };
}

function last(arr) {
    return arr[arr.length-1];
}

function renderRelated(related) {
return `
<ul class="related">
    ${ related.map(({ name, token }) => `
        <li>
            <span class="email">${ name }@boun.cr</span>
            <div class="controls">
                <a class="button button-toggle" disabled="true" data-token="${ token }">Loading...</a>
                <a class="button button-edit" href="http://boun.cr/manage/${ token }" target="_blank">View on boun.cr</a>
            </div>
        </li>`)
        .join('\n') }
</ul>`;
}
