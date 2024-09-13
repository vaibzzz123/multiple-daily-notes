import { Plugin } from 'obsidian'; // Import the Plugin class from Obsidian API
import { MyPluginSettings, MyPluginSettingsManager, DailyNoteConfiguration } from './settings';
import DailyNotesSettingTab from './settingsTab';

export default class MultipleDailyNotes extends Plugin {
  settings: MyPluginSettings;
  settingsManager: MyPluginSettingsManager;  
  async onload() {
    console.log('Loading MyPlugin');
    this.settingsManager = new MyPluginSettingsManager(this);
    // Load the settings
    this.settings = await this.settingsManager.loadSettings();
    
    this.addSettingTab(new DailyNotesSettingTab(this.app, this));

    // Example: Add a simple command
    this.addCommand({
      id: 'create-daily-notes',
      name: 'Create Daily Notes',
      callback: () => {
        this.settings.dailyNotesConfigs.forEach(config => {
          this.createDailyNoteForConfig(config);
        });
      }
    });

    console.log('MultipleDailyNotes Loaded');

  }

  // Called when the plugin is unloaded (e.g., when disabled or removed)
  onunload() {
    console.log('Unloading MultipleDailyNotes');
  }

  async saveSettings() {
    await this.settingsManager.saveSettings(this.settings);
  }

  createDailyNoteForConfig(config: DailyNoteConfiguration) {
    // Add your daily note creation logic here
    // ...
  }
}
