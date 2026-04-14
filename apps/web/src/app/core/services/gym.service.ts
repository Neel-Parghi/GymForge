import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { API_CONSTANTS } from "../constants/api-constants";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class GymService extends BaseApiService {

    constructor() {
        super();
    }

    onboardGym(payload: any): Observable<any> {
        return this.post(API_CONSTANTS.GYM.ONBOARD, payload);
    }

    getGymOwners(): Observable<any> {
        return this.get(API_CONSTANTS.GYM.GYM_OWNER);
    }

    getGymList(): Observable<any> {
        return this.get(API_CONSTANTS.GYM.GYM_LIST);
    }
}