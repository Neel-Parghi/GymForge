import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { API_CONSTANTS } from "../constants/api-constants";
import { Observable } from "rxjs";
import { ApiResponse } from "../../shared/models/api-response.model";
import { OnboardGymRequest, GymOwnerResponse, GymListResponse, UpdateGymOwnerRequest } from "../../shared/models/gym.model";

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

    getGymOwnersList(): Observable<ApiResponse<GymOwnerResponse[]>> {
        return this.get(API_CONSTANTS.GYM_OWNER.LIST);
    }

    getGymList(): Observable<ApiResponse<GymListResponse[]>> {
        return this.get(API_CONSTANTS.GYM.LIST);
    }

    deleteGymOwner(ownerId: string): Observable<ApiResponse<any>> {
        return this.delete(`${API_CONSTANTS.GYM_OWNER.DELETE}/${ownerId}`);
    }

    updateGymOwner(ownerId: string, payload: UpdateGymOwnerRequest): Observable<ApiResponse<any>> {
        return this.put(`${API_CONSTANTS.GYM_OWNER.UPDATE}/${ownerId}`, payload);
    }

    updateGym(gymId: string, payload: any): Observable<ApiResponse<any>> {
        return this.put(`${API_CONSTANTS.GYM.UPDATE}/${gymId}`, payload);
    }
}