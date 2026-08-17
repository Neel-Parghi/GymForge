import { inject, Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { BranchContextService } from "./branch-context.service";
import { Observable, shareReplay, tap } from "rxjs";
import { MemberBillingOverviewDto, CreateCustomInvoiceRequest, StaffPayrollOverviewDto, UpdateStaffPayrollRuleRequest, ReleaseStaffPayoutRequest, RecordPaymentRequest, PaymentRecordDto } from "../../shared/models/member-invoice.model";
import { API_CONSTANTS } from "../constants/api-constants";
import { ApiResponse } from "../../shared/models/api-response.model";

@Injectable({
    providedIn: 'root'
})

export class BillingService extends BaseApiService {

    private branchContextService = inject(BranchContextService);

    private memberOverviewCache = new Map<string, Observable<ApiResponse<MemberBillingOverviewDto>>>();
    private staffOverviewCache = new Map<string, Observable<ApiResponse<StaffPayrollOverviewDto>>>();

    constructor() {
        super();
    }

    clearCache(): void {
        this.memberOverviewCache.clear();
        this.staffOverviewCache.clear();
    }

    getMemberBillingOverview(monthKey: string, forceRefresh = false): Observable<ApiResponse<MemberBillingOverviewDto>> {
        const branchId = this.branchContextService.getActiveBranchId() || 'all-branches';
        const cacheKey = `${monthKey}-${branchId}`;

        if (forceRefresh || !this.memberOverviewCache.has(cacheKey)) {
            const params: Record<string, string> = { monthKey };
            const activeBranchId = this.branchContextService.getActiveBranchId();
            if (activeBranchId) {
                params['branchId'] = activeBranchId;
            }
            const request$ = this.get<ApiResponse<MemberBillingOverviewDto>>(API_CONSTANTS.BILLING.MEMBERS_OVERVIEW, params).pipe(
                shareReplay(1)
            );
            this.memberOverviewCache.set(cacheKey, request$);
        }

        return this.memberOverviewCache.get(cacheKey)!;
    }

    createCustomInvoice(payload: CreateCustomInvoiceRequest): Observable<ApiResponse<null>> {
        return this.post<ApiResponse<null>>(API_CONSTANTS.BILLING.CREATE_INVOICE, payload).pipe(
            tap(() => this.clearCache())
        );
    }

    recordPayment(recordId: string, payload: RecordPaymentRequest): Observable<ApiResponse<null>> {
        return this.post<ApiResponse<null>>(`${API_CONSTANTS.BILLING.PAY_INVOICE}/${recordId}`, payload).pipe(
            tap(() => this.clearCache())
        );
    }

    getPaymentHistory(recordId: string): Observable<ApiResponse<PaymentRecordDto[]>> {
        return this.get<ApiResponse<PaymentRecordDto[]>>(`${API_CONSTANTS.BILLING.PAY_INVOICE}/${recordId}/history`);
    }

    getStaffPayrollOverview(monthKey: string, forceRefresh = false): Observable<ApiResponse<StaffPayrollOverviewDto>> {
        const branchId = this.branchContextService.getActiveBranchId() || 'all-branches';
        const cacheKey = `${monthKey}-${branchId}`;

        if (forceRefresh || !this.staffOverviewCache.has(cacheKey)) {
            const params: Record<string, string> = { monthKey };
            const activeBranchId = this.branchContextService.getActiveBranchId();
            if (activeBranchId) {
                params['branchId'] = activeBranchId;
            }
            const request$ = this.get<ApiResponse<StaffPayrollOverviewDto>>(API_CONSTANTS.BILLING.STAFF_OVERVIEW, params).pipe(
                shareReplay(1)
            );
            this.staffOverviewCache.set(cacheKey, request$);
        }

        return this.staffOverviewCache.get(cacheKey)!;
    }

    updateStaffPayrollRules(payload: UpdateStaffPayrollRuleRequest): Observable<ApiResponse<null>> {
        return this.post<ApiResponse<null>>(API_CONSTANTS.BILLING.UPDATE_STAFF_RULES, payload).pipe(
            tap(() => this.clearCache())
        );
    }

    releaseStaffPayout(payload: ReleaseStaffPayoutRequest): Observable<ApiResponse<null>> {
        return this.post<ApiResponse<null>>(API_CONSTANTS.BILLING.RELEASE_STAFF_PAYOUT, payload).pipe(
            tap(() => this.clearCache())
        );
    }
}