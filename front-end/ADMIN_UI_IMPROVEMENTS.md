# Admin UI Improvements - SVG Icons & Tab Names

## 1. SVG Icons for Post Management

### Upvote Icon

```tsx
<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M18 15l-6-6-6 6' />
</svg>
```

### Downvote Icon

```tsx
<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M6 9l6 6 6-6' />
</svg>
```

### View/Eye Icon

```tsx
<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
  <circle cx='12' cy='12' r='3' />
</svg>
```

### Hide/Eye-Off Icon

```tsx
<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
  <line x1='1' y1='1' x2='23' y2='23' />
</svg>
```

### Show/Eye Icon (same as View)

### Delete/Trash Icon

```tsx
<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <polyline points='3 6 5 6 21 6' />
  <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
</svg>
```

## 2. Tab Names (Remove "Quản lý")

### Before:

- Quản lý Bài Đăng
- Quản lý Người Dùng
- Quản lý Thông Báo

### After:

- Bài Đăng
- Người Dùng
- Thông Báo

## 3. Tab Icons

### Posts Icon

```tsx
<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
  <polyline points='14 2 14 8 20 8' />
  <line x1='16' y1='13' x2='8' y2='13' />
  <line x1='16' y1='17' x2='8' y2='17' />
  <polyline points='10 9 9 9 8 9' />
</svg>
```

### Users Icon

```tsx
<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
  <circle cx='9' cy='7' r='4' />
  <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
  <path d='M16 3.13a4 4 0 0 1 0 7.75' />
</svg>
```

### Notifications Icon

```tsx
<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
  <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
  <path d='M13.73 21a2 2 0 0 1-3.46 0' />
</svg>
```

## 4. Admin Header Changes

### Before:

```tsx
<div>
  <button>Đăng ký</button>
  <button>Đăng nhập</button>
</div>
```

### After:

```tsx
<div className='admin-welcome'>
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
  <span>Xin chào, {username}</span>
</div>
```

## Implementation Files

1. `PostManagement.tsx` - Add SVG icons to buttons and stats
2. `AdminLayout.tsx` or `AdminDashboard.tsx` - Update tab names and add icons
3. `Header.tsx` - Change admin greeting, remove signup button

## CSS Updates

```css
.btn-view svg,
.btn-success svg,
.btn-warning svg,
.btn-delete svg {
  margin-right: 0.5rem;
}

.admin-welcome {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #333;
}

.admin-welcome svg {
  color: #4caf50;
}
```
