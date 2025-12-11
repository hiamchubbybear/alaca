import { request, type ApiResponse } from '../../../shared/api/apiClient'

// Types
export interface Challenge {
  id: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  createdBy: string
  strike?: number
  rules?: string
  reward?: string
  createdAt: string
  updatedAt?: string
}

export interface ChallengeParticipant {
  id: string
  challengeId: string
  userId: string
  joinedAt: string
  updatedAt?: string
  status: 'active' | 'completed' | 'failed' | 'withdrawn'
  progress?: string
  finalResult?: string
  challenge?: Challenge
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'workout' | 'nutrition' | 'progress' | 'social' | 'challenge'
  badgeIcon: string
  points: number
  criteria: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  createdAt: string
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  unlockedAt: string
  achievement?: Achievement
}

// API Functions

// Challenges
export async function getAllChallenges(page = 1, pageSize = 20): Promise<ApiResponse<Challenge[]>> {
  return request<undefined, Challenge[]>(`/challenges?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    auth: true
  })
}

export async function getChallengeById(id: string): Promise<ApiResponse<Challenge>> {
  return request<undefined, Challenge>(`/challenges/${id}`, {
    method: 'GET',
    auth: true
  })
}

export async function getMyChallenges(): Promise<ApiResponse<ChallengeParticipant[]>> {
  return request<undefined, ChallengeParticipant[]>('/challenges/my', {
    method: 'GET',
    auth: true
  })
}

export async function joinChallenge(challengeId: string): Promise<ApiResponse<ChallengeParticipant>> {
  return request<undefined, ChallengeParticipant>(`/challenges/${challengeId}/join`, {
    method: 'POST',
    auth: true
  })
}

export async function leaveChallenge(challengeId: string): Promise<ApiResponse<void>> {
  return request<undefined, void>(`/challenges/${challengeId}/leave`, {
    method: 'POST',
    auth: true
  })
}

// Achievements
export async function getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
  return request<undefined, Achievement[]>('/achievements', {
    method: 'GET',
    auth: true
  })
}

export async function getMyAchievements(): Promise<ApiResponse<UserAchievement[]>> {
  return request<undefined, UserAchievement[]>('/achievements/my', {
    method: 'GET',
    auth: true
  })
}
