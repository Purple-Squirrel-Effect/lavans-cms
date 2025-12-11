<script lang="ts">
	import { page } from '$app/state';
	import { pb } from '$lib/pocketbase';
	import { untrack } from 'svelte';
	import {
		type BasemodelsResponse,
		type MaterialsAndColorsResponse,
		type OptionsResponse,
		type OptionValuesResponse,
		type SubmodelsResponse,
		OptionsStepOptions,
		OptionsQuestionTypeOptions
	} from '../../../../../pocketbase-types';

	let model = $state<BasemodelsResponse | null>(null);
	let options = $state<OptionsResponse[]>([]);
	let optionValues = $state<Record<string, OptionValuesResponse[]>>({});
	let submodels = $state<SubmodelsResponse[]>([]);
	let materialsAndColors = $state<MaterialsAndColorsResponse[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let message = $state({ text: '', type: 'success' }); // 'success' | 'error'

	// Model form fields
	let skuPart = $state('');
	let basePrice = $state(0);
	let isActive = $state(false);

	// Option Modal State
	let isOptionModalOpen = $state(false);
	let isValueModalOpen = $state(false);
	let editingOption = $state<OptionsResponse | null>(null);
	let editingValue = $state<OptionValuesResponse | null>(null);
	let currentOptionIdForValue = $state<string | null>(null);

	let optionForm = $state({
		name: '',
		description: '',
		step: OptionsStepOptions.article_choice,
		question_type: OptionsQuestionTypeOptions['Single Choice'],
		is_active: true
	});

	let valueForm = $state({
		name: '',
		sku_part: '',
		price_adjustment: 0,
		is_active: true,
		submodel: '',
		material_or_color: '',
		description: ''
	});

	let optionSaving = $state(false);
	let valueSaving = $state(false);

	async function loadData(id: string) {
		loading = true;

		try {
			// 1. Fetch Model
			model = await pb.collection('basemodels').getOne(id);

			skuPart = model.sku_part || '';
			basePrice = model.baseprice || 0;
			isActive = model.is_active || false;

			// 2. Fetch Options
			const optionsList = await pb.collection('options').getFullList({
				filter: `basemodel = "${id}"`,
				sort: 'step'
			});

			options = optionsList;

			// 2.5 Fetch Submodels
			submodels = await pb.collection('submodels').getFullList({
				sort: 'name'
			});

			// 2.6 Fetch Materials and Colors for this basemodel
			materialsAndColors = await pb.collection('materials_and_colors').getFullList({
				filter: `basemodel = "${id}"`,
				sort: 'name'
			});

			// 3. Fetch Values
			if (options.length > 0) {
				const filterExpr = options.map((o) => `option = "${o.id}"`).join(' || ');

				const allValues = await pb.collection('option_values').getFullList({
					filter: filterExpr
				});

				const valuesMap: Record<string, OptionValuesResponse[]> = {};
				options.forEach((opt) => {
					valuesMap[opt.id] = allValues.filter((v) => v.option === opt.id);
				});
				optionValues = valuesMap;
			} else {
				optionValues = {};
			}
		} catch (err: any) {
			console.error('Error loading data:', err);
			message = { text: 'Failed to load data: ' + err.message, type: 'error' };
		} finally {
			loading = false;
		}
	}

	async function saveModel() {
		if (!model) return;
		saving = true;
		message = { text: '', type: 'success' };
		try {
			await pb.collection('basemodels').update(model.id, {
				sku_part: skuPart,
				baseprice: basePrice,
				is_active: isActive
			});
			message = { text: 'Model saved successfully', type: 'success' };
		} catch (err) {
			console.error('Error saving model:', err);
			message = { text: 'Failed to save model', type: 'error' };
		} finally {
			saving = false;
		}
	}

	// async function saveOptionValue(value: OptionValuesResponse) { ... } // Removed as now handled by modal

	function openOptionModal(option: OptionsResponse | null = null) {
		editingOption = option;
		if (option) {
			optionForm = {
				name: option.name || '',
				description: option.description || '',
				step: option.step || OptionsStepOptions.article_choice,
				question_type: option.question_type || OptionsQuestionTypeOptions['Single Choice'],
				is_active: option.is_active || false
			};
		} else {
			optionForm = {
				name: '',
				description: '',
				step: OptionsStepOptions.article_choice,
				question_type: OptionsQuestionTypeOptions['Single Choice'],
				is_active: true
			};
		}
		isOptionModalOpen = true;
	}

	async function handleSaveOption() {
		if (!model) return;
		optionSaving = true;
		try {
			const data = {
				...optionForm,
				basemodel: model.id
			};

			if (editingOption) {
				await pb.collection('options').update(editingOption.id, data);
			} else {
				await pb.collection('options').create(data);
			}

			// Refresh data
			await loadData(model.id);
			isOptionModalOpen = false;
		} catch (err) {
			console.error('Error saving option:', err);
			alert('Failed to save option');
		} finally {
			optionSaving = false;
		}
	}

	function openValueModal(optionId: string, value: OptionValuesResponse | null = null) {
		currentOptionIdForValue = optionId;
		editingValue = value;
		
		const currentOption = options.find((o) => o.id === optionId);
		const isColorOrMaterialChoice = 
			currentOption?.question_type === OptionsQuestionTypeOptions['Color Choice'] ||
			currentOption?.question_type === OptionsQuestionTypeOptions['Material Choice'];

		if (value) {
			valueForm = {
				name: value.name || '',
				sku_part: value.sku_part || '',
				price_adjustment: value.price_adjustment || 0,
				is_active: value.is_active || false,
				submodel: isColorOrMaterialChoice ? '' : (value.submodel || ''),
				material_or_color: isColorOrMaterialChoice ? (value.material_or_color || '') : '',
				description: value.description || ''
			};
		} else {
			valueForm = {
				name: '',
				sku_part: '',
				price_adjustment: 0,
				is_active: true,
				submodel: isColorOrMaterialChoice ? '' : '',
				material_or_color: isColorOrMaterialChoice ? '' : '',
				description: ''
			};
		}
		isValueModalOpen = true;
	}

	async function handleSaveOptionValue() {
		if (!currentOptionIdForValue) return;
		valueSaving = true;

		const currentOption = options.find((o) => o.id === currentOptionIdForValue);
		const isColorOrMaterialChoice = 
			currentOption?.question_type === OptionsQuestionTypeOptions['Color Choice'] ||
			currentOption?.question_type === OptionsQuestionTypeOptions['Material Choice'];

		try {
			const updateData: any = {
				name: valueForm.name,
				sku_part: valueForm.sku_part,
				price_adjustment: valueForm.price_adjustment,
				is_active: valueForm.is_active
			};

			if (isColorOrMaterialChoice) {
				updateData.material_or_color = valueForm.material_or_color || null;
				updateData.submodel = null;
			} else {
				updateData.submodel = valueForm.submodel || null;
				updateData.material_or_color = null;
			}

			if (editingValue) {
				// Update existing
				await pb.collection('option_values').update(editingValue.id, updateData);

				// Update local state
				const optionId = currentOptionIdForValue;
				if (optionValues[optionId]) {
					optionValues[optionId] = optionValues[optionId].map((v) =>
						v.id === editingValue!.id ? { ...v, ...updateData } : v
					) as OptionValuesResponse[];
				}
			} else {
				// Create new
				const createData = {
					...updateData,
					option: currentOptionIdForValue,
					basemodel_id: model?.id
				};
				
				const newValue = await pb.collection('option_values').create(createData);

				// Update local state
				if (!optionValues[currentOptionIdForValue]) {
					optionValues[currentOptionIdForValue] = [];
				}
				optionValues[currentOptionIdForValue] = [
					...optionValues[currentOptionIdForValue],
					newValue
				];
			}

			isValueModalOpen = false;
		} catch (err: any) {
			console.error('Error saving option value:', err);
			const msg = err?.data?.message || err?.message || 'Failed to save option value';
			const fieldErrors = err?.data?.data
				? Object.entries(err.data.data)
						.map(([field, error]: [string, any]) => `${field}: ${error.message}`)
						.join(', ')
				: '';
			alert(`Error: ${msg}${fieldErrors ? ` (${fieldErrors})` : ''}`);
		} finally {
			valueSaving = false;
		}
	}

	async function handleDeleteOption(option: OptionsResponse) {
		if (!confirm(`Are you sure you want to delete "${option.name || 'Option'}"?`)) return;

		try {
			await pb.collection('options').delete(option.id);
			if (model) await loadData(model.id);
		} catch (err) {
			console.error('Error deleting option:', err);
			alert('Failed to delete option');
		}
	}

	async function handleAddOptionValue(optionId: string) {
		try {
			const newValue = await pb.collection('option_values').create({
				option: optionId,
				name: 'New Value',
				sku_part: `new-${Date.now()}`, // Ensure unique SKU part
				price_adjustment: 0,
				is_active: true,
				basemodel_id: model?.id // Potentially required by schema
			});

			// Update local state
			if (!optionValues[optionId]) {
				optionValues[optionId] = [];
			}
			optionValues[optionId] = [...optionValues[optionId], newValue];
		} catch (err: any) {
			console.error('Error creating option value:', err);
			// Display more specific error if available
			const msg = err?.data?.message || err?.message || 'Failed to create option value';
			// Check if there are field-specific errors
			const fieldErrors = err?.data?.data
				? Object.entries(err.data.data)
						.map(([field, error]: [string, any]) => `${field}: ${error.message}`)
						.join(', ')
				: '';

			alert(`Error: ${msg}${fieldErrors ? ` (${fieldErrors})` : ''}`);
		}
	}

	async function handleDeleteOptionValue(value: OptionValuesResponse, optionId: string) {
		if (!confirm(`Are you sure you want to delete "${value.name}"?`)) return;

		try {
			await pb.collection('option_values').delete(value.id);

			// Update local state
			optionValues[optionId] = optionValues[optionId].filter((v) => v.id !== value.id);
		} catch (err) {
			console.error('Error deleting option value:', err);
			alert('Failed to delete option value');
		}
	}

	$effect(() => {
		const id = page.params.id;
		untrack(() => loadData(id));
	});
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<a
			href="/models"
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-4 w-4"><path d="m15 18-6-6 6-6" /></svg
			>
			<span class="sr-only">Back</span>
		</a>
		<h1 class="text-2xl font-bold tracking-tight text-slate-900">
			Edit {model?.name || 'Model'}
		</h1>
	</div>

	{#if loading}
		<div class="flex h-40 items-center justify-center text-slate-500">Loading...</div>
	{:else}
		<!-- Model Details Card -->
		<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<div class="mb-4">
				<h2 class="text-lg font-semibold text-slate-900">Model Details</h2>
				<p class="text-sm text-slate-500">Manage the core settings for this model.</p>
			</div>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					saveModel();
				}}
				class="space-y-4"
			>
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<label for="sku_part" class="text-sm font-medium leading-none text-slate-900"
							>SKU Part</label
						>
						<input
							id="sku_part"
							type="text"
							bind:value={skuPart}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						/>
					</div>
					<div class="space-y-2">
						<label for="baseprice" class="text-sm font-medium leading-none text-slate-900"
							>Base Price</label
						>
						<input
							id="baseprice"
							type="number"
							step="0.01"
							bind:value={basePrice}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						/>
					</div>
					<!-- Is Active Field -->
					<div class="space-y-2 flex flex-col justify-end pb-1">
						<label class="flex items-center gap-2 text-sm font-medium leading-none text-slate-900">
							<input
								type="checkbox"
								bind:checked={isActive}
								class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
							/>
							<span>Active</span>
						</label>
					</div>
				</div>

				{#if message.text}
					<div
						class="rounded-md p-3 text-sm {message.type === 'success'
							? 'bg-green-50 text-green-600'
							: 'bg-red-50 text-red-600'}"
					>
						{message.text}
					</div>
				{/if}

				<div class="flex justify-end">
					<button
						type="submit"
						disabled={saving}
						class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>

		<!-- Options Section -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold tracking-tight text-slate-900">Options</h2>
				<button
					onclick={() => openOptionModal()}
					class="inline-flex h-8 items-center justify-center rounded-md bg-slate-900 px-3 text-xs font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
				>
					Add Option
				</button>
			</div>

			{#if options.length === 0}
				<div class="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
					<h3 class="text-lg font-medium text-slate-900">No Options Found</h3>
					<p class="mt-2 text-sm text-slate-500">
						There are no options associated with this model.
					</p>
				</div>
			{:else}
				{#each options as option}
					<div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
						<div
							class="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between"
						>
							<div>
								<h3 class="font-semibold text-slate-900">{option.name}</h3>
								<div class="text-xs text-slate-500 mt-1 flex gap-2">
									<span
										class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-900"
									>
										{option.step}
									</span>
									<span
										class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-900"
									>
										{option.question_type}
									</span>
									{#if !option.is_active}
										<span
											class="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
										>
											Inactive
										</span>
									{/if}
								</div>
								{#if option.description}
									<div class="text-sm text-slate-500 mt-2">{@html option.description}</div>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<button
									onclick={() => openOptionModal(option)}
									class="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
								>
									Edit
								</button>
								<button
									onclick={() => handleDeleteOption(option)}
									class="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
								>
									Delete
								</button>
							</div>
						</div>

						<div class="p-0">
							<table class="w-full caption-bottom text-sm">
								<thead class="[&_tr]:border-b bg-slate-50/20">
									<tr class="border-b border-slate-200">
										<th class="h-10 px-4 text-left align-middle font-medium text-slate-500">Name</th
										>
										<th class="h-10 px-4 text-left align-middle font-medium text-slate-500 w-32"
											>SKU Part</th
										>
										<th class="h-10 px-4 text-left align-middle font-medium text-slate-500 w-32"
											>Price Adj.</th
										>
										<th class="h-10 px-4 text-center align-middle font-medium text-slate-500 w-24"
											>Active</th
										>
										<th class="h-10 px-4 text-right align-middle font-medium text-slate-500 w-24"
											>Action</th
										>
									</tr>
								</thead>
								<tbody>
									{#if optionValues[option.id]}
										{#each optionValues[option.id] as val}
											<tr class="border-b border-slate-200 last:border-0 hover:bg-slate-50/50">
												<td class="p-4 align-middle font-medium">{val.name}</td>
												<td class="p-4 align-middle">{val.sku_part}</td>
												<td class="p-4 align-middle">{val.price_adjustment}</td>
												<td class="p-4 align-middle text-center">
													{#if val.is_active}
														<span class="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
													{:else}
														<span class="inline-flex h-2 w-2 rounded-full bg-slate-300"></span>
													{/if}
												</td>
												<td class="p-4 align-middle text-right">
													<div class="flex items-center justify-end gap-2">
														<button
															onclick={() => openValueModal(option.id, val)}
															class="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
														>
															Edit
														</button>
														<button
															onclick={() => handleDeleteOptionValue(val, option.id)}
															class="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										{/each}
									{:else}
										<tr>
											<td colspan="5" class="p-4 text-center text-slate-500">No values found</td>
										</tr>
									{/if}

									<!-- Add Value Row -->
									<tr class="border-t border-slate-200 bg-slate-50/30">
										<td colspan="5" class="p-2 text-center">
											<button
												onclick={() => openValueModal(option.id)}
												class="inline-flex h-8 w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-transparent text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
											>
												+ Add Value
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

{#if isOptionModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-slate-900 mb-4">
				{editingOption ? 'Edit Option' : 'New Option'}
			</h2>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSaveOption();
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label for="opt_name" class="text-sm font-medium leading-none text-slate-900">Name</label>
					<input
						id="opt_name"
						type="text"
						required
						bind:value={optionForm.name}
						class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
					/>
				</div>

				<div class="space-y-2">
					<label for="opt_desc" class="text-sm font-medium leading-none text-slate-900"
						>Description</label
					>
					<textarea
						id="opt_desc"
						bind:value={optionForm.description}
						class="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
					></textarea>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="opt_step" class="text-sm font-medium leading-none text-slate-900"
							>Step</label
						>
						<select
							id="opt_step"
							bind:value={optionForm.step}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						>
							{#each Object.values(OptionsStepOptions) as step}
								<option value={step}>{step}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2">
						<label for="opt_type" class="text-sm font-medium leading-none text-slate-900"
							>Type</label
						>
						<select
							id="opt_type"
							bind:value={optionForm.question_type}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						>
							{#each Object.values(OptionsQuestionTypeOptions) as type}
								<option value={type}>{type}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2 pt-2">
					<label class="flex items-center gap-2 text-sm font-medium leading-none text-slate-900">
						<input
							type="checkbox"
							bind:checked={optionForm.is_active}
							class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
						/>
						<span>Active</span>
					</label>
				</div>

				<div class="flex justify-end gap-2 mt-6">
					<button
						type="button"
						onclick={() => (isOptionModalOpen = false)}
						class="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={optionSaving}
						class="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
					>
						{optionSaving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if isValueModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
			<h2 class="text-lg font-bold text-slate-900 mb-4">
				{editingValue ? 'Edit Value' : 'New Value'}
			</h2>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSaveOptionValue();
				}}
				class="space-y-4"
			>
				<div class="space-y-2">
					<label for="val_name" class="text-sm font-medium leading-none text-slate-900">Name</label>
					<input
						id="val_name"
						type="text"
						required
						bind:value={valueForm.name}
						class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="val_sku" class="text-sm font-medium leading-none text-slate-900"
							>SKU Part</label
						>
						<input
							id="val_sku"
							type="text"
							required
							bind:value={valueForm.sku_part}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						/>
					</div>

					<div class="space-y-2">
						<label for="val_price" class="text-sm font-medium leading-none text-slate-900"
							>Price Adjustment</label
						>
						<input
							id="val_price"
							type="number"
							step="0.01"
							bind:value={valueForm.price_adjustment}
							class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
						/>
					</div>
				</div>

				{#if currentOptionIdForValue}
					{@const currentOption = options.find((o) => o.id === currentOptionIdForValue)}
					{@const isColorOrMaterialChoice = 
						currentOption?.question_type === OptionsQuestionTypeOptions['Color Choice'] ||
						currentOption?.question_type === OptionsQuestionTypeOptions['Material Choice']}
					
					{#if isColorOrMaterialChoice}
						<div class="space-y-2">
							<label for="val_material_or_color" class="text-sm font-medium leading-none text-slate-900"
								>{currentOption?.question_type === OptionsQuestionTypeOptions['Color Choice'] ? 'Color' : 'Material'}</label
							>
							<select
								id="val_material_or_color"
								bind:value={valueForm.material_or_color}
								class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
							>
								<option value="">None</option>
								{#each materialsAndColors as mat}
									<option value={mat.id}>{mat.name}</option>
								{/each}
							</select>
						</div>
					{:else}
						<div class="space-y-2">
							<label for="val_submodel" class="text-sm font-medium leading-none text-slate-900"
								>Submodel</label
							>
							<select
								id="val_submodel"
								bind:value={valueForm.submodel}
								class="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
							>
								<option value="">None</option>
								{#each submodels as sub}
									<option value={sub.id}>{sub.name}</option>
								{/each}
							</select>
						</div>
					{/if}
				{/if}

				<div class="space-y-2">
					<label for="val_desc" class="text-sm font-medium leading-none text-slate-900"
						>Description</label
					>
					<textarea
						id="val_desc"
						bind:value={valueForm.description}
						class="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
					></textarea>
				</div>

				<div class="space-y-2 pt-2">
					<label
						class="flex items-center gap-2 text-sm font-medium leading-none text-slate-900 cursor-pointer"
					>
						<input
							type="checkbox"
							bind:checked={valueForm.is_active}
							class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
						/>
						<span>Active</span>
					</label>
				</div>

				<div class="flex justify-end gap-2 mt-6">
					<button
						type="button"
						onclick={() => (isValueModalOpen = false)}
						class="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 cursor-pointer"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={valueSaving}
						class="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
					>
						{valueSaving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
