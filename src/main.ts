import { Plugin, Notice, TFile, moment } from 'obsidian'; // Import the Plugin class from Obsidian API
import { MyPluginSettings, MyPluginSettingsManager, DailyNoteConfiguration } from './settings';
import DailyNotesSettingTab from './settingsTab';

export default class MultipleDailyNotes extends Plugin {
  settings: MyPluginSettings;
  settingsManager: MyPluginSettingsManager;  
  async onload() {
    console.log('Loading MultipleDailyNotes');
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
    const now = moment();
    const offset = config.timeOffset || '00:00';
    
    // Parse the time offset (HH:mm format)
    const [hoursOffset, minutesOffset] = offset.split(':').map(Number);
    
    // Apply the offset by subtracting hours and minutes
    const offsetTime = now.subtract({ hours: hoursOffset, minutes: minutesOffset });
  
    // Format the date according to the user's settings
    const date = offsetTime.format(config.dateFormat);
    const folderPath = `${config.folder}/${date}.md`;
  
    // Check if the file already exists
    const existingFile = this.app.vault.getAbstractFileByPath(folderPath);
    if (existingFile) {
      new Notice(`Daily note for ${date} already exists in ${config.folder}`);
      return;
    }
  
    // Create the daily note
    let templateContent = '';
    if (config.template) {
      const templateFile = this.app.vault.getAbstractFileByPath(config.template);
      if (templateFile && templateFile instanceof TFile) {
        this.app.vault.read(templateFile).then(content => {
          templateContent = content.replace('{{date}}', date);
          this.app.vault.create(folderPath, templateContent);
        });
      } else {
        this.app.vault.create(folderPath, ``);
      }
    } else {
      this.app.vault.create(folderPath, ``);
    }
  
    new Notice(`Created daily note for ${date} in ${config.folder}`);
  }}
