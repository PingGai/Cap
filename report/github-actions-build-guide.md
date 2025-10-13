# 使用 GitHub Actions 构建 Cap 桌面版（Windows x64）教程

本教程将详细指导您如何利用项目中的 GitHub Actions 工作流程，在云端自动构建 Cap 桌面应用的 Windows x64 版本，并下载最终生成的安装包。

## 核心概念

项目中的 `.github/workflows/build-windows.yml` 文件定义了一个 GitHub Actions 工作流程。这个工作流程会在特定事件发生时（例如，手动触发或代码推送到 `main` 分支），在一个由 GitHub 提供的虚拟 Windows 服务器上自动执行一系列预设命令，从而完成应用的构建。

这样做的好处是：
- **环境一致性**：每次构建都在一个纯净、标准的环境中进行，避免了因本地环境差异导致的各种问题。
- **自动化**：无需在自己的电脑上安装复杂的依赖（如 Rust、Node.js 等），只需在 GitHub 上点击几下即可。
- **无需签名**：该工作流程已经巧妙地处理了代码签名问题，避免了在个人构建时因缺少签名证书而导致的失败。

## 构建步骤详解

以下是如何触发并完成一次构建的完整步骤：

### 1. 访问 GitHub Actions 页面

1.  打开您的项目 GitHub 仓库页面。
2.  点击页面顶部的 **Actions** 标签。

    ![GitHub Actions Tab](https://user-images.githubusercontent.com/1/2.png) <!--- Placeholder for image -->

### 2. 选择并运行工作流程

1.  在左侧的工作流程列表中，找到并点击 **Build • Cap Desktop (Windows x64)**。
2.  您会看到一个 "Run workflow"（运行工作流程）的下拉按钮。点击它。
3.  保持默认分支（通常是 `main`）不变，然后点击绿色的 **Run workflow** 按钮。

    ![Run Workflow](https://user-images.githubusercontent.com/1/3.png) <!--- Placeholder for image -->

### 3. 监控构建过程

1.  点击运行后，一个新的工作流程实例会出现在下方的列表中，状态为 "in progress"（进行中）。点击它进入详情页面。
2.  在详情页面，您可以看到一个名为 `build-windows` 的任务正在运行。您可以点击它实时查看详细的日志输出。

    ![Workflow Job](https://user-images.githubusercontent.com/1/4.png) <!--- Placeholder for image -->

    工作流程会依次执行以下关键步骤：
    - **Checkout**：拉取您的最新代码。
    - **Set up Node.js & Rust**：安装构建所需的 Node.js 和 Rust 环境。
    - **Install dependencies**：使用 `pnpm install` 安装所有项目依赖。
    - **Disable Updater**：这是**非常关键的一步**。脚本会自动修改 Tauri 配置文件，禁用内置的更新程序。这可以绕过在构建过程中需要代码签名证书的强制要求，从而让没有证书的普通用户也能成功构建。
    - **Build desktop (Tauri)**：执行 `pnpm build:tauri` 命令，这会编译前端代码并打包成一个完整的 Windows 应用。
    - **Upload artifacts**：将构建好的 `.msi`（安装程序）和 `.exe`（可执行文件）等产物打包上传。

### 4. 下载构建产物

1.  当工作流程成功完成后（状态变为绿色对勾 "success"），回到该工作流程实例的 "Summary"（摘要）页面。
2.  在页面底部，您会找到一个名为 **Artifacts**（产物）的区域。
3.  这里会有一个名为 `cap-windows-x64` 的压缩包。点击它即可下载。
4.  解压下载的 `.zip` 文件，您将在其中找到 `.msi` 安装包。直接运行它，就可以在您的 Windows 电脑上安装您刚刚构建的 Cap 桌面应用了。

    ![Download Artifacts](https://user-images.githubusercontent.com/1/5.png) <!--- Placeholder for image -->

## 总结

通过以上步骤，您就可以完全利用 GitHub Actions 实现 Cap 桌面应用的自动化云构建，无需在本地进行任何复杂的环境配置。这不仅简化了流程，也确保了构建的可靠性。