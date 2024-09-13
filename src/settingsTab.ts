import MultipleDailyNotes from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { DailyNoteConfiguration } from "./settings";

export default class DailyNotesSettingTab extends PluginSettingTab {
	plugin: MultipleDailyNotes;

	constructor(app: App, plugin: MultipleDailyNotes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Daily Notes Configurations" });

		// List current configurations
		this.plugin.settings.dailyNotesConfigs.forEach((config, index) => {
			this.addDailyNoteConfigUI(containerEl, config, index);
		});

		// "Add new configuration" button
		new Setting(containerEl).addButton((button) => {
			button
				.setButtonText("Add New Daily Note Config")
				.setCta()
				.onClick(() => {
					// Add new config
					this.plugin.settings.dailyNotesConfigs.push({
						folder: "",
						template: "",
						dateFormat: "YYYY-MM-DD",
						timeOffset: "00:00", // Default time offset
					});
					this.plugin.saveSettings();
					this.display(); // Refresh the UI
				});
		});
	}

	/**
	 * Adds the UI for each daily note configuration.
	 */
	addDailyNoteConfigUI(
		containerEl: HTMLElement,
		config: DailyNoteConfiguration,
		index: number
	) {
		const setting = new Setting(containerEl);

		// Folder setting
		setting
			.setName(`Daily Note Config ${index + 1}`)
			.setDesc("Configure your daily note settings")
			.addText((text) =>
				text
					.setPlaceholder("Folder path")
					.setValue(config.folder)
					.onChange(async (value) => {
						config.folder = value;
						await this.plugin.saveSettings();
					})
			);

		// Template setting
		setting.addText((text) =>
			text
				.setPlaceholder("Template path")
				.setValue(config.template)
				.onChange(async (value) => {
					config.template = value;
					await this.plugin.saveSettings();
				})
		);

		// Date Format setting
		setting.addText((text) =>
			text
				.setPlaceholder("Date format")
				.setValue(config.dateFormat)
				.onChange(async (value) => {
					config.dateFormat = value;
					await this.plugin.saveSettings();
				})
		);

		// Time offset setting
		setting.addText((text) =>
			text
				.setPlaceholder("Time offset (e.g., 02:30)")
				.setValue(config.timeOffset || "00:00")
				.onChange(async (value) => {
					config.timeOffset = value;
					await this.plugin.saveSettings();
				})
		);

		// "Delete configuration" button
		setting.addButton((button) => {
			button
				.setButtonText("Delete")
				.setWarning()
				.onClick(() => {
					this.plugin.settings.dailyNotesConfigs.splice(index, 1);
					this.plugin.saveSettings();
					this.display(); // Refresh the UI
				});
		});
	}
}
