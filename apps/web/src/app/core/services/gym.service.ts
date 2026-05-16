import { inject, Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { API_CONSTANTS } from "../constants/api-constants";
import { Observable, shareReplay, tap } from "rxjs";
import { ApiResponse } from "../../shared/models/api-response.model";
import { OnboardGymRequest, GymOwnerResponse, GymListResponse, UpdateGymOwnerRequest } from "../../shared/models/gym.model";
import { PagedResponse } from "../../shared/models/paged-response.model";

import { AuthApiService } from "./auth-api.service";

@Injectable({
    providedIn: 'root',
})
export class GymService extends BaseApiService {
    private authService = inject(AuthApiService);

    private gymOwnersCache$?: Observable<ApiResponse<PagedResponse<GymOwnerResponse>>> | null;
    private gymListCache$?: Observable<ApiResponse<PagedResponse<GymListResponse>>> | null;
    private branchesCache = new Map<string, Observable<ApiResponse<any[]>>>();

    constructor() {
        super();
        this.authService.userProfile$.subscribe(user => {
            if (!user) {
                this.clearCache();
            }
        });
    }

    clearCache(): void {
        this.gymOwnersCache$ = null;
        this.gymListCache$ = null;
        this.branchesCache.clear();
    }

    clearGymOwnersCache(): void {
        this.gymOwnersCache$ = null;
    }

    clearGymListCache(): void {
        this.gymListCache$ = null;
        this.branchesCache.clear();
    }

    clearBranchesCache(gymId?: string): void {
        if (gymId) {
            this.branchesCache.delete(gymId);
        } else {
            this.branchesCache.clear();
        }
    }

    onboardGym(payload: OnboardGymRequest): Observable<ApiResponse<any>> {
        return this.post<ApiResponse<any>>(API_CONSTANTS.GYM.ONBOARD, payload).pipe(
            tap(() => this.clearGymListCache())
        );
    }

    getGymOwnersList(pageNumber: number = 1, pageSize: number = 10, search: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<GymOwnerResponse>>> {
        if (search || pageNumber !== 1 || pageSize !== 10 || forceRefresh) {
            const params: any = { pageNumber, pageSize };
            if (search) params.searchTerm = search;
            return this.get<ApiResponse<PagedResponse<GymOwnerResponse>>>(API_CONSTANTS.GYM_OWNER.LIST, params);
        }

        if (!this.gymOwnersCache$) {
            this.gymOwnersCache$ = this.get<ApiResponse<PagedResponse<GymOwnerResponse>>>(API_CONSTANTS.GYM_OWNER.LIST, { pageNumber: 1, pageSize: 10 }).pipe(
                shareReplay(1)
            );
        }

        return this.gymOwnersCache$;
    }

    getGymList(pageNumber: number = 1, pageSize: number = 10, search: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<GymListResponse>>> {
        if (search || pageNumber !== 1 || pageSize !== 10 || forceRefresh) {
            const params: any = { pageNumber, pageSize };
            if (search) params.searchTerm = search;
            return this.get<ApiResponse<PagedResponse<GymListResponse>>>(API_CONSTANTS.GYM.LIST, params);
        }

        if (!this.gymListCache$) {
            this.gymListCache$ = this.get<ApiResponse<PagedResponse<GymListResponse>>>(API_CONSTANTS.GYM.LIST, { pageNumber: 1, pageSize: 10 }).pipe(
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
                this.clearGymListCache();
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
        if (this.branchesCache.has(gymId)) {
            return this.branchesCache.get(gymId)!;
        }
        const url = API_CONSTANTS.GYM.BRANCHES.replace('{id}', gymId);
        const obs = this.get<ApiResponse<any[]>>(url).pipe(shareReplay(1));
        this.branchesCache.set(gymId, obs);
        return obs;
    }

    addGymBranch(gymId: string, payload: any): Observable<ApiResponse<any>> {
        const url = API_CONSTANTS.GYM.BRANCHES.replace('{id}', gymId);
        return this.post<ApiResponse<any>>(url, payload).pipe(
            tap(() => this.clearBranchesCache(gymId))
        );
    }

    getMyGym(): Observable<ApiResponse<GymListResponse>> {
        return this.get<ApiResponse<GymListResponse>>(API_CONSTANTS.GYM.MY_GYM);
    }
}