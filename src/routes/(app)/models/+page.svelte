<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { BasemodelsResponse } from '../../../../pocketbase-types';

	let models = $state<BasemodelsResponse[]>([]);
	let loading = $state(true);

	$effect(() => {
		async function fetchModels() {
			try {
				models = await pb.collection('basemodels').getFullList({
					sort: '-created'
				});
			} catch (err) {
				console.error('Error fetching models:', err);
			} finally {
				loading = false;
			}
		}

		fetchModels();
	});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-slate-900">Models</h1>
		<p class="mt-2 text-sm text-slate-600">Manage your product configurations and pricing.</p>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b bg-slate-50/50">
					<tr class="border-b border-slate-200">
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Name</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">SKU Part</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Base Price</th
						>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Status</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Updated</th>
						<th class="h-12 px-6 text-right align-middle font-semibold text-slate-700">Actions</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#if loading}
						<tr>
							<td colspan="6" class="h-32 text-center align-middle">
								<div class="flex flex-col items-center justify-center gap-3 text-slate-500">
									<div
										class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"
									></div>
									<p class="text-sm">Loading models...</p>
								</div>
							</td>
						</tr>
					{:else if models.length === 0}
						<tr>
							<td colspan="6" class="h-32 text-center align-middle">
								<div class="flex flex-col items-center justify-center gap-2 text-slate-500">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="48"
										height="48"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="text-slate-300"
									>
										<path d="m7.5 4.27 9 5.15" />
										<path
											d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
										/>
										<path d="m3.3 7 8.7 5 8.7-5" />
										<path d="M12 22V12" />
									</svg>
									<p class="text-sm font-medium">No models found</p>
									<p class="text-xs">Models will appear here once created</p>
								</div>
							</td>
						</tr>
					{:else}
						{#each models as model}
							<tr class="border-b border-slate-200 transition-colors hover:bg-slate-50/50">
								<td class="p-6 align-middle">
									<div class="font-medium text-slate-900">{model.name}</div>
								</td>
								<td class="p-6 align-middle">
									<span class="font-mono text-xs text-slate-600">{model.sku_part}</span>
								</td>
								<td class="p-6 align-middle">
									{#if model.baseprice}
										<span class="font-semibold text-slate-900">€{model.baseprice.toFixed(2)}</span>
									{:else}
										<span class="text-slate-400">-</span>
									{/if}
								</td>
								<td class="p-6 align-middle">
									{#if model.is_active}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-green-600"></span>
											Active
										</span>
									{:else}
										<span
											class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
										>
											<span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
											Inactive
										</span>
									{/if}
								</td>
								<td class="p-6 align-middle text-sm text-slate-500">
									{new Date(model.updated).toLocaleDateString()}
								</td>
								<td class="p-6 align-middle text-right">
									<a
										href="/models/{model.id}"
										class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium transition-colors hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
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
											<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
											<path d="m15 5 4 4" />
										</svg>
										Edit
									</a>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
