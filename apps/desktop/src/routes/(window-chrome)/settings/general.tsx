import { Button } from "@cap/ui-solid";
import { createWritableMemo } from "@solid-primitives/memo";
import {
	isPermissionGranted,
	requestPermission,
} from "@tauri-apps/plugin-notification";
import { type OsType, type } from "@tauri-apps/plugin-os";
import "@total-typescript/ts-reset/filter-boolean";
import { CheckMenuItem, Menu } from "@tauri-apps/api/menu";
import { confirm } from "@tauri-apps/plugin-dialog";
import { cx } from "cva";
import { createResource, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import themePreviewAuto from "~/assets/theme-previews/auto.jpg";
import themePreviewDark from "~/assets/theme-previews/dark.jpg";
import themePreviewLight from "~/assets/theme-previews/light.jpg";
import { Input } from "~/routes/editor/ui";
import { authStore, generalSettingsStore } from "~/store";
import {
	type AppTheme,
	commands,
	type GeneralSettingsStore,
	type MainWindowRecordingStartBehaviour,
	type PostDeletionBehaviour,
	type PostStudioRecordingBehaviour,
} from "~/utils/tauri";
import { Setting, ToggleSetting } from "./Setting";

export default function GeneralSettings() {
	const [store] = createResource(() => generalSettingsStore.get());

	return (
		<Show when={store.state === "ready" && ([store()] as const)}>
			{(store) => <Inner initialStore={store()[0] ?? null} />}
		</Show>
	);
}

function AppearanceSection(props: {
	currentTheme: AppTheme;
	onThemeChange: (theme: AppTheme) => void;
}) {
	const options = [
		{ id: "system", name: "系统", preview: themePreviewAuto },
		{ id: "light", name: "浅色", preview: themePreviewLight },
		{ id: "dark", name: "深色", preview: themePreviewDark },
	] satisfies { id: AppTheme; name: string; preview: string }[];

	return (
		<div class="flex flex-col gap-4">
			<div class="flex flex-col pb-4 border-b border-gray-2">
				<h2 class="text-lg font-medium text-gray-12">通用</h2>
				<p class="text-sm text-gray-10">Cap 应用的通用设置。</p>
			</div>
			<div
				class="flex justify-start items-center text-gray-12"
				onContextMenu={(e) => e.preventDefault()}
			>
				<div class="flex flex-col gap-3">
					<p class="text-sm text-gray-12">外观</p>
					<div class="flex justify-between m-1 min-w-[20rem] w-[22.2rem] flex-nowrap">
						<For each={options}>
							{(theme) => (
								<button
									type="button"
									aria-checked={props.currentTheme === theme.id}
									class="flex flex-col items-center rounded-md group focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-offset-gray-50 focus-visible:ring-offset-2 focus-visible:ring-4"
									onClick={() => props.onThemeChange(theme.id)}
								>
									<div
										class={cx(
											`w-24 h-[4.8rem] rounded-md overflow-hidden focus:outline-none ring-offset-gray-50 transition-all duration-200`,
											{
												"ring-2 ring-gray-12 ring-offset-2":
													props.currentTheme === theme.id,
												"group-hover:ring-2 ring-offset-2 group-hover:ring-gray-5":
													props.currentTheme !== theme.id,
											},
										)}
										aria-label={`选择主题: ${theme.name}`}
									>
										<div class="flex justify-center items-center w-full h-full">
											<img
												draggable={false}
												src={theme.preview}
												alt={`主题预览: ${theme.name}`}
											/>
										</div>
									</div>
									<span
										class={cx(`mt-2 text-sm transition-color duration-200`, {
											"text-gray-12": props.currentTheme === theme.id,
											"text-gray-10": props.currentTheme !== theme.id,
										})}
									>
										{theme.name}
									</span>
								</button>
							)}
						</For>
					</div>
				</div>
			</div>
		</div>
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

	const ostype: OsType = type();

	type ToggleSettingItem = {
		label: string;
		type: "toggle";
		description: string;
		value: boolean;
		onChange: (value: boolean) => void | Promise<void>;
		os?: "macos" | "windows" | "linux";
	};

	type SelectSettingItem = {
		label: string;
		type: "select";
		description: string;
		value:
			| MainWindowRecordingStartBehaviour
			| PostStudioRecordingBehaviour
			| PostDeletionBehaviour
			| number;
		onChange: (
			value:
				| MainWindowRecordingStartBehaviour
				| PostStudioRecordingBehaviour
				| PostDeletionBehaviour
				| number,
		) => void | Promise<void>;
	};

	type SettingItem = ToggleSettingItem | SelectSettingItem;

	type SettingsGroup = {
		title: string;
		os?: "macos" | "windows" | "linux";
		titleStyling?: string;
		items: SettingItem[];
	};

	// Static settings groups structure to preserve component identity
	const settingsGroups: SettingsGroup[] = [
		{
			title: "Cap Pro",
			titleStyling:
				"bg-blue-500 py-1.5 mb-4 text-white text-xs px-2 rounded-lg",
			items: [
				{
					label: "禁用自动打开链接",
					type: "toggle",
					description:
						"启用后，Cap 将不会在浏览器中自动打开链接（例如，在创建可分享链接后）。",
					get value() {
						return !!settings.disableAutoOpenLinks;
					},
					onChange: (value: boolean) =>
						handleChange("disableAutoOpenLinks", value),
				},
			],
		},
		{
			title: "应用",
			os: "macos",
			items: [
				{
					label: "隐藏 Dock 图标",
					type: "toggle",
					os: "macos",
					description: "当没有可关闭的窗口时，Dock 图标将被隐藏。",
					get value() {
						return !!settings.hideDockIcon;
					},
					onChange: (value: boolean) => handleChange("hideDockIcon", value),
				},
				{
					label: "启用系统通知",
					type: "toggle",
					os: "macos",
					description:
						"显示系统通知，例如复制到剪贴板、保存文件等事件。您可能需要通过系统通知设置手动允许 Cap 访问。",
					get value() {
						return !!settings.enableNotifications;
					},
					onChange: async (value: boolean) => {
						if (value) {
							// Check current permission state
							console.log("Checking notification permission status");
							const permissionGranted = await isPermissionGranted();
							console.log(`Current permission status: ${permissionGranted}`);

							if (!permissionGranted) {
								// Request permission if not granted
								console.log("Permission not granted, requesting permission");
								const permission = await requestPermission();
								console.log(`Permission request result: ${permission}`);
								if (permission !== "granted") {
									// If permission denied, don't enable the setting
									console.log("Permission denied, aborting setting change");
									return;
								}
							}
						}
						handleChange("enableNotifications", value);
					},
				},
				{
					label: "启用触感反馈",
					type: "toggle",
					os: "macos",
					description: "在 Force Touch™ 触控板上使用触感反馈",
					get value() {
						return !!settings.hapticsEnabled;
					},
					onChange: (value: boolean) => handleChange("hapticsEnabled", value),
				},
			],
		},
		{
			title: "录制",
			items: [
				{
					label: "录制倒计时",
					description: "录制开始前的倒计时",
					type: "select",
					get value() {
						return settings.recordingCountdown ?? 0;
					},
					onChange: (
						value:
							| MainWindowRecordingStartBehaviour
							| PostStudioRecordingBehaviour
							| PostDeletionBehaviour
							| number,
					) => handleChange("recordingCountdown", value as number),
				},
				{
					label: "主窗口录制开始行为",
					description: "主窗口录制开始时的行为",
					type: "select",
					get value() {
						return settings.mainWindowRecordingStartBehaviour ?? "close";
					},
					onChange: (
						value:
							| MainWindowRecordingStartBehaviour
							| PostStudioRecordingBehaviour
							| PostDeletionBehaviour
							| number,
					) =>
						handleChange(
							"mainWindowRecordingStartBehaviour",
							value as MainWindowRecordingStartBehaviour,
						),
				},
				{
					label: "工作室录制结束行为",
					description: "工作室录制结束时的行为",
					type: "select",
					get value() {
						return settings.postStudioRecordingBehaviour ?? "openEditor";
					},
					onChange: (
						value:
							| MainWindowRecordingStartBehaviour
							| PostStudioRecordingBehaviour
							| PostDeletionBehaviour
							| number,
					) =>
						handleChange(
							"postStudioRecordingBehaviour",
							value as PostStudioRecordingBehaviour,
						),
				},
				{
					label: "删除录像后的行为",
					description: "删除正在进行的录像后，是否应重新打开 Cap？",
					type: "select",
					get value() {
						return settings.postDeletionBehaviour ?? "doNothing";
					},
					onChange: (
						value:
							| MainWindowRecordingStartBehaviour
							| PostStudioRecordingBehaviour
							| PostDeletionBehaviour
							| number,
					) =>
						handleChange(
							"postDeletionBehaviour",
							value as PostDeletionBehaviour,
						),
				},
			],
		},
	];

	// Helper function to render select dropdown for recording behaviors
	const renderRecordingSelect = (
		label: string,
		description: string,
		getValue: () =>
			| MainWindowRecordingStartBehaviour
			| PostStudioRecordingBehaviour
			| PostDeletionBehaviour
			| number,
		onChange: (value: any) => void,
		options: { text: string; value: any }[],
	) => {
		return (
			<Setting label={label} description={description}>
				<button
					type="button"
					class="flex flex-row gap-1 text-xs bg-gray-3 items-center px-2.5 py-1.5 rounded-md border border-gray-4"
					onClick={async () => {
						const currentValue = getValue();
						const items = options.map((option) =>
							CheckMenuItem.new({
								text: option.text,
								checked: currentValue === option.value,
								action: () => onChange(option.value),
							}),
						);
						const menu = await Menu.new({
							items: await Promise.all(items),
						});
						await menu.popup();
						await menu.close();
					}}
				>
					{(() => {
						const currentValue = getValue();
						const option = options.find((opt) => opt.value === currentValue);
						return option ? option.text : currentValue;
					})()}
					<IconCapChevronDown class="size-4" />
				</button>
			</Setting>
		);
	};

	return (
		<div class="flex flex-col h-full custom-scroll">
			<div class="p-4 space-y-6">
				<AppearanceSection
					currentTheme={settings.theme ?? "system"}
					onThemeChange={(newTheme) => {
						setSettings("theme", newTheme);
						generalSettingsStore.set({ theme: newTheme });
					}}
				/>

				<For each={settingsGroups}>
					{(group) => (
						<Show when={group.os === ostype || !group.os}>
							<div>
								<h3
									class={cx(
										"mb-3 text-sm text-gray-12 w-fit",
										group.titleStyling,
									)}
								>
									{group.title}
								</h3>
								<div class="px-3 rounded-xl border divide-y divide-gray-3 border-gray-3 bg-gray-2">
									<For each={group.items}>
										{(item) => {
											// Check OS compatibility
											if (
												item.type === "toggle" &&
												item.os &&
												item.os !== ostype
											) {
												return null;
											}

											if (item.type === "toggle") {
												return (
													<ToggleSetting
														pro={group.title === "Cap Pro"}
														label={item.label}
														description={item.description}
														value={item.value}
														onChange={item.onChange}
													/>
												);
											} else if (item.type === "select") {
												if (
													item.label === "Main window recording start behaviour"
												) {
													return renderRecordingSelect(
														item.label,
														item.description,
														() => item.value,
														item.onChange,
														[
															{ text: "关闭", value: "close" },
															{ text: "最小化", value: "minimise" },
														],
													);
												} else if (item.label === "工作室录制结束行为") {
													return renderRecordingSelect(
														item.label,
														item.description,
														() => item.value,
														item.onChange,
														[
															{ text: "打开编辑器", value: "openEditor" },
															{
																text: "在悬浮窗中显示",
																value: "showOverlay",
															},
														],
													);
												} else if (item.label === "录制倒计时") {
													return renderRecordingSelect(
														item.label,
														item.description,
														() => item.value,
														item.onChange,
														[
															{ text: "关闭", value: 0 },
															{ text: "3秒", value: 3 },
															{ text: "5秒", value: 5 },
															{ text: "10秒", value: 10 },
														],
													);
												} else if (item.label === "删除录像后的行为") {
													return renderRecordingSelect(
														item.label,
														item.description,
														() => item.value,
														item.onChange,
														[
															{ text: "无操作", value: "doNothing" },
															{
																text: "重新打开录制窗口",
																value: "reopenRecordingWindow",
															},
														],
													);
												}
											}
											return null;
										}}
									</For>
								</div>
							</div>
						</Show>
					)}
				</For>

				<ServerURLSetting
					value={settings.serverUrl ?? "https://cap.so"}
					onChange={async (v) => {
						const url = new URL(v);
						const origin = url.origin;

						if (
							!(await confirm(
								`您确定要将服务器 URL 更改为 '${origin}' 吗？您需要重新登录。`,
							))
						)
							return;

						await authStore.set(undefined);
						await commands.setServerUrl(origin);
						handleChange("serverUrl", origin);
					}}
				/>
			</div>
		</div>
	);
}

function ServerURLSetting(props: {
	value: string;
	onChange: (v: string) => void;
}) {
	const [value, setValue] = createWritableMemo(() => props.value);

	return (
		<div class="flex flex-col gap-3">
			<h3 class="text-sm text-gray-12 w-fit">自托管</h3>
			<div class="flex flex-col gap-2 px-4 rounded-xl border border-gray-3 bg-gray-2">
				<Setting
					label="Cap 服务器 URL"
					description="仅当您自托管 Cap Web 实例时才应更改此设置。"
				>
					<div class="flex flex-col gap-2 items-end">
						<Input
							class="bg-gray-3"
							value={value()}
							onInput={(e) => setValue(e.currentTarget.value)}
						/>
						<Button
							size="sm"
							class="mt-2"
							variant="dark"
							disabled={props.value === value()}
							onClick={() => props.onChange(value())}
						>
							更新
						</Button>
					</div>
				</Setting>
			</div>
		</div>
	);
}
