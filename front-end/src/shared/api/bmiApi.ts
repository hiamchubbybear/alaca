import { request, type ApiResponse } from './apiClient'

export type PracticeLevel = 'NEWBIE' | 'EASY' | 'MEDIUM' | 'HARD' | 'PRO'

export type CreateBmiRecordRequest = {
  heightCm: number
  weightKg: number
  practiceLevel: PracticeLevel
  activityFactor: number
}

export type CreateBmiRecordResponse = {
  bmi?: number
  BMI?: number
  bmiRecordID?: string
  BMIRecordID?: string
  assessment?: string
  Assessment?: string
  dailyCalories?: number
  DailyCalories?: number
  practiceLevel?: PracticeLevel
  PracticeLevel?: PracticeLevel
  activityFactor?: number
  ActivityFactor?: number
}

export async function createBmiRecord(
  payload: CreateBmiRecordRequest
): Promise<ApiResponse<CreateBmiRecordResponse>> {
  return request<CreateBmiRecordRequest, CreateBmiRecordResponse>('/bmi/me', {
    method: 'POST',
    body: payload,
    auth: true
  })
}

export type BmiRecord = {
  bmiRecordId?: string
  profileId?: string
  heightCm?: number
  weightKg?: number
  bmi?: number
  BMI?: number
  assessment?: string
  Assessment?: string
  goal?: Record<string, unknown>
  Goal?: Record<string, unknown>
  practiceLevel?: PracticeLevel
  PracticeLevel?: PracticeLevel
  activityFactor?: number
  ActivityFactor?: number
  isCurrent?: boolean
  IsCurrent?: boolean
  recordedAt?: string
  RecordedAt?: string
}

export async function getMyBmiRecords(): Promise<ApiResponse<BmiRecord[]>> {
  return request<undefined, BmiRecord[]>('/bmi/my-records', {
    method: 'GET',
    auth: true
  })
}

