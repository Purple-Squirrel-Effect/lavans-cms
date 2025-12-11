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

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-slate-900">Submissions</h1>
		<p class="mt-2 text-sm text-slate-600">View and manage customer configuration submissions.</p>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white shadow-sm">
		<div class="relative w-full overflow-auto">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b bg-slate-50/50">
					<tr class="border-b border-slate-200">
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Name</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Email</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Phone</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">SKU</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Price</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Created</th>
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
									<p class="text-sm">Loading submissions...</p>
								</div>
							</td>
						</tr>
					{:else if submissions.length === 0}
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
										<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
										<path
											d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
										/>
									</svg>
									<p class="text-sm font-medium">No submissions yet</p>
									<p class="text-xs">Customer submissions will appear here</p>
								</div>
							</td>
						</tr>
					{:else}
						{#each submissions as submission}
							<tr class="border-b border-slate-200 transition-colors hover:bg-slate-50/50">
								<td class="p-6 align-middle font-medium text-slate-900">{submission.name}</td>
								<td class="p-6 align-middle text-slate-600">{submission.email || '-'}</td>
								<td class="p-6 align-middle text-slate-600">{submission.phone || '-'}</td>
								<td class="p-6 align-middle">
									<span class="font-mono text-xs text-slate-600">{submission.sku || '-'}</span>
								</td>
								<td class="p-6 align-middle">
									<span class="font-semibold text-slate-900">€{submission.price.toFixed(2)}</span>
								</td>
								<td class="p-6 align-middle text-sm text-slate-500">
									{new Date(submission.created).toLocaleString()}
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
