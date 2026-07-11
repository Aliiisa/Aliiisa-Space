# 普通人生意九宫格拆解器

这是一个可上线的 AI 交互网页小工具。用户输入一个商业目标后，可以用三层九宫格逐步拆解到“今天能做的 3 件事”。

## 你需要准备

1. 安装 Node.js：去 https://nodejs.org 下载 LTS 版本并安装。
2. 准备 OpenAI API Key。

## 第一次运行

在这个项目文件夹里打开终端，然后运行：

```bash
npm install
```

复制 `.env.example`，改名为 `.env.local`，并填入你的 Key：

```text
OPENAI_API_KEY=你的OpenAI_API_Key
OPENAI_MODEL=gpt-4.1-mini
```

然后运行：

```bash
npm run dev
```

打开浏览器访问：

```text
http://localhost:3000
```

## 这个版本包含

- 中文单页界面
- 输入商业目标
- 选择业务类型
- AI 生成三层九宫格
- 点击外圈格子进入下一层
- 每个格子可手动编辑
- 第三层自动生成今日 3 件事
- 复制结果
- 导出当前九宫格图片

