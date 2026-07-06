# 普通人生意九宫格拆解器

一个面向普通人的 AI 交互网页工具，用三层九宫格把模糊的赚钱想法拆成可执行计划。

## 功能

- 输入商业目标
- 选择业务类型
- AI 自动拆解三层九宫格
- 点击格子继续拆解
- 编辑标题和详情
- 自动保存到个人库，最多保留 3 套计划
- 生成今日行动清单
- 复制结果
- 导出适合手机查看的图片

## 技术栈

- Next.js
- React
- OpenAI API
- Netlify 部署

## 本地运行

先创建 `.env.local` 文件：

```env
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1-mini

## 然后运行
npm install
npm run dev

## 打开
http://localhost:3000

## Netlify 部署
Netlify 环境变量需要设置：
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-4.1-mini
NPM_FLAGS=--omit=dev

##Netlify 构建设置：
Build command: npm run build
Publish directory: .next
