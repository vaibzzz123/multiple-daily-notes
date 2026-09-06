import {
	CliData,
	moment,
	normalizePath,
	Notice,
	Plugin,
	TFile,
	TFolder,
} from "obsidian";
import { DailyNotesConfig, defaultSettings, PluginSettings } from "./types";
import SettingsTab from "./settings";

export default class MultipleDailyNotes extends Plugin {
	settings: PluginSettings;

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Called when the plugin is loaded
	async onload() {
		console.log("Loading MultipleDailyNotes");

		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));
		this.registerCliHandlers();

		for (const config of this.settings.settings) {
			this.addRibbonIcon(
				config.ribbonIcon || "calendar",
				config.commandDescription ||
					`Open daily note: ${config.templateFileLocation}`,
				async () => {
					await this.openDailyNote(config);
				}
			);
		}

		this.addCommand({
			id: "create-daily-notes",
			name: "Create daily notes from config",
			callback: () => {
				for (const config of this.settings.settings) {
					this.createDailyNote(config);
				}
			},
		});
	}

	registerCliHandlers() {
		this.registerCliHandler(
			"multiple-daily-notes:configs",
			"List multiple daily notes configurations as JSON",
			null,
			() =>
				JSON.stringify(
					this.settings.settings.map((config, index) => ({
						config: this.getConfigSelector(config, index),
						name: config.name?.trim() || null,
						templateFileLocation: config.templateFileLocation,
						newFileFolder: config.newFileFolder,
						dateFormat: config.dateFormat || "YYYY-MM-DD",
						timeOffset: config.timeOffset || "00:00",
						path: this.getNoteFilePathForConfig(config),
					})),
					null,
					2
				)
		);

		const configFlag = {
			config: {
				value: "<name>",
				description: "Config name or one-based config number",
				required: true,
			},
		};

		this.registerCliHandler(
			"multiple-daily-notes:path",
			"Get today's note path for a configuration",
			configFlag,
			(params) => {
				const config = this.getConfigFromCli(params);
				this.requireConfiguredFolder(config);
				return this.getNoteFilePathForConfig(config);
			}
		);

		this.registerCliHandler(
			"multiple-daily-notes:append",
			"Create today's configured note if needed, then append content",
			{
				...configFlag,
				content: {
					value: "<text>",
					description: "Content to append",
					required: true,
				},
				inline: { description: "Append without a leading newline" },
				open: { description: "Open the note after appending" },
			},
			async (params) => {
				const config = this.getConfigFromCli(params);
				if (!params.content || params.content === "true") {
					throw new Error("Missing required parameter: content");
				}

				const dailyNote = await this.getOrCreateDailyNote(config);
				const content = params.content
					.replace(/\\n/g, "\n")
					.replace(/\\t/g, "\t");
				const separator = params.inline === "true" ? "" : "\n";
				await this.app.vault.process(
					dailyNote.file,
					(current) => current + separator + content
				);

				if (params.open === "true") {
					await this.app.workspace.getLeaf().openFile(dailyNote.file);
				}

				return `Added to: ${dailyNote.file.path}`;
			}
		);
	}

	getConfigSelector(config: DailyNotesConfig, index: number) {
		return config.name?.trim() || String(index + 1);
	}

	getConfigFromCli(params: CliData) {
		const selector = params.config;
		if (!selector || selector === "true") {
			throw new Error("Missing required parameter: config");
		}

		const namedMatches = this.settings.settings.filter(
			(config) => config.name?.trim() === selector
		);
		if (namedMatches.length > 1) {
			throw new Error(`Config name is not unique: ${selector}`);
		}
		if (namedMatches.length === 1) {
			return namedMatches[0];
		}

		if (/^[1-9]\d*$/.test(selector)) {
			const config = this.settings.settings[Number(selector) - 1];
			if (config) {
				return config;
			}
		}

		throw new Error(`Config not found: ${selector}`);
	}

	requireConfiguredFolder(config: DailyNotesConfig) {
		const folderPath = normalizePath(config.newFileFolder || "");
		const folder = folderPath
			? this.app.vault.getAbstractFileByPath(folderPath)
			: this.app.vault.getRoot();
		if (!(folder instanceof TFolder)) {
			throw new Error(`Daily notes folder not found: ${folderPath}`);
		}
		return folder;
	}

	async openDailyNote(config: DailyNotesConfig) {
		const dailyNoteFilePath = this.getNoteFilePathForConfig(config);
		let dailyNoteFile =
			this.app.vault.getAbstractFileByPath(dailyNoteFilePath);
		if (!dailyNoteFile || !(dailyNoteFile instanceof TFile)) {
			await this.createDailyNote(config);
			dailyNoteFile = this.app.vault.getAbstractFileByPath(
				dailyNoteFilePath
			);
		}

		if (dailyNoteFile instanceof TFile) {
			this.app.workspace.getLeaf().openFile(dailyNoteFile);
		} else {
			new Notice("Unable to open daily note");
		}
	}

	getNoteFilePathForConfig(config: DailyNotesConfig) {
		const date = moment();
		const timeOffset = config.timeOffset || "00:00";
		const dateFormat = config.dateFormat || "YYYY-MM-DD";
		const offsetMatch = /^(\d{1,2}):(\d{2})$/.exec(timeOffset);
		if (!offsetMatch || Number(offsetMatch[2]) > 59) {
			throw new Error(`Invalid time offset: ${timeOffset}`);
		}
		const hoursOffset = Number(offsetMatch[1]);
		const minutesOffset = Number(offsetMatch[2]);
		date.subtract(hoursOffset, "hours").subtract(minutesOffset, "minutes");
		const newFileName = date.format(dateFormat) + ".md";
		return normalizePath(
			[config.newFileFolder, newFileName].filter(Boolean).join("/")
		);
	}

	async getOrCreateDailyNote(config: DailyNotesConfig) {
		this.requireConfiguredFolder(config);
		const newFilePath = this.getNoteFilePathForConfig(config);
		const existingFile = this.app.vault.getAbstractFileByPath(newFilePath);
		if (existingFile instanceof TFile) {
			return { file: existingFile, created: false };
		}
		if (existingFile) {
			throw new Error(`Daily note path is not a file: ${newFilePath}`);
		}

		const templateFile = this.app.vault.getAbstractFileByPath(
			normalizePath(config.templateFileLocation)
		);
		if (!(templateFile instanceof TFile)) {
			throw new Error(
				`Template file not found: ${config.templateFileLocation}`
			);
		}

		const templateFileContents = await this.app.vault.read(templateFile);
		const file = await this.app.vault.create(
			newFilePath,
			templateFileContents
		);
		return { file, created: true };
	}

	async createDailyNote(config: DailyNotesConfig) {
		try {
			const dailyNote = await this.getOrCreateDailyNote(config);
			if (dailyNote.created) {
				new Notice(
					`Created new file: ${dailyNote.file.path} based off template: ${config.templateFileLocation}`
				);
			}
			return dailyNote.file;
		} catch (err) {
			new Notice(`Error creating new file: ${String(err)}`);
			return null;
		}
	}

	// Called when the plugin is unloaded (e.g., when disabled or removed)
	onunload() {
		console.log("Unloading MultipleDailyNotes");
	}
}
