window.onscroll = percent;

// 页面百分比
function percent() {
    let scrollTop = document.documentElement.scrollTop || window.pageYOffset,
        scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight),
        clientHeight = document.documentElement.clientHeight,
        scrollableHeight = scrollHeight - clientHeight,
        result = Math.round((scrollTop / scrollableHeight) * 100),
        goUpButton = document.querySelector("#go-up");

    // 只在阅读文章时显示进度条百分比
    if (document.querySelector('.post')) {
        if (result <= 95) {
            goUpButton.childNodes[0].style.display = 'none';
            goUpButton.childNodes[1].style.display = 'block';
            goUpButton.childNodes[1].innerHTML = `${result}<span>%</span>`;
        } else {
            goUpButton.childNodes[1].style.display = 'none';
            goUpButton.childNodes[0].style.display = 'block';
        }
    } else {
        goUpButton.childNodes[1].style.display = 'none';
        goUpButton.childNodes[0].style.display = 'block';
    }

    // 在文章底部显示进度条
    let progressBar = document.getElementById('reading-progress-bottom');
    if (progressBar) {
        progressBar.style.width = `${result}%`;
    }
}