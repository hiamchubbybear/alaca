# Challenge & Achievement UI Design

## Backend Structure Analysis

### Models:

1. **Challenge**:
   - Title, Description
   - StartDate, EndDate
   - Strike (streak days)
   - Rules (JSON), Reward (JSON)
   - Participants (collection)

2. **ChallengeParticipant**:
   - Status: active, completed, failed, withdrawn
   - Progress (JSON)
   - FinalResult (JSON)
   - JoinedAt

3. **Achievement**:
   - Name, Description
   - Category: workout, nutrition, progress, social, challenge
   - BadgeIcon (emoji)
   - Points
   - Tier: bronze, silver, gold, platinum
   - Criteria (JSON)

### API Endpoints:

- `GET /challenges` - Get all challenges
- `GET /challenges/{id}` - Get challenge by ID
- `POST /challenges` - Create challenge (Admin)
- `POST /challenges/{id}/join` - Join challenge
- `GET /challenges/my` - Get user's challenges
- `GET /achievements` - Get all achievements
- `GET /achievements/my` - Get user's achievements

## UI Design Proposal

### Layout: Two Tabs

```
┌─────────────────────────────────────────┐
│  Thử Thách & Thành Tựu                  │
├─────────────────────────────────────────┤
│  [Thử Thách]  [Thành Tựu]              │
├─────────────────────────────────────────┤
│                                         │
│  Content Area                           │
│                                         │
└─────────────────────────────────────────┘
```

### Tab 1: Thử Thách (Challenges)

#### Section A: Active Challenges (Thử thách đang tham gia)

- Grid layout (2-3 columns)
- Each card shows:
  - Challenge title & icon
  - Progress bar (current streak / target strike)
  - Days remaining
  - Status badge (active/completed/failed)
  - Quick action button

#### Section B: Available Challenges (Thử thách có sẵn)

- Grid layout
- Each card shows:
  - Challenge title & description
  - Duration (start - end date)
  - Target streak
  - Reward preview
  - "Tham gia" button

#### Design Elements:

- **Colors**: Purple gradient theme
- **Cards**: Glassmorphism with backdrop blur
- **Progress**: Circular or linear progress indicators
- **Icons**: Trophy, flame (streak), calendar
- **Animations**: Hover effects, progress animations

### Tab 2: Thành Tựu (Achievements)

#### Section A: Unlocked Achievements (Đã đạt được)

- Grid layout with achievement badges
- Each badge shows:
  - Badge icon (emoji)
  - Achievement name
  - Tier indicator (bronze/silver/gold/platinum)
  - Points earned
  - Unlock date

#### Section B: Locked Achievements (Chưa đạt được)

- Grayed out badges
- Shows:
  - Silhouette/locked icon
  - Achievement name
  - Criteria to unlock
  - Progress towards unlock (if applicable)

#### Categories Filter:

- All
- Workout 💪
- Nutrition 🥗
- Progress 📈
- Social 👥
- Challenge 🏆

#### Design Elements:

- **Badge Design**: Circular badges with tier colors
  - Bronze: #CD7F32
  - Silver: #C0C0C0
  - Gold: #FFD700
  - Platinum: #E5E4E2
- **Layout**: Masonry or grid
- **Animations**: Badge flip on hover, shine effect
- **Stats**: Total points, completion percentage

## Component Structure

```tsx
<ChallengeAchievementSection>
  <Header>
    <Title>Thử Thách & Thành Tựu</Title>
    <Stats>Points, Level, etc.</Stats>
  </Header>

  <Tabs>
    <Tab active>Thử Thách</Tab>
    <Tab>Thành Tựu</Tab>
  </Tabs>

  {activeTab === 'challenges' ? (
    <ChallengesView>
      <Section title='Đang tham gia'>
        <ChallengeCard />
      </Section>
      <Section title='Có sẵn'>
        <ChallengeCard />
      </Section>
    </ChallengesView>
  ) : (
    <AchievementsView>
      <CategoryFilter />
      <AchievementGrid>
        <AchievementBadge />
      </AchievementGrid>
    </AchievementsView>
  )}
</ChallengeAchievementSection>
```

## Key Features

### Challenges:

1. **Join Challenge**: Modal with challenge details + confirm
2. **Progress Tracking**: Real-time streak counter
3. **Notifications**: Streak reminders, completion alerts
4. **Rewards**: Display on completion

### Achievements:

1. **Badge Collection**: Visual showcase
2. **Progress Indicators**: Show how close to unlock
3. **Sharing**: Share achievements (future)
4. **Leaderboard**: Points ranking (future)

## Color Scheme (Purple Theme)

- Primary: #667eea → #764ba2
- Success: #10b981 (completed)
- Warning: #f59e0b (in progress)
- Danger: #ef4444 (failed)
- Neutral: #64748b

## Next Steps

1. Create ChallengeSection.tsx component
2. Create AchievementSection.tsx component
3. Create API client functions
4. Implement state management
5. Add animations and transitions
