async function loadData() {
    try {
        const response = await fetch('twitter.json');
        if (!response.ok) throw new Error('Failed to load JSON');
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        return [];
    }
}

function getIconUrl(userName) {
    return `https://r4.dlozs.top/images/${userName}.jpg`;
}

function getImageUrl(screenName, tweetId, index, createdAt) {
    const date = new Date(createdAt);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    return `https://r3.dlozs.top/${screenName}_${tweetId}_photo_${index + 1}_${dateStr}.jpg`;
}

function formatDate(createdAt) {
    const date = new Date(createdAt);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadUsers() {
    const data = await loadData();
    const users = {};
    data.forEach(tweet => {
        const { screen_name, name } = tweet;
        if (!users[screen_name]) {
            users[screen_name] = { name };
        }
    });

    const userList = document.getElementById('user-list');
    Object.keys(users).forEach(screenName => {
        const user = users[screenName];
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <img src="${getIconUrl(user.name)}" alt="${user.name}'s avatar">
            <p>${user.name} (@${screenName})</p>
        `;
        card.onclick = () => {
            window.location.href = `user.html?screen_name=${screenName}`;
        };
        userList.appendChild(card);
    });
}

async function loadUserTweets() {
    const urlParams = new URLSearchParams(window.location.search);
    const screenName = urlParams.get('screen_name');
    if (!screenName) return;

    document.getElementById('user-name').textContent = `@${screenName}`;

    const data = await loadData();
    const userTweets = data.filter(tweet => tweet.screen_name === screenName);
    userTweets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 最新在上

    const tweetList = document.getElementById('tweet-list');
    userTweets.forEach(tweet => {
        const tweetDiv = document.createElement('div');
        tweetDiv.className = 'tweet';
        const formattedTime = formatDate(tweet.created_at);

        let mediaHtml = '';
        if (tweet.media && tweet.media.length > 0) {
            mediaHtml = '<div class="tweet-media">';
            tweet.media.forEach((media, index) => {
                const imgUrl = getImageUrl(tweet.screen_name, tweet.id, index, tweet.created_at);
                mediaHtml += `<img src="${imgUrl}" alt="Tweet media ${index + 1}">`;
            });
            mediaHtml += '</div>';
        }

        tweetDiv.innerHTML = `
            <div class="tweet-header">
                <img src="${getIconUrl(tweet.name)}" alt="${tweet.name}'s avatar" class="tweet-avatar">
                <div>
                    <span class="tweet-user">${tweet.name}</span>
                    <span class="tweet-screenname">@${tweet.screen_name}</span>
                    <div class="tweet-time">${formattedTime}</div>
                </div>
            </div>
            <div class="tweet-text">${tweet.full_text}</div>
            ${mediaHtml}
            <div class="tweet-actions">
                <span class="action-btn reply" data-tweet-id="${tweet.id}">💬 ${tweet.reply_count}</span>
                <span class="action-btn retweet" data-tweet-id="${tweet.id}">🔄 ${tweet.retweet_count}</span>
                <span class="action-btn like" data-tweet-id="${tweet.id}">❤️ ${tweet.favorite_count}</span>
            </div>
        `;

        // 添加简单互动
        tweetDiv.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
            });
        });

        tweetList.appendChild(tweetDiv);
    });
}
