// DeepSeek Chat JavaScript
class DeepSeekChat {
  constructor() {
    this.config = {
      apiKey: '',
      model: 'deepseek-chat',
      endpoint: 'https://api.deepseek.com/v1/chat/completions'
    };
    this.messages = [
      {
        role: 'assistant',
        content: '你好！我是你的智能助手，有什么可以帮助你的吗？'
      }
    ];
    this.isLoading = false;
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadConfig();
  }

  async loadConfig() {
    // 在Hexo环境中，配置会通过模板注入
    // 这里使用默认配置，实际使用时会被模板替换
    const meta = document.querySelector('meta[name="deepseek-chat-config"]');
    if (meta) {
      try {
        const config = JSON.parse(meta.content);
        this.config = { ...this.config, ...config };
      } catch (e) {
        console.error('Failed to parse DeepSeek config:', e);
      }
    }
  }

  bindEvents() {
    // 聊天按钮点击事件
    const chatButton = document.querySelector('.chat-button');
    const chatClose = document.querySelector('.chat-close');
    const chatSend = document.querySelector('.chat-send');
    const chatInput = document.querySelector('.chat-input');
    const chatContainer = document.getElementById('deepseek-chat-container');

    // 切换聊天窗口显示
    chatButton.addEventListener('click', () => {
      chatContainer.classList.toggle('chat-open');
    });

    // 关闭聊天窗口
    chatClose.addEventListener('click', () => {
      chatContainer.classList.remove('chat-open');
    });

    // 发送消息按钮点击
    chatSend.addEventListener('click', () => {
      this.sendMessage();
    });

    // 回车键发送消息（Shift+Enter换行）
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 自动调整输入框高度
    chatInput.addEventListener('input', () => {
      this.adjustTextareaHeight(chatInput);
    });
  }

  adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  async sendMessage() {
    const chatInput = document.querySelector('.chat-input');
    const message = chatInput.value.trim();

    if (!message || this.isLoading) return;

    // 添加用户消息到聊天记录
    this.messages.push({ role: 'user', content: message });
    this.renderMessage('user', message);
    chatInput.value = '';
    this.adjustTextareaHeight(chatInput);

    // 显示加载状态
    this.setLoading(true);

    try {
      // 调用DeepSeek API
      const response = await this.callDeepSeekAPI();
      const aiResponse = response.choices[0].message.content;
      
      // 添加AI回复到聊天记录
      this.messages.push({ role: 'assistant', content: aiResponse });
      this.renderMessage('ai', aiResponse);
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      this.renderMessage('ai', '抱歉，我暂时无法回答你的问题，请稍后再试。');
    } finally {
      // 隐藏加载状态
      this.setLoading(false);
    }
  }

  async callDeepSeekAPI() {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    return await response.json();
  }

  renderMessage(role, content) {
    const chatMessages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
    const avatarColor = role === 'user' ? '#28a745' : '#4a6cf7';

    messageDiv.innerHTML = `
      <div class="message-avatar" style="background: ${avatarColor};">
        <i class="fas ${avatarIcon}"></i>
      </div>
      <div class="message-content">
        <p>${this.escapeHtml(content)}</p>
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    this.scrollToBottom(chatMessages);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    const loadingIndicator = document.querySelector('.loading-indicator');
    const chatSend = document.querySelector('.chat-send');
    const chatInput = document.querySelector('.chat-input');

    if (isLoading) {
      loadingIndicator.style.display = 'flex';
      chatSend.disabled = true;
      chatInput.disabled = true;
    } else {
      loadingIndicator.style.display = 'none';
      chatSend.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }
}

// 页面加载完成后初始化聊天功能
document.addEventListener('DOMContentLoaded', () => {
  new DeepSeekChat();
});