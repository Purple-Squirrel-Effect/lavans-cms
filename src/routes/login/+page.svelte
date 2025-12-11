<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function login(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			await pb.collection('users').authWithPassword(email, password);
			goto('/');
		} catch (err: any) {
			console.error(err);
			error = err.message || 'Failed to login';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
	<div class="w-full max-w-sm space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="space-y-2 text-center">
			<h1 class="text-2xl font-bold tracking-tight text-slate-900">Login</h1>
			<p class="text-sm text-slate-500">Enter your credentials to access the dashboard</p>
		</div>

		<form onsubmit={login} class="space-y-4">
			<div class="space-y-2">
				<label for="email" class="text-sm font-medium leading-none text-slate-900"
					>Email</label
				>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="name@example.com"
					class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm font-medium leading-none text-slate-900"
					>Password</label
				>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
					required
				/>
			</div>

			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-500">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
			>
				{#if loading}
					Signing in...
				{:else}
					Sign in
				{/if}
			</button>
		</form>
	</div>
</div>

