#!/bin/bash
# 远程发布文章到微信公众号
# 基于 wenyan-cli --server 模式，通过 HTTP API 调用远程服务

set -e

# Get script directory for relative path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
CONFIG_FILE="${SKILL_ROOT}/wechat.env"

# 远程服务器配置（可过环境变量覆盖）
WECHAT_SERVER="${WECHAT_SERVER:-60.205.222.107}"
WECHAT_PORT="${WECHAT_PORT:-8080}"
WECHAT_API_KEY="${WECHAT_API_KEY:-mcp_sk_9fA7Kx2QvR8bL1nZ4TgH6yWp3DsE5UcJ}"

# Load wechat credentials
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Check Credentials
if [ -z "$WECHAT_APP_ID" ]; then
    echo "❌ Error: WECHAT_APP_ID not set."
    echo "Please configure '$CONFIG_FILE'."
    exit 1
fi

# Check wenyan CLI
if ! command -v wenyan &> /dev/null; then
    echo "❌ Error: wenyan CLI not found."
    echo "Please install: npm install -g @wenyan-md/cli"
    exit 1
fi

# Usage
FILE_PATH="$1"
THEME_ID="${2:-lapis}"

if [ -z "$FILE_PATH" ]; then
    echo "Usage: $(basename "$0") <path/to/article.md> [theme_id]"
    echo "Example: ./publish-remote.sh ./my-post.md lapis"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File '$FILE_PATH' not found."
    exit 1
fi

echo "🚀 Publishing to WeChat via remote server..."

MEDIA_ID=$(wenyan publish \
    -f "$FILE_PATH" \
    -t "$THEME_ID" \
    --server "http://${WECHAT_SERVER}:${WECHAT_PORT}" \
    --api-key "$WECHAT_API_KEY" \
    --app-id "$WECHAT_APP_ID" 2>&1)

if [ $? -eq 0 ]; then
    echo "🎉 Success! $MEDIA_ID"
    echo "Please check your WeChat Official Account draft box."
else
    echo "❌ Publish failed: $MEDIA_ID"
    exit 1
fi
