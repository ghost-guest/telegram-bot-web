# 从零构建赛博朋克风格的 Telegram 文件分享系统

> 一个支持文件上传、自动推送 Telegram、生成分享链接的 Web 应用

## 项目背景

在日常工作中，经常需要快速分享文件给他人，传统的方式要么需要登录网盘，要么文件大小受限。于是萌生了一个想法：**能不能做一个匿名上传文件，自动推送到 Telegram 频道，同时生成分享链接的工具？**

最终效果：
- 🚀 拖拽上传文件/图片/文本
- 📨 自动发送到 Telegram 频道
- 🔗 生成可分享的预览链接
- 🌐 支持中英文切换
- 🎨 赛博朋克风格 UI

## 技术栈选择

| 模块 | 技术 | 选择理由 |
|------|------|----------|
| 后端 | Go + Gin | 高性能、编译成单一二进制、部署简单 |
| 数据库 | SQLite | 轻量、无需额外服务、文件存储 |
| 前端 | React + TypeScript + Vite | 类型安全、开发体验好、构建快 |
| 容器化 | Docker + Nginx | 一键部署、反向代理 |

## 项目架构

```
telegram-bot-web/
├── backend/                 # Go 后端
│   ├── config/             # 配置管理
│   ├── database/           # SQLite 数据库
│   ├── handlers/           # API 处理器
│   ├── models/             # 数据模型
│   ├── services/           # 业务逻辑
│   │   ├── storage.go      # 文件存储
│   │   └── telegram.go     # Telegram Bot
│   └── main.go             # 入口
├── frontend/               # React 前端
│   ├── src/
│   │   ├── api/           # API 调用
│   │   ├── components/    # 组件
│   │   ├── i18n/          # 国际化
│   │   └── pages/         # 页面
│   └── Dockerfile
├── docker-compose.yml
└── Dockerfile.backend
```

## 核心功能实现

### 1. 文件上传 API

```go
// handlers/upload.go
func (h *UploadHandler) UploadFile(c *gin.Context) {
    file, header, err := c.Request.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
        return
    }
    defer file.Close()

    // 生成唯一 ID 并保存
    id, filePath, err := h.storage.Save(header.Filename, file)

    // 存入数据库
    fileModel := &models.File{
        ID:       id,
        Filename: header.Filename,
        Filetype: header.Header.Get("Content-Type"),
        Filesize: header.Size,
    }
    h.db.CreateFile(fileModel)

    // 异步发送到 Telegram
    go h.telegram.SendFileWithDocument(fileModel)

    // 返回分享链接
    c.JSON(http.StatusOK, models.UploadResponse{
        ID:       id,
        ShareURL: h.cfg.BaseURL + "/s/" + id,
    })
}
```

### 2. Telegram Bot 集成

```go
// services/telegram.go
func (t *Telegram) SendFileWithDocument(file *models.File) error {
    shareURL := fmt.Sprintf("%s/s/%s", t.baseURL, file.ID)
    caption := fmt.Sprintf(
        "📁 %s\n📊 %s | 📦 %s\n🔗 %s",
        file.Filename,
        file.Filetype,
        formatFileSize(file.Filesize),
        shareURL,
    )

    // 图片使用 sendPhoto，其他使用 sendDocument
    if isImage(file.Filetype) {
        return t.sendPhoto(file.Filepath, caption)
    }
    return t.sendDocument(file.Filepath, caption)
}
```

### 3. 前端拖拽上传

```tsx
// components/FileUploader.tsx
const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        setFile(e.dataTransfer.files[0]);
    }
}, []);

// 上传进度追踪
const response = await uploadFile(file, description, (progress) => {
    setProgress(progress);
});
```

### 4. 国际化实现

```tsx
// i18n/index.tsx
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        if (saved) return saved as Language;
        return navigator.language.startsWith('zh') ? 'zh' : 'en';
    });

    const t = (key: TranslationKey): string => translations[lang][key];

    return (
        <I18nContext.Provider value={{ lang, setLang, t }}>
            {children}
        </I18nContext.Provider>
    );
};
```

## 赛博朋克 UI 设计

### 配色方案

```css
/* 主色调 */
--cyber-cyan: #0ff;      /* 霓虹青 */
--cyber-green: #0f0;     /* 霓虹绿 */
--bg-dark: #0a0e17;      /* 深色背景 */

/* 发光效果 */
box-shadow:
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1);
```

### 动态网格背景

```css
.cyber-grid {
    background:
        linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
    0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
    100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
}
```

### 扫描线动画

```css
.scan-line {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg, transparent, #0ff, transparent);
    animation: scan 2s linear infinite;
}

@keyframes scan {
    0% { top: 0; opacity: 0; }
    50% { opacity: 0.5; }
    100% { top: 100%; opacity: 0; }
}
```

## Docker 部署

### docker-compose.yml

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: ../Dockerfile.backend
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - BASE_URL=${BASE_URL}
    volumes:
      - uploads_data:/app/uploads
      - db_data:/app/data
    restart: always

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=${BASE_URL}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

### 部署步骤

```bash
# 1. 克隆项目
git clone https://github.com/ghost-guest/telegram-bot-web.git
cd telegram-bot-web

# 2. 配置环境变量
cat > .env << EOF
BASE_URL=https://your-domain.com
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
EOF

# 3. 启动服务
docker-compose up -d --build
```

## API 接口文档

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| POST | `/api/upload` | 上传文件 | `file`, `description` |
| POST | `/api/text` | 上传文本 | `content`, `description` |
| GET | `/api/file/:id` | 获取文件信息 | - |
| GET | `/api/download/:id` | 下载文件 | - |
| GET | `/api/preview/:id` | 预览文件 | - |
| GET | `/api/health` | 健康检查 | - |

## 遇到的问题与解决

### 1. TypeScript 类型导入错误

**问题**：`verbatimModuleSyntax` 要求类型必须使用 `import type`

**解决**：
```typescript
// ❌ 错误
import { UploadResponse } from '../api';

// ✅ 正确
import type { UploadResponse } from '../api';
```

### 2. Go 版本兼容性

**问题**：本地 Go 1.24 与 Docker 镜像 Go 1.23 不兼容

**解决**：在 Dockerfile 中添加 `go mod tidy`
```dockerfile
RUN go mod tidy && CGO_ENABLED=1 go build -o server .
```

### 3. Telegram 大文件发送

**问题**：Telegram Bot API 限制文件大小 50MB

**解决**：
- 小于 50MB：直接发送文件
- 大于 50MB：只发送通知消息和链接

## 后续优化方向

- [ ] 添加文件预览（PDF、视频）
- [ ] 支持文件夹上传
- [ ] 添加访问统计
- [ ] 支持密码保护
- [ ] 添加文件过期功能
- [ ] 支持多 Telegram 频道

## 总结

这个项目从需求分析到最终部署，涵盖了：

1. **后端开发**：Go + Gin + SQLite
2. **前端开发**：React + TypeScript + Vite
3. **第三方集成**：Telegram Bot API
4. **容器化部署**：Docker + Nginx
5. **UI/UX 设计**：赛博朋克风格 + 响应式

整个项目代码已开源：[GitHub - telegram-bot-web](https://github.com/ghost-guest/telegram-bot-web)

---

*本文由 Claude Code 辅助编写*
