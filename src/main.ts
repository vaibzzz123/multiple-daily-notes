import { Plugin, Notice, TFile, moment } from "obsidian"; // Import the Plugin class from Obsidian API
import { DailyNotesConfig } from "./types";

export default class MultipleDailyNotes extends Plugin {
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
			},
			{
				templateFileLocation: "fold2/Template2.md",
				newFileFolder: "fold2/",
				dateFormat: "YYYY-MM-DD",
				timeOffset: "00:00",
			},
		];

    for(const config of configs) {
      this.addRibbonIcon(
        config.ribbonIcon || "calendar",
        `Create Daily Note: ${config.templateFileLocation}`,
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
		if (templateFile instanceof TFile) {
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
