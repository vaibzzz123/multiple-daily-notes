import { Plugin, Notice, TFile, moment } from "obsidian"; // Import the Plugin class from Obsidian API
import { DailyNotesConfig, defaultDailyNotesConfig } from "./types";
import SettingsTab from "./settings";

export default class MultipleDailyNotes extends Plugin {
	settings: [];
	// Called when the plugin is loaded
	async onload() {
		console.log("Loading MyPlugin");
		// Example config, hard coded for now, will be configurable in settings UI later
		const configs: DailyNotesConfig[] = [
			{
				templateFileLocation: "fold1/Template1.md",
				newFileFolder: "fold1/",
				dateFormat: "YYYY-MM-DD",
				timeOffset: "00:00",
				commandDescription: "Open main journal daily note"
			},
			{
				templateFileLocation: "fold2/Template2.md",
				newFileFolder: "fold2/",
				dateFormat: "YYYY-MM-DD",
				timeOffset: "00:00",
			},
		];

		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

    for(const config of configs) {
      this.addRibbonIcon(
        config.ribbonIcon || "calendar",
        config.commandDescription || `Open Daily Note: ${config.templateFileLocation}`,
        async () => {
          await this.openDailyNote(config);
        }
      );
    }

		this.addCommand({
			id: "create-daily-notes",
			name: "Create Daily Notes from config",
			callback: () => {
				for (const config of configs) {
					this.createDailyNote(config);
				}
			},
		});
	}
	async loadSettings() {
		this.settings = Object.assign({}, defaultDailyNotesConfig, await this.loadData());
	}

	async openDailyNote(config: DailyNotesConfig) {
		const dailyNoteFilePath = this.getNoteFilePathForConfig(config);
		let dailyNoteFile = this.app.vault.getAbstractFileByPath(
			dailyNoteFilePath
		) as TFile;
		if (!dailyNoteFile) {
			await this.createDailyNote(config);
      dailyNoteFile = this.app.vault.getAbstractFileByPath(
        dailyNoteFilePath
      ) as TFile;
		}
		this.app.workspace.getLeaf().openFile(dailyNoteFile);
	}

	getNoteFilePathForConfig(config: DailyNotesConfig) {
		const date = moment();
		const hoursOffset = parseInt(config.timeOffset.split(":")[0]);
		const minutesOffset = parseInt(config.timeOffset.split(":")[1]);
		date.subtract(hoursOffset, "hours").subtract(minutesOffset, "minutes");
		const newFileName = date.format(config.dateFormat) + ".md";
		return config.newFileFolder + newFileName;
	}

	async createDailyNote(config: DailyNotesConfig) {
		const templateFile = this.app.vault.getAbstractFileByPath(
			config.templateFileLocation
		) as TFile;
		if (templateFile instanceof TFile) { // Will only run if the template file exists
			try {
				const templateFileContents = await this.app.vault.read(
					templateFile
				);
				const newFilePath = this.getNoteFilePathForConfig(config);
				const newFileContents = templateFileContents;
				const newFile =
					this.app.vault.getAbstractFileByPath(newFilePath);
				if (!newFile) {
					await this.app.vault.create(newFilePath, newFileContents);
					new Notice(
						`Created new file: ${newFilePath} based off template: ${config.templateFileLocation}`
					);
				}
			} catch (err) {
				new Notice(`Error creating new file: ${err}`);
			}
		}
	}

	// Called when the plugin is unloaded (e.g., when disabled or removed)
	onunload() {
		console.log("Unloading MyPlugin");
	}
}
