import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'
import { ClearSettingsTabComponent } from './settings-tab.component'

@Injectable()
export class ClearSettingsTabProvider extends SettingsTabProvider {
    id = 'iflow-newline'
    icon = 'fas fa-keyboard'
    title = 'iflow Newline'
    weight = 10

    getComponentType() {
        return ClearSettingsTabComponent
    }
}