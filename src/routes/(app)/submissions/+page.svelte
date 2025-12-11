<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { SubmissionsResponse } from '../../../../pocketbase-types';

	let submissions = $state<SubmissionsResponse[]>([]);
	let loading = $state(true);

	$effect(() => {
		async function fetchSubmissions() {
			try {
				submissions = await pb.collection('submissions').getFullList({
					sort: '-created'
				});
			} catch (err) {
				console.error('Error fetching submissions:', err);
			} finally {
				loading = false;
			}
		}

		fetchSubmissions();
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight text-slate-900">Submissions</h1>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b">
					<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Name</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Email</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Phone</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">SKU</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Price</th>
						<th class="h-12 px-4 text-left align-middle font-medium text-slate-500">Created</th>
						<th class="h-12 px-4 text-right align-middle font-medium text-slate-500">Active</th>
					</tr>
				</thead>
				<tbody class="[&_tr:last-child]:border-0">
					{#if loading}
						<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
							<td colspan="7" class="h-24 text-center align-middle">
								<div class="flex items-center justify-center text-slate-500">Loading...</div>
							</td>
						</tr>
					{:else if submissions.length === 0}
						<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
							<td colspan="7" class="h-24 text-center align-middle">
								<div class="flex items-center justify-center text-slate-500">No submissions found</div>
							</td>
						</tr>
					{:else}
						{#each submissions as submission}
							<tr class="border-b border-slate-200 transition-colors hover:bg-slate-100/50">
								<td class="p-4 align-middle font-medium">{submission.name}</td>
								<td class="p-4 align-middle">{submission.email || '-'}</td>
								<td class="p-4 align-middle">{submission.phone || '-'}</td>
								<td class="p-4 align-middle font-mono text-xs">{submission.sku || '-'}</td>
								<td class="p-4 align-middle font-medium">
									€{submission.price.toFixed(2)}
								</td>
								<td class="p-4 align-middle text-slate-500">
									{new Date(submission.created).toLocaleString()}
								</td>
								<td class="p-4 align-middle text-right">
									{#if submission.is_active}
										<span class="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
									{:else}
										<span class="inline-flex h-2 w-2 rounded-full bg-slate-300"></span>
									{/if}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

