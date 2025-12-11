<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import type { BasemodelsResponse } from '../../../../../pocketbase-types';

	let deployments = $state<any[]>([]); // TODO: Type this properly when collection exists
	let basemodels = $state<BasemodelsResponse[]>([]);
	let loading = $state(true);

	async function loadData() {
		try {
			// Fetch deployments (mocked for now as collection might not exist)
			// deployments = await pb.collection('deployments').getFullList({ sort: '-created' });
			deployments = [];

			// Fetch basemodels for reference
			basemodels = await pb.collection('basemodels').getFullList();
		} catch (err) {
			console.error('Error loading data:', err);
		} finally {
			loading = false;
		}
	}

	async function handleDeploy(env: 'staging' | 'production') {
		if (!confirm(`Are you sure you want to deploy to ${env}?`)) return;
		try {
			// TODO: Implement actual deployment logic
			// await pb.collection('deployments').create({ ... })

			const newDeployment = {
				id: `dep-${Date.now()}`,
				environment: env,
				status: 'success',
				created: new Date().toISOString(),
				basemodel: 'all' // or specific versioning logic
			};
			deployments = [newDeployment, ...deployments];
			alert(`Successfully deployed to ${env}`);
		} catch (err) {
			console.error('Deployment failed:', err);
			alert('Deployment failed');
		}
	}

	async function handleRollback(deploymentId: string) {
		if (!confirm('Are you sure you want to rollback to this version?')) return;
		try {
			// TODO: Implement rollback logic
			alert('Rollback initiated (logic to be implemented)');
		} catch (err) {
			console.error('Rollback failed:', err);
			alert('Rollback failed');
		}
	}

	$effect(() => {
		loadData();
	});
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight text-slate-900">Deployments</h1>
		<p class="mt-2 text-sm text-slate-600">
			Deploy configurations to staging and production environments.
		</p>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900 mb-4">Deploy Configuration</h2>
		<div class="flex gap-4">
			<button
				onclick={() => handleDeploy('staging')}
				class="inline-flex h-10 items-center justify-center rounded-md bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
			>
				Deploy to Staging
			</button>
			<button
				onclick={() => handleDeploy('production')}
				class="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
			>
				Deploy to Production
			</button>
		</div>
	</div>

	<div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
		<div class="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
			<h2 class="font-semibold text-slate-900">Deployment History</h2>
		</div>
		<div class="p-0">
			<table class="w-full caption-bottom text-sm">
				<thead class="[&_tr]:border-b bg-slate-50/20">
					<tr class="border-b border-slate-200">
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700"
							>Environment</th
						>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Status</th>
						<th class="h-12 px-6 text-left align-middle font-semibold text-slate-700">Date</th>
						<th class="h-12 px-6 text-right align-middle font-semibold text-slate-700">Action</th>
					</tr>
				</thead>
				<tbody>
					{#if deployments.length === 0}
						<tr>
							<td colspan="4" class="h-32 text-center align-middle">
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
										<path
											d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
										/>
										<path
											d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
										/>
										<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
										<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
									</svg>
									<p class="text-sm font-medium">No deployments yet</p>
									<p class="text-xs">Deploy to staging or production to get started</p>
								</div>
							</td>
						</tr>
					{:else}
						{#each deployments as deploy}
							<tr class="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
								<td class="p-6 align-middle font-medium capitalize">{deploy.environment}</td>
								<td class="p-6 align-middle">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
										{deploy.status === 'success'
											? 'bg-green-100 text-green-800'
											: deploy.status === 'failed'
												? 'bg-red-100 text-red-800'
												: 'bg-slate-100 text-slate-800'}"
									>
										{deploy.status}
									</span>
								</td>
								<td class="p-6 align-middle text-slate-500">
									{new Date(deploy.created).toLocaleString()}
								</td>
								<td class="p-6 align-middle text-right">
									<button
										onclick={() => handleRollback(deploy.id)}
										class="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
									>
										Rollback
									</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
