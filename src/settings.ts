import { App, PluginSettingTab, Setting } from "obsidian";
import MultipleDailyNotes from "./main";

export default class SettingsTab extends PluginSettingTab {
	plugin: MultipleDailyNotes;

	constructor(app: App, plugin: MultipleDailyNotes) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "Configurations" });

		for (let i = 0; i < this.plugin.settings.settings.length; i++) {
			const setting = this.plugin.settings.settings[i];
			const settingEl = new Setting(containerEl) // asdasd

				.setName(`Config ${i + 1}`)
				.addText((text) =>
					text
						.setPlaceholder("Location of template file")
						.setValue(setting.templateFileLocation)
						.onChange(async (value) => {
							this.plugin.settings.settings[
								i
							].templateFileLocation = value;
							await this.plugin.saveSettings();
						})
				)

				.addText((text) =>
					text
						.setPlaceholder("Location of folder for new file")
						.setValue(setting.newFileFolder)
						.onChange(async (value) => {
							this.plugin.settings.settings[i].newFileFolder =
								value;
							await this.plugin.saveSettings();
						})
				)

				.addText((text) =>
					text
						.setPlaceholder("YYYY-MM-DD")
						.setValue(setting.dateFormat)
						.onChange(async (value) => {
							this.plugin.settings.settings[
								i
							].templateFileLocation = value;
							await this.plugin.saveSettings();
						})
				)

        .addText((text) =>
            text
                .setPlaceholder("00:00")
                .setValue(setting.timeOffset)
                .onChange(async (value) => {
                    this.plugin.settings.settings[
                        i
                    ].timeOffset = value;
                    await this.plugin.saveSettings();
                })
              )

        .addText((text) =>
            text
                .setPlaceholder("calendar")
                .setValue(setting.ribbonIcon ?? "calendar")
                .onChange(async (value) => {
                    this.plugin.settings.settings[
                        i
                    ].templateFileLocation = value;
                    await this.plugin.saveSettings();
                })
        )

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
    }
	}
}
