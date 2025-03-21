import {
	AbstractInputSuggest,
	App,
	getIconIds,
	PluginSettingTab,
	Setting,
	TFolder,
	setIcon,
} from "obsidian";
import MultipleDailyNotes from "./main";

class FileFolderSuggestion extends AbstractInputSuggest<string> {
	private plugin: MultipleDailyNotes;
	private index: number;
	private suggestionType: "file" | "folder";

	constructor(
		app: App,
		inputEl: HTMLInputElement,
		plugin: MultipleDailyNotes,
		index: number,
		suggesionType: "file" | "folder"
	) {
		super(app, inputEl);
		this.plugin = plugin;
		this.index = index;
		this.suggestionType = suggesionType;
	}

	getSuggestions(input: string): string[] {
		const files = this.app.vault.getFiles();

		if (this.suggestionType === "folder") {
			const filesAndFolders = this.app.vault.getAllLoadedFiles();
			const folders = filesAndFolders.filter(
				(item) => item instanceof TFolder
			);
			return folders
				.filter((folder) =>
					folder.path.toLowerCase().includes(input.toLowerCase())
				)
				.map((folder) => folder.path);
		}

		return files
			.filter((file) =>
				file.path.toLowerCase().includes(input.toLowerCase())
			)
			.map((file) => file.path);
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	async selectSuggestion(value: string): Promise<void> {
		this.setValue(value);
		if (this.suggestionType === "folder") {
			this.plugin.settings.settings[this.index].newFileFolder = value;
		} else {
			this.plugin.settings.settings[this.index].templateFileLocation =
				value;
		}
		await this.plugin.saveSettings();
		this.close();
	}
}

class IconSuggestion extends AbstractInputSuggest<string> {
	private plugin: MultipleDailyNotes;
	private index: number;

	constructor(
		app: App,
		inputEl: HTMLInputElement,
		plugin: MultipleDailyNotes,
		index: number
	) {
		super(app, inputEl);
		this.plugin = plugin;
		this.index = index;
	}

	getSuggestions(input: string): string[] {
		const icons = getIconIds();
		return icons.filter((icon) =>
			icon.toLowerCase().includes(input.toLowerCase())
		);
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		const span = el.createSpan();
		setIcon(span, value);
		el.createSpan({ text: " " + value });
	}

	async selectSuggestion(value: string): Promise<void> {
		this.setValue(value);
		this.plugin.settings.settings[this.index].ribbonIcon = value;
		await this.plugin.saveSettings();
		this.close();
	}
}

export default class SettingsTab extends PluginSettingTab {
	plugin: MultipleDailyNotes;
	constructor(app: App, plugin: MultipleDailyNotes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		for (let i = 0; i < this.plugin.settings.settings.length; i++) {
			const setting = this.plugin.settings.settings[i];

			// Configuration header
			new Setting(containerEl).setName(`Config ${i + 1}`).setHeading();

			// Template File Location
			new Setting(containerEl)
				.setName("Template file location")
				.setDesc("Path to the template file")
				.addText((text) => {
					const inputEl = text.inputEl;
					new FileFolderSuggestion(
						this.app,
						inputEl,
						this.plugin,
						i,
						"file"
					);

					return text
						.setPlaceholder("Location of template file")
						.setValue(setting.templateFileLocation);
				});

			// New File Folder
			new Setting(containerEl)
				.setName("New file folder")
				.setDesc("Folder where new files will be created")
				.addText((text) => {
					const inputEl = text.inputEl;
					new FileFolderSuggestion(
						this.app,
						inputEl,
						this.plugin,
						i,
						"folder"
					);

					return text
						.setPlaceholder("Location of folder for new file")
						.setValue(setting.newFileFolder);
				});

			// Date Format
			new Setting(containerEl)
				.setName("Date format")
				.setDesc("Date format for new files")
				.addText((text) =>
					text
						.setPlaceholder("YYYY-MM-DD")
						.setValue(setting.dateFormat)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].dateFormat = value;
							await this.plugin.saveSettings();
						})
				);

			// Time Offset
			new Setting(containerEl)
				.setName("Time offset")
				.setDesc("Time offset for the note")
				.addText((text) =>
					text
						.setPlaceholder("00:00")
						.setValue(setting.timeOffset)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].timeOffset = value;
							await this.plugin.saveSettings();
						})
				);

			// Ribbon Icon
			new Setting(containerEl)
				.setName("Ribbon icon")
				.setDesc("Icon to display in the ribbon")
				.addSearch((text) => {
					const inputEl = text.inputEl;
					new IconSuggestion(this.app, inputEl, this.plugin, i);
					text.setPlaceholder("calendar").setValue(
						setting.ribbonIcon ?? ""
					);
				});

			// Command Description
			new Setting(containerEl)
				.setName("Command description")
				.setDesc("Description for the custom command")
				.addText((text) =>
					text
						.setPlaceholder("Custom command description")
						.setValue(setting.commandDescription ?? "")
						.onChange(async (value) => {
							this.plugin.settings.settings[
								i
							].commandDescription = value;
							await this.plugin.saveSettings();
						})
				);

			// Delete Button
			new Setting(containerEl)
				.setName("Delete configuration")
				.addButton((button) => {
					button.setButtonText("Delete").onClick(async () => {
						this.plugin.settings.settings.splice(i, 1);
						await this.plugin.saveSettings();
						this.display();
					});
				});
		}

		// Add New Configuration Button
		new Setting(containerEl)
			.setName("Add new configuration")
			.addButton((button) => {
				button.setButtonText("Add").onClick(async () => {
					this.plugin.settings.settings.push({
						templateFileLocation: "",
						newFileFolder: "",
						dateFormat: "",
						timeOffset: "",
						ribbonIcon: "",
						commandDescription: "",
					});
					await this.plugin.saveSettings();
					this.display();
				});
			});
	}
}
