export interface DailyNotesConfig {
  name?: string;
  templateFileLocation: string;
  newFileFolder: string;
  dateFormat: string;
  timeOffset: string; // HH:mm format
  ribbonIcon?: string;
  commandDescription?: string;
}

export interface PluginSettings {
  settings: DailyNotesConfig[];
}

export const defaultSettings: PluginSettings = {
  settings: [
  {
    name: "daily",
    templateFileLocation: "",
    newFileFolder: "",
    dateFormat: "",
    timeOffset: "",
  }
]
};
