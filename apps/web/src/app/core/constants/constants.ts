export const CONSTANTS = {

    //#region Common

    COMMON_ERROR_MESSAGE: 'Something went wrong!',
    COMMON_SUCCESS_MESSAGE: 'Operation successful!',
    COMMON_DELETE_SUCCESS_MESSAGE: 'Deleted successfully!',
    COMMON_DELETE_ERROR_MESSAGE: 'Failed to delete!',
    COMMON_UPDATE_SUCCESS_MESSAGE: 'Updated successfully!',
    COMMON_UPDATE_ERROR_MESSAGE: 'Failed to update!',
    COMMON_LOAD_ERROR_MESSAGE: 'Failed to load!',

    ACTIONS: {
        EDIT: 'edit',
        VIEW: 'view',
        DELETE: 'delete',
        INVITE: 'invite',
        RE_INVITE: 're-invite',
        UPDATE: 'update',
        LOAD: 'load',
        ROW_CLICK: 'row-click',
    },

    COMMON_SUCCESS_TITLE: 'Success',
    COMMON_ERROR_TITLE: 'Error',
    COMMON_WARNING_TITLE: 'Warning',
    COMMON_INFO_TITLE: 'Info',

    //#endregion

    //#region Auth
    AUTH: {
        LOGIN_SUCCESS: 'Login successful!',
        LOGIN_FAILED: 'Authentication failed.',
        LOGIN_ERROR: 'Login failed. Please try again.',
        REGISTER_SUCCESS: 'Registration successful! Please sign in.',
        REGISTER_FAILED: 'Registration failed. Please try again.',
        PASSWORD_SET_SUCCESS: 'Password set successfully! You can now log in.',
        PASSWORD_RESET_LINK_SENT: 'Password reset link has been sent to your email.'
    },
    //#endregion

    //#region Gym Owner

    GYM_OWNER_DELETE_VALIDATION_MESSAGE: 'Gym Owner cannot be deleted as they own gyms!',
    GYM_OWNER_DELETE_SUCCESS_MESSAGE: 'Gym Owner deleted successfully!',
    GYM_OWNER_DELETE_ERROR_MESSAGE: 'Failed to delete Gym Owner!',
    GYM_OWNER_INVITE_SUCCESS_MESSAGE: 'Gym Owner invited successfully!',
    GYM_OWNER_INVITE_ERROR_MESSAGE: 'Failed to invite Gym Owner!',
    GYM_OWNER_RE_INVITE_SUCCESS_MESSAGE: 'Gym Owner re-invited successfully!',
    GYM_OWNER_RE_INVITE_ERROR_MESSAGE: 'Failed to re-invite Gym Owner!',
    GYM_OWNER_UPDATE_SUCCESS_MESSAGE: 'Gym Owner updated successfully!',
    GYM_OWNER_UPDATE_ERROR_MESSAGE: 'Failed to update Gym Owner!',
    GYM_OWNER_LOAD_ERROR_MESSAGE: 'Failed to load Gym Owners!',

    //#endregion

    //#region UI Labels
    UI_LABELS: {
        STATUS: 'Status',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        SEARCH: 'Search',
    },
    //#endregion

    //#region Confirmations
    CONFIRMATIONS: {
        DELETE_GYM_TITLE: 'Delete Gym',
        DELETE_GYM_MESSAGE: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        DELETE_PLAN_TITLE: 'Delete Plan',
        DELETE_PLAN_MESSAGE: 'Are you sure you want to delete this plan? This action cannot be undone.',
        DELETE_OWNER_TITLE: 'Delete Gym Owner',
        DELETE_OWNER_MESSAGE: 'Are you sure you want to delete this gym owner? This action cannot be undone.',
    },
    //#endregion

    //#region Pricing
    PLAN_CREATE_SUCCESS_MESSAGE: 'Plan created successfully',
    PLAN_DELETE_SUCCESS_MESSAGE: 'Plan deleted successfully!',
    PLAN_DELETE_ERROR_MESSAGE: 'Failed to delete plan!',
    PLAN_DELETE_VALIDATION_MESSAGE: 'Plan cannot be deleted as it is associated with gyms!',
    //#endregion

    //#region Gym
    GYM_ONBOARD_SUCCESS_MESSAGE: 'Gym onboarded successfully!',
    GYM_ONBOARD_ERROR_MESSAGE: 'Failed to onboard gym!',
    GYM_INVITE_SUCCESS_MESSAGE: 'Invited successfully!',
    GYM_INVITE_ERROR_MESSAGE: 'Failed to invite!',
    GYM_RE_INVITE_SUCCESS_MESSAGE: 'Re-invited successfully!',
    GYM_RE_INVITE_ERROR_MESSAGE: 'Failed to re-invite!',
    GYM_UPDATE_SUCCESS_MESSAGE: 'Gym updated successfully!',
    GYM_UPDATE_ERROR_MESSAGE: 'Failed to update gym!',
    GYM_DELETE_SUCCESS_MESSAGE: 'Gym deleted successfully!',
    GYM_DELETE_VALIDATION_MESSAGE: 'Gym cannot be deleted as they own branches!',
    GYM_DELETE_ERROR_MESSAGE: 'Failed to delete gym!',
    GYM_LOAD_ERROR_MESSAGE: 'Failed to load gyms!',
    //#endregion

    //#region Profile
    PROFILE_UPDATE_SUCCESS_MESSAGE: 'Profile updated successfully!',
    PROFILE_UPDATE_ERROR_MESSAGE: 'Failed to update profile!',
    PROFILE_PICTURE_UPLOAD_SUCCESS: 'Profile picture updated successfully!',
    PROFILE_PICTURE_UPLOAD_ERROR: 'Failed to upload profile picture!',
    //#endregion

    //#region Dashboard
    DASHBOARD: {
        METRIC_SUBTEXTS: {
            TOTAL_REVENUE: 'Total platform-wide earnings',
            SUBSCRIPTIONS: 'Currently active paid plans',
            TOTAL_GYMS: 'Total gyms onboarded'
        },
        LOADING: 'Loading...',
        MRR_SUBTEXT: 'Monthly Recurring Revenue',
        ARR_SUBTEXT: 'Annual Recurring Revenue',
        LOCALE: 'en-IN',
        CURRENCY: 'INR',
        REPORT_FILENAME_PREFIX: 'report',
        SPARKLINE: {
            DEFAULT_POINTS: "0,30 100,30",
            HEIGHT: 30,
            RANGE_OFFSET: 25
        }
    },
    //#endregion

    //#region Payment
    PAYMENT: {
        RAZORPAY: {
            KEY_ID: 'rzp_test_SgEiEY7pGSwfkM',
            CURRENCY: 'INR',
            COMPANY_NAME: 'GymForge SaaS',
            FLOW_DESCRIPTION: 'Testing 0 to 100 Payment Flow',
            THEME_COLOR: '#0f172a'
        },
        MESSAGES: {
            CONFIG_UPDATE_SUCCESS: 'Configuration updated successfully',
            CONFIG_UPDATE_ERROR: 'Failed to update configuration',
            SELECTION_REQUIRED: 'Please select a Gym and a Plan to test the flow.',
            VERIFICATION_SUCCESS: 'Payment verified and Subscription activated.',
            VERIFICATION_ERROR: 'Payment verification failed!'
        }
    },
    //#endregion

    //#region Settings
    SETTINGS: {
        UPDATE_SUCCESS: 'Platform strategy updated successfully!',
        UPDATE_ERROR: 'Failed to update platform strategy.'
    },
    //#endregion

    //#region Auth Accept Invitation
    AUTH_ACCEPT_INVITATION: {
        TITLE: 'Setup Account',
        SUBTITLE: 'Complete your profile by setting a secure password.',
        HERO_TITLE: 'Forge Your Future. Set Your Password.',
        HERO_SUBTITLE: "You're one step away from joining the GYMForge ecosystem. Master your management from day one.",
        VALIDATING: 'Validating invitation...',
        INVALID_TOKEN: 'Invalid invitation link. No token provided.',
        EXPIRED_TOKEN: 'This invitation link has expired or is no longer valid.',
        VALIDATION_ERROR: 'An error occurred while validating your invitation. Please try again later.',
        SET_PASSWORD_ERROR: 'Failed to set password. Please try again.',
    },
    //#endregion

    //#region Gym Plans
    GYM_PLANS_MODULE: {
        LOAD_ERROR: 'Failed to load plans',
        CONTEXT_ERROR: 'User context not found. Please refresh.',
        UPDATE_SUCCESS: 'Plan updated successfully',
        UPDATE_ERROR: 'Failed to update plan',
        CREATE_SUCCESS: 'Plan created successfully',
        CREATE_ERROR: 'Failed to create plan',
        DELETE_TITLE: 'Delete Plan',
        DELETE_CONFIRM: 'Are you sure you want to delete the plan "{name}"?',
        STATUS_UPDATE_SUCCESS: 'Plan {status} successfully',
        STATUS_UPDATE_ERROR: 'Failed to update plan status',
    },
    //#endregion

    //#region Members
    MEMBERS_MODULE: {
        LOAD_ERROR: 'Failed to load members',
        DETAIL_LOAD_ERROR_PREFIX: 'Failed to load member details: ',
        DETAIL_LOAD_ERROR: 'Failed to load member details',
        DELETE_SUCCESS: 'Member removed successfully',
        DELETE_ERROR: 'Failed to remove member',
        ONBOARD_SUCCESS: 'Member onboarded successfully!',
        ONBOARD_ERROR: 'Failed to onboard member',
        UPDATE_SUCCESS: 'Member profile updated!',
        UPDATE_ERROR: 'Failed to update member',
        FREEZE_SUCCESS: 'Member frozen',
        FREEZE_ERROR: 'Failed to freeze member',
        UNFREEZE_SUCCESS: 'Member unfrozen',
        UNFREEZE_ERROR: 'Failed to unfreeze member',
        STATUS_UPDATE_SUCCESS: 'Member status updated',
        STATUS_UPDATE_ERROR: 'Failed to update status',
        RENEW_SUCCESS: 'Subscription renewed!',
        RENEW_ERROR: 'Failed to renew subscription',
        EXPORT_SUCCESS: 'Export started',
        EXPORT_ERROR: 'Failed to export members',
        DELETE_CONFIRM_TITLE: 'Remove Member',
        DELETE_CONFIRM_MSG: 'Are you sure you want to remove {name}? This action cannot be undone.',
    },
    //#endregion

    //#region Staff
    STAFF_MODULE: {
        SESSION_ERROR: 'Unable to identify gym session.',
        LOAD_ERROR: 'Failed to load staff directory.',
        DELETE_SUCCESS: 'Staff member removed successfully.',
        DELETE_ERROR: 'Failed to remove staff.',
        EXPORT_INFO: 'Export functionality coming soon.',
        DELETE_CONFIRM_MSG: 'Are you sure you want to remove {name} from your gym? This action cannot be undone.',
        DELETE_CONFIRM_TITLE: 'Remove Staff Member?',

    },
    //#endregion
}