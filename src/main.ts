import { Plugin, Notice, TFile, moment } from "obsidian"; // Import the Plugin class from Obsidian API
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
		const hoursOffset = parseInt(timeOffset.split(":")[0]);
		const minutesOffset = parseInt(timeOffset.split(":")[1]);
		date.subtract(hoursOffset, "hours").subtract(minutesOffset, "minutes");
		const newFileName = date.format(dateFormat) + ".md";
		const newFileFolder = config.newFileFolder.endsWith("/")
			? config.newFileFolder : config.newFileFolder + "/";
		return newFileFolder + newFileName;
	}

	async createDailyNote(config: DailyNotesConfig) {
		const templateFile = this.app.vault.getAbstractFileByPath(
			config.templateFileLocation
		);
		if (templateFile instanceof TFile) {
			// Will only run if the template file exists
			try {
				const templateFileContents = await this.app.vault.read(
					templateFile
				);
				const newFilePath = this.getNoteFilePathForConfig(config);
				const newFileContents = templateFileContents;
				const newFile =
					this.app.vault.getAbstractFileByPath(newFilePath);
				if (!newFile || !(newFile instanceof TFile)) {
					await this.app.vault.create(newFilePath, newFileContents);
					new Notice(
						`Created new file: ${newFilePath} based off template: ${config.templateFileLocation}`
					);
				}
			} catch (err) {
				new Notice(`Error creating new file: ${err}`);
			}
		} else {
			// Handle case where template file doesn't exist or isn't a TFile
			new Notice(
				`Template file not found: ${config.templateFileLocation}`
			);
		}
	}

	// Called when the plugin is unloaded (e.g., when disabled or removed)
	onunload() {
		console.log("Unloading MultipleDailyNotes");
	}
}
