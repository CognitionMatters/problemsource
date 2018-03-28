export class AppSettings {
    public static data: AppSettingsData;

    public static load() {
        const loadedData = localStorage.getItem('appSettings');
        if (loadedData) {
            AppSettings.data = JSON.parse(loadedData);
        } else {
            AppSettings.data = new AppSettingsData();
        }
        console.log('load', AppSettings.data);
    }

    public static save() {
        console.log('save', AppSettings.data);
        localStorage.setItem('appSettings', JSON.stringify(AppSettings.data));
    }
}

export class AppSettingsData {
    public savedUserName = '';
}
