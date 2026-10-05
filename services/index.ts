export * from "./_api";
export * as authService from "./_auth";
export type { ApiUser, AuthResponse, Availability, LoginPayload, RegisterPayload, ForgotPasswordPayload, ForgotPasswordResponse } from "./_auth";
export * as platformService from "./_platforms";
export type { OwnershipPayload, PlatformAccount, VerificationCode } from "./_platforms";
export * as profileService from "./_profile";
export type {
  PinnedAchievement,
  PlatformShare,
  ProfileCardData,
  ProfileStats,
  ProfileStatsResponse,
  ProfileUpdatePayload,
} from "./_profile";
