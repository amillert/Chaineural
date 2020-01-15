import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Setting } from './shared/models/setting';
import { ContractEvent } from 'src/common/models';
@Injectable()
export class SharedService {
    //=== GLOBAL SETTINGS ===
    setting: Setting;
    private emitSettingChangeSource = new Subject<Setting>();
    // Observable string streams
    settingChangeEmitted$ = this.emitSettingChangeSource.asObservable();
    // Service message commands
    emitSettingChange(change: any) {
        this.setting = change;
        this.emitSettingChangeSource.next(change);
    }

    getSetting(){
        return this.setting;
    }
    //=== GLOBAL EVENTS ===
    private emitContractEventChangeSource = new Subject<ContractEvent>();
    // Observable string streams
    contractEventChangeEmitted$ = this.emitContractEventChangeSource.asObservable();
    // Service message commands
    emitContractEventChange(change: any) {
        this.emitContractEventChangeSource.next(change);
    }
}