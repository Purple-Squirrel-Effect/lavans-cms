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

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight text-slate-900">Models</h1>
		<!-- Add button could go here if creating is allowed -->
	</div>

	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Name</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">SKU Part</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Base Price</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Updated</th>
						<th class="h-12 px-4 text-right align-middle font-medium text-slate-500">Actions</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#if loading}
						<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
							<td colspan="5" class="h-24 text-center align-middle">
								<div class="flex items-center justify-center text-slate-500">Loading...</div>
							</td>
						</tr>
					{:else if models.length === 0}
						<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
							<td colspan="5" class="h-24 text-center align-middle">
								<div class="flex items-center justify-center text-slate-500">No models found</div>
							</td>
						</tr>
					{:else}
						{#each models as model}
							<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
								<td class="p-4 align-middle font-medium">{model.name}</td>
								<td class="p-4 align-middle">{model.sku_part}</td>
								<td class="p-4 align-middle">
									{#if model.baseprice}
										€{model.baseprice.toFixed(2)}
									{:else}
										-
									{/if}
								</td>
								<td class="p-4 align-middle text-slate-500">
									{new Date(model.updated).toLocaleDateString()}
								</td>
								<td class="p-4 align-middle text-right">
									<a
										href="/models/{model.id}"
										class="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium ring-offset-white transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
									>
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

