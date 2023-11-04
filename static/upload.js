fetch('/api/posts'
).then(response => {
    return response.json()
}).then(data => {
    renderBoard(data);
})

const messageForm = document.getElementById('messageForm');
messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(messageForm);
    await fetch('/api/post', {
        method: 'POST',
        body: formData
    })
    fetch('/api/post', {
        method: 'GET',
    }).then(response => {
        return response.json()
    }).then(data => {
        renderBoard([data]);
        messageForm.reset();
    })
});

function renderBoard(data){
    const msgBoard = document.getElementById('msgBoard');
    data.forEach(post => {
        const hr = document.createElement('hr');
        msgBoard.insertBefore(hr, msgBoard.firstChild);
        const msg = document.createElement('div');
        const caption = document.createElement('div');
        caption.textContent = post.caption;
        const img = document.createElement('img');
        img.src = post.imageUrl;
        msg.appendChild(caption);
        msg.appendChild(img);
        msgBoard.insertBefore(msg, msgBoard.firstChild);
    });
}