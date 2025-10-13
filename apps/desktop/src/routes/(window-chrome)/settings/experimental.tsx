import { createResource, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { generalSettingsStore } from "~/store";
import type { GeneralSettingsStore } from "~/utils/tauri";
import { ToggleSetting } from "./Setting";

export default function ExperimentalSettings() {
	const [store] = createResource(() => generalSettingsStore.get());

	return (
		<Show when={store.state === "ready" && ([store()] as const)}>
			{(store) => <Inner initialStore={store()[0] ?? null} />}
		</Show>
	);
}

function Inner(props: { initialStore: GeneralSettingsStore | null }) {
	const [settings, setSettings] = createStore<GeneralSettingsStore>(
		props.initialStore ?? {
			uploadIndividualFiles: false,
			hideDockIcon: false,
			autoCreateShareableLink: false,
			enableNotifications: true,
			enableNativeCameraPreview: false,
			enableNewRecordingFlow: false,
			autoZoomOnClicks: false,
			custom_cursor_capture2: true,
			enableNewUploader: false,
		},
	);

	const handleChange = async <K extends keyof typeof settings>(
		key: K,
		value: (typeof settings)[K],
	) => {
		console.log(`Handling settings change for ${key}: ${value}`);

		setSettings(key as keyof GeneralSettingsStore, value);
		generalSettingsStore.set({ [key]: value });
	};

	return (
		<div class="flex flex-col h-full custom-scroll">
			<div class="p-4 space-y-4">
				<div class="flex flex-col pb-4 border-b border-gray-2">
					<h2 class="text-lg font-medium text-gray-12">实验性功能</h2>
					<p class="text-sm text-gray-10">
						这些功能仍在开发中，可能无法按预期工作。
					</p>
				</div>
				<div class="space-y-3">
					<h3 class="text-sm text-gray-12 w-fit">录制功能</h3>
					<div class="px-3 rounded-xl border divide-y divide-gray-3 border-gray-3 bg-gray-2">
						<ToggleSetting
							label="在工作室模式下自定义光标捕获"
							description="工作室模式录制将单独捕获光标状态，以便在编辑器中进行自定义（大小、平滑度）。目前为实验性功能，因为光标事件可能无法准确捕获。"
							value={!!settings.custom_cursor_capture2}
							onChange={(value) =>
								handleChange("custom_cursor_capture2", value)
							}
						/>
						<ToggleSetting
							label="原生摄像头预览"
							description="使用原生 GPU 表面显示摄像头预览，而不是在 webview 中渲染。此功能在某些 Windows 系统上无法使用，因此您的体验可能会有所不同。"
							value={!!settings.enableNativeCameraPreview}
							onChange={(value) =>
								handleChange("enableNativeCameraPreview", value)
							}
						/>
						<ToggleSetting
							label="点击时自动缩放"
							description="在工作室模式录制期间，围绕鼠标点击自动生成缩放片段。这有助于突出显示录制中的重要交互。"
							value={!!settings.autoZoomOnClicks}
							onChange={(value) => {
								handleChange("autoZoomOnClicks", value);
								// This is bad code, but I just want the UI to not jank and can't seem to find the issue.
								setTimeout(
									() => window.scrollTo({ top: 0, behavior: "instant" }),
									5,
								);
							}}
						/>
						<ToggleSetting
							label="新录制流程"
							description="全新改进的录制流程！您可能需要重新启动应用程序才能生效。"
							value={!!settings.enableNewRecordingFlow}
							onChange={(value) => {
								handleChange("enableNewRecordingFlow", value);
								// This is bad code, but I just want the UI to not jank and can't seem to find the issue.
								setTimeout(
									() => window.scrollTo({ top: 0, behavior: "instant" }),
									5,
								);
							}}
						/>
						<ToggleSetting
							label="新上传器"
							description="改进的上传器，上传速度更快、更可靠！"
							value={!!settings.enableNewUploader}
							onChange={(value) => {
								handleChange("enableNewUploader", value);
								// This is bad code, but I just want the UI to not jank and can't seem to find the issue.
								setTimeout(
									() => window.scrollTo({ top: 0, behavior: "instant" }),
									5,
								);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
