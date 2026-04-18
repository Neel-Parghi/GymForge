import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { API_CONSTANTS } from "../constants/api-constants";
import { Observable } from "rxjs";
import { ApiResponse } from "../../shared/models/api-response.model";
import { OnboardGymRequest, GymOwnerResponse, GymListResponse } from "../../shared/models/gym.model";

@Injectable({
    providedIn: 'root',
})
export class GymService extends BaseApiService {

    constructor() {
        super();
    }

    onboardGym(payload: OnboardGymRequest): Observable<ApiResponse<any>> {
        return this.post(API_CONSTANTS.GYM.ONBOARD, payload);
    }

    getGymOwners(): Observable<ApiResponse<GymOwnerResponse[]>> {
        return this.get(API_CONSTANTS.GYM.GYM_OWNER);
    }

    getGymList(): Observable<ApiResponse<GymListResponse[]>> {
        return this.get(API_CONSTANTS.GYM.GYM_LIST);
    }

    deleteGymOwner(ownerId: string): Observable<ApiResponse<any>> {
        return this.delete(`${API_CONSTANTS.GYM.GYM_OWNER_DELETE}/${ownerId}`);
    }
}