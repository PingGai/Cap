import { Button } from "@cap/ui-solid";
import { useNavigate } from "@solidjs/router";
import { For, onMount } from "solid-js";

import "@total-typescript/ts-reset/filter-boolean";
import { authStore } from "~/store";
import { commands } from "~/utils/tauri";

export default function AppsTab() {
	const navigate = useNavigate();
	const auth = authStore.createQuery();

	const isPro = () => auth.data?.plan?.upgraded;

	onMount(() => {
		void commands.checkUpgradedAndUpdate();
	});

	const apps = [
		{
			name: "S3 配置",
			description:
				"连接您自己的 S3 存储桶，以完全控制您的数据存储。所有新的可共享链接上传都将自动上传到您配置的 S3 存储桶，确保您保持对内容的完全所有权和控制权。非常适合需要数据主权和自定义存储策略的组织。",
			icon: IconLucideDatabase,
			url: "/settings/integrations/s3-config",
			pro: true,
		},
	];

	const handleAppClick = async (app: (typeof apps)[number]) => {
		try {
			if (app.pro && !isPro()) {
				await commands.showWindow("Upgrade");
				return;
			}
			navigate(app.url);
		} catch (error) {
			console.error("Error handling app click:", error);
		}
	};

	return (
		<div class="p-4 space-y-4">
			<div class="flex flex-col pb-4 border-b border-gray-2">
				<h2 class="text-lg font-medium text-gray-12">集成</h2>
				<p class="text-sm text-gray-10">
					配置集成以扩展 Cap 的功能并连接第三方服务。
				</p>
			</div>
			<For each={apps}>
				{(app) => (
					<div class="px-4 py-2 rounded-lg border bg-gray-2 border-gray-3">
						<div class="flex justify-between items-center pb-2 mb-3 border-b border-gray-3">
							<div class="flex gap-2 items-center">
								<app.icon class="w-4 h-4 text-gray-12" />
								<p class="text-sm font-medium text-gray-12">{app.name}</p>
							</div>
							<Button
								size="sm"
								variant="primary"
								onClick={() => handleAppClick(app)}
							>
								{app.pro && !isPro() ? "升级到专业版" : "配置"}
							</Button>
						</div>
						<p class="text-[13px] text-gray-11">{app.description}</p>
					</div>
				)}
			</For>
		</div>
	);
}
