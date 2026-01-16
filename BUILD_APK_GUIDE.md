# APK 打包指南

## 快速打包（3 步）

### 第 1 步：安装 JDK（只需一次）

在终端执行：
```bash
brew install --cask zulu@17
```

会提示输入密码，输入你的 Mac 登录密码即可。

### 第 2 步：打包 APK

在终端执行：
```bash
cd /Users/Zhuanz/code/NovelCreationApp/android
./gradlew assembleDebug
```

打包需要 3-5 分钟，会下载一些依赖。

### 第 3 步：找到 APK

打包完成后，APK 文件在：
```
/Users/Zhuanz/code/NovelCreationApp/android/app/build/outputs/apk/debug/app-debug.apk
```

## 安装到手机

### 方法 1：AirDrop（最简单）
1. 在 Finder 中找到 APK 文件
2. 右键 -> 共享 -> AirDrop
3. 发送到你的 Android 手机
4. 手机上点击 APK 安装

### 方法 2：USB 连接
1. 手机连接到电脑
2. 把 APK 复制到手机
3. 在手机上找到 APK 文件点击安装

### 方法 3：邮件/网盘
1. 把 APK 发送到你的邮箱
2. 或者上传到百度网盘/夸克等
3. 手机下载后安装

## 如果遇到问题

### 问题 1：brew 命令不存在
安装 Homebrew：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 问题 2：打包失败
检查错误信息，常见问题：
- **网络问题**：打包时需要下载依赖，确保网络畅通
- **权限问题**：`chmod +x android/gradlew`

### 问题 3：手机无法安装
- 需要在手机设置中允许"安装未知来源应用"
- 不同品牌位置不同，通常在：设置 -> 安全 -> 未知来源

## 完整版打包（带签名，可发布）

如果你想打包可以发布的正式版本：

1. 生成签名密钥：
```bash
cd /Users/Zhuanz/code/NovelCreationApp/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore novel-app.keystore -alias novel-app-key -keyalg RSA -keysize 2048 -validity 10000
```

2. 配置签名（编辑 `android/gradle.properties`）：
```properties
NOVEL_APP_UPLOAD_STORE_FILE=novel-app.keystore
NOVEL_APP_UPLOAD_KEY_ALIAS=novel-app-key
NOVEL_APP_UPLOAD_STORE_PASSWORD=你的密码
NOVEL_APP_UPLOAD_KEY_PASSWORD=你的密码
```

3. 打包 Release 版本：
```bash
cd /Users/Zhuanz/code/NovelCreationApp/android
./gradlew assembleRelease
```

Release APK 在：`android/app/build/outputs/apk/release/app-release.apk`

---

## 快速命令（复制粘贴）

```bash
# 一键完成所有步骤（首次需要输入密码安装 JDK）
brew install --cask zulu@17 && \
cd /Users/Zhuanz/code/NovelCreationApp/android && \
./gradlew assembleDebug && \
open app/build/outputs/apk/debug
```

执行后会自动打开包含 APK 的文件夹。
