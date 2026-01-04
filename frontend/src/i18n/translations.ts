export const translations = {
  en: {
    // Header
    title: 'CYBER SHARE',
    subtitle: 'Upload files, images, or text • Share via Telegram',

    // Upload tabs
    fileUpload: 'FILE UPLOAD',
    textUpload: 'TEXT UPLOAD',

    // Drop zone
    dropMessage: 'Drag & drop file here',
    orClick: 'or click to select',

    // Form
    descriptionPlaceholder: 'Description (optional)',
    textPlaceholder: 'Enter your text content here...',
    uploadBtn: 'UPLOAD',
    uploading: 'UPLOADING...',

    // Success
    uploadSuccess: 'UPLOAD SUCCESSFUL',
    copyLink: 'COPY',
    copied: 'COPIED!',
    openPreview: 'OPEN PREVIEW',

    // Preview page
    fileNotFound: 'FILE NOT FOUND',
    fileNotFoundDesc: 'The file you\'re looking for doesn\'t exist or has been removed.',
    backToUpload: 'BACK TO UPLOAD',
    loading: 'LOADING...',

    // File info
    fileName: 'FILE NAME',
    fileType: 'TYPE',
    fileSize: 'SIZE',
    uploadTime: 'UPLOADED',
    description: 'DESCRIPTION',

    // Actions
    downloadFile: 'DOWNLOAD FILE',
    uploadAnother: 'Upload Another File',

    // Language
    language: 'Language',
  },
  zh: {
    // Header
    title: '赛博传送',
    subtitle: '上传文件、图片或文字 • 通过 Telegram 分享',

    // Upload tabs
    fileUpload: '文件上传',
    textUpload: '文本上传',

    // Drop zone
    dropMessage: '拖拽文件到此处',
    orClick: '或点击选择文件',

    // Form
    descriptionPlaceholder: '描述 (可选)',
    textPlaceholder: '在此输入文本内容...',
    uploadBtn: '上传',
    uploading: '上传中...',

    // Success
    uploadSuccess: '上传成功',
    copyLink: '复制',
    copied: '已复制!',
    openPreview: '打开预览',

    // Preview page
    fileNotFound: '文件未找到',
    fileNotFoundDesc: '您访问的文件不存在或已被删除。',
    backToUpload: '返回上传',
    loading: '加载中...',

    // File info
    fileName: '文件名',
    fileType: '类型',
    fileSize: '大小',
    uploadTime: '上传时间',
    description: '描述',

    // Actions
    downloadFile: '下载文件',
    uploadAnother: '上传另一个文件',

    // Language
    language: '语言',
  }
};

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof translations.en;
