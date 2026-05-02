import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { API_CONSTANTS } from "../constants/api-constants";
import { Observable, shareReplay, tap } from "rxjs";
import { ApiResponse } from "../../shared/models/api-response.model";
import { OnboardGymRequest, GymOwnerResponse, GymListResponse, UpdateGymOwnerRequest } from "../../shared/models/gym.model";

@Injectable({
    providedIn: 'root',
})
export class GymService extends BaseApiService {

    private gymOwnersCache$?: Observable<ApiResponse<GymOwnerResponse[]>>;
    private gymListCache$?: Observable<ApiResponse<GymListResponse[]>>;

    constructor() {
        super();
    }

    clearGymOwnersCache(): void {
        this.gymOwnersCache$ = undefined;
    }

    clearGymListCache(): void {
        this.gymListCache$ = undefined;
    }

    onboardGym(payload: OnboardGymRequest): Observable<ApiResponse<any>> {
        return this.post<ApiResponse<any>>(API_CONSTANTS.GYM.ONBOARD, payload).pipe(
            tap(() => {
                this.clearGymOwnersCache();
                this.clearGymListCache();
            })
        );
    }

    getGymOwnersList(forceRefresh = false): Observable<ApiResponse<GymOwnerResponse[]>> {
        if (!this.gymOwnersCache$ || forceRefresh) {
            this.gymOwnersCache$ = this.get<ApiResponse<GymOwnerResponse[]>>(API_CONSTANTS.GYM_OWNER.LIST).pipe(
                shareReplay(1)
            );
        }
        return this.gymOwnersCache$;
    }

    getGymList(forceRefresh = false): Observable<ApiResponse<GymListResponse[]>> {
        if (!this.gymListCache$ || forceRefresh) {
            this.gymListCache$ = this.get<ApiResponse<GymListResponse[]>>(API_CONSTANTS.GYM.LIST).pipe(
                shareReplay(1)
            );
        }
        return this.gymListCache$;
    }

    deleteGymOwner(ownerId: string): Observable<ApiResponse<any>> {
        return this.delete<ApiResponse<any>>(`${API_CONSTANTS.GYM_OWNER.DELETE}/${ownerId}`).pipe(
            tap(() => this.clearGymOwnersCache())
        );
    }

    updateGymOwner(ownerId: string, payload: UpdateGymOwnerRequest): Observable<ApiResponse<any>> {
        return this.put<ApiResponse<any>>(`${API_CONSTANTS.GYM_OWNER.UPDATE}/${ownerId}`, payload).pipe(
            tap(() => {
                this.clearGymOwnersCache();
                this.clearGymListCache(); // In case owner details reflect on gym list
            })
        );
    }

    updateGym(gymId: string, payload: any): Observable<ApiResponse<any>> {
        return this.put<ApiResponse<any>>(`${API_CONSTANTS.GYM.UPDATE}/${gymId}`, payload).pipe(
            tap(() => this.clearGymListCache())
        );
    }

    deleteGym(gymId: string): Observable<ApiResponse<any>> {
        return this.delete<ApiResponse<any>>(`${API_CONSTANTS.GYM.DELETE}/${gymId}`).pipe(
            tap(() => this.clearGymListCache())
        );
    }

    getGymBranches(gymId: string): Observable<ApiResponse<any[]>> {
        const url = API_CONSTANTS.GYM.BRANCHES.replace('{id}', gymId);
        return this.get<ApiResponse<any[]>>(url);
    }

    addGymBranch(gymId: string, payload: any): Observable<ApiResponse<any>> {
        const url = API_CONSTANTS.GYM.BRANCHES.replace('{id}', gymId);
        return this.post<ApiResponse<any>>(url, payload);
    }
}