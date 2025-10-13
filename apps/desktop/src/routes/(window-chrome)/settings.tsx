import { Button } from "@cap/ui-solid";
import { A, type RouteSectionProps } from "@solidjs/router";
import { getVersion } from "@tauri-apps/api/app";
import "@total-typescript/ts-reset/filter-boolean";
import { createResource, For, Show, Suspense } from "solid-js";
import { CapErrorBoundary } from "~/components/CapErrorBoundary";
import { SignInButton } from "~/components/SignInButton";

import { authStore } from "~/store";
import { trackEvent } from "~/utils/analytics";

export default function Settings(props: RouteSectionProps) {
	const auth = authStore.createQuery();
	const [version] = createResource(() => getVersion());

	const handleAuth = async () => {
		if (auth.data) {
			trackEvent("user_signed_out", { platform: "desktop" });
			authStore.set(undefined);
		}
	};

	return (
		<div class="flex-1 flex flex-row divide-x divide-gray-3 text-[0.875rem] leading-[1.25rem] overflow-y-hidden">
			<div class="flex flex-col h-full bg-gray-2">
				<ul class="min-w-[12rem] h-full p-[0.625rem] space-y-1 text-gray-12">
					<For
						each={[
							{
								href: "general",
								name: "通用",
								icon: IconCapSettings,
							},
							{
								href: "hotkeys",
								name: "快捷键",
								icon: IconCapHotkeys,
							},
							{
								href: "recordings",
								name: "历史录像",
								icon: IconLucideSquarePlay,
							},
							{
								href: "integrations",
								name: "集成",
								icon: IconLucideUnplug,
							},
							{
								href: "license",
								name: "许可证",
								icon: IconLucideGift,
							},
							{
								href: "experimental",
								name: "实验性功能",
								icon: IconCapSettings,
							},
							{
								href: "feedback",
								name: "反馈",
								icon: IconLucideMessageSquarePlus,
							},
							{
								href: "changelog",
								name: "更新日志",
								icon: IconLucideBell,
							},
						].filter(Boolean)}
					>
						{(item) => (
							<li>
								<A
									href={item.href}
									activeClass="bg-gray-5 pointer-events-none"
									class="rounded-lg h-[2rem] hover:bg-gray-3 text-[13px] px-2 flex flex-row items-center gap-[0.375rem] transition-colors"
								>
									<item.icon class="opacity-60 size-4" />
									<span>{item.name}</span>
								</A>
							</li>
						)}
					</For>
				</ul>
				<div class="p-[0.625rem] text-left flex flex-col">
					<Show when={version()}>
						{(v) => <p class="mb-2 text-xs text-gray-11">v{v()}</p>}
					</Show>
					{auth.data ? (
						<Button
							onClick={handleAuth}
							variant={auth.data ? "gray" : "dark"}
							class="w-full"
						>
							登出
						</Button>
					) : (
						<SignInButton>登录</SignInButton>
					)}
				</div>
			</div>
			<div class="overflow-y-hidden flex-1 animate-in">
				<CapErrorBoundary>
					<Suspense>{props.children}</Suspense>
				</CapErrorBoundary>
			</div>
		</div>
	);
}
