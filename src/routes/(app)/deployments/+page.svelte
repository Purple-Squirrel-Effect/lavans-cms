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
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight text-slate-900">Deployments</h1>
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
						<th class="h-10 px-6 text-left align-middle font-medium text-slate-500">Environment</th>
						<th class="h-10 px-6 text-left align-middle font-medium text-slate-500">Status</th>
						<th class="h-10 px-6 text-left align-middle font-medium text-slate-500">Date</th>
						<th class="h-10 px-6 text-right align-middle font-medium text-slate-500">Action</th>
					</tr>
				</thead>
				<tbody>
					{#if deployments.length === 0}
						<tr>
							<td colspan="4" class="p-6 text-center text-slate-500">No deployments found</td>
						</tr>
					{:else}
						{#each deployments as deploy}
							<tr class="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
								<td class="p-6 align-middle font-medium capitalize">{deploy.environment}</td>
								<td class="p-6 align-middle">
									<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
										{deploy.status === 'success' ? 'bg-green-100 text-green-800' : 
										 deploy.status === 'failed' ? 'bg-red-100 text-red-800' : 
										 'bg-slate-100 text-slate-800'}">
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

