<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { children } = $props();

	$effect(() => {
		if (!pb.authStore.isValid) {
			goto('/login');
		}
	});

	function logout() {
		pb.authStore.clear();
		goto('/login');
	}

	// Active link helper
	function isActive(path: string) {
		return $page.url.pathname === path;
	}
</script>

<div class="flex min-h-screen w-full bg-slate-50">
	<!-- Sidebar -->
	<aside class="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex shadow-sm">
		<div class="flex h-14 items-center border-b border-slate-200 px-6 bg-black">
			<span class="text-lg font-bold text-white">Lavans CMS</span>
		</div>
		<div class="flex-1 overflow-y-auto py-4">
			<nav class="grid gap-1 px-2 text-sm font-medium">
				<a
					href="/models"
					class="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 {isActive(
						'/models'
					)
						? 'bg-slate-100 text-slate-900'
						: 'text-slate-500'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-package"
						><path d="m7.5 4.27 9 5.15" /><path
							d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
						/><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg
					>
					Models
				</a>
				<a
					href="/deployments"
					class="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 {isActive(
						'/deployments'
					)
						? 'bg-slate-100 text-slate-900'
						: 'text-slate-500'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-rocket"
						><path
							d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
						/><path
							d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
						/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path
							d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
						/></svg
					>
					Deployments
				</a>
				<a
					href="/submissions"
					class="flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 {isActive(
						'/submissions'
					)
						? 'bg-slate-100 text-slate-900'
						: 'text-slate-500'}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-inbox"
						><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path
							d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
						/></svg
					>
					Submissions
				</a>
			</nav>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex flex-1 flex-col">
		<header class="flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
			<!-- Mobile Toggle could go here -->
			<div class="flex flex-1 items-center justify-end gap-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					</div>
					<span class="text-sm font-medium text-slate-700">
						{pb.authStore.model?.email}
					</span>
				</div>
				<button
					onclick={logout}
					class="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
				>
					Logout
				</button>
			</div>
		</header>
		<main class="flex-1 p-6 bg-slate-50">
			{@render children()}
		</main>
	</div>
</div>
