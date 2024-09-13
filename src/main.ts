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

    this.settings.dailyNotesConfigs.forEach((config, index) => {
      this.addDailyNoteRibbon(config, index);
    });

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

  // Function to add a ribbon button for each daily note configuration
  addDailyNoteRibbon(config: DailyNoteConfiguration, index: number) {
    // Add a ribbon icon (using Obsidian's internal icon set)
    const ribbonIcon = this.addRibbonIcon(
      'calendar', // Icon from Obsidian's built-in icons (change as needed)
      `Create Daily Note (${config.folder})`, // Tooltip that shows when hovered
      () => {
        // Callback to create the daily note for this config
        this.createDailyNoteForConfig(config);
      }
    );

    // Optionally style the ribbon button or do other customizations
    ribbonIcon.addClass(`my-plugin-ribbon-${index}`);
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
