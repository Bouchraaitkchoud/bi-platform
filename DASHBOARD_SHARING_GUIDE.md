# Dashboard Sharing Feature - Implementation Guide

## 🎯 Overview

Your BI Platform now has a **complete dashboard sharing system** with:
- ✅ Email-based sharing with autocomplete
- ✅ Three permission levels: Viewer, Commenter, Editor  
- ✅ Email notifications when dashboards are shared
- ✅ "Shared with Me" page to view received dashboards
- ✅ Share management (add/remove users)

---

## 🚀 How to Use

### **1. Share a Dashboard**

Navigate to any dashboard you've created:

1. Click the **Share button** (📤) in the top toolbar
2. A share modal opens
3. **Type the email** of the person you want to share with
   - Autocomplete suggestions appear as you type
   - Select a suggestion or enter a full email
4. **Choose permission level:**
   - 👁️ **Viewer** - Can view dashboard and charts only
   - 💬 **Commenter** - Can view and add comments (future feature)
   - ✏️ **Editor** - Can view, modify, and edit dashboard
5. Click **"Share Dashboard"** button
6. Email notification is sent automatically ✉️

### **2. View Shared Users**

In the same Share Modal:
- See list of users you've shared with
- View their permission level
- Remove access by clicking the trash icon

### **3. View Dashboards Shared with You**

1. Go to **Sidebar → "Shared with Me"**
2. See all dashboards shared with you
3. Permission badges show your access level
4. Click to view the dashboard

---

## 🔧 Technical Architecture

### **Frontend Components**

#### **ShareModal** (`/components/ui/ShareModal.tsx`)
- Email search with autocomplete (calls user search API)
- Permission selector (Viewer/Editor/Commenter)
- List of shared users
- Add/remove sharing functionality

**Usage in Dashboard:**
```tsx
<ShareModal
  isOpen={isShareModalOpen}
  onClose={() => setIsShareModalOpen(false)}
  dashboardId={dashboardId}
  dashboardName={dashboard?.name}
/>
```

#### **Shared with Me Page** (`/app/shared/page.tsx`)
- Lists all dashboards shared with current user
- Shows owner, permission level, and share date
- Quick stats (total shared, can edit)
- Links to view each dashboard

### **Backend API Endpoints**

#### **1. User Search** (for autocomplete)
```
GET /api/v1/users/search?q={email}
```
- Searches users by email or name
- Returns: `[{ id, email, full_name }, ...]`
- Excludes self and already-shared users

#### **2. Create/Get Shares**
```
POST /api/v1/shares - Create new share
GET /api/v1/shares - List shares you own
GET /api/v1/shares?shared_with_me=true - List shares for you
DELETE /api/v1/shares/{share_id} - Remove share
```

#### **3. Share Model**
Fields:
- `id` - Unique share ID
- `dashboard_id` - Dashboard being shared
- `owner_id` - Person sharing the dashboard
- `shared_with_email` - Recipient email
- `permission_type` - viewer | commenter | editor
- `expires_at` - Optional expiration date

### **Email Notifications**

**Service:** `NotificationService` (`/services/notification_service.py`)

**Triggered when:** Dashboard is shared with a user

**Email includes:**
- Dashboard name
- Owner name  
- Permission level
- Link to view dashboard

**Configuration (in `.env`):**
```
SMTP_SERVER=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@biplatform.com
SMTP_TLS=true
```

---

## 📋 Permission Levels Explained

| Level | View | Edit | Comments | Share |
|-------|------|------|----------|-------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Commenter** | ✅ | ❌ | ✅ | ❌ |
| **Editor** | ✅ | ✅ | ✅ | ❌ |
| **Owner** | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Security Considerations

1. **Permission Verification**
   - Cannot share another user's dashboard
   - Can only modify shares you created
   - API validates ownership

2. **Email Validation**
   - Must be valid email format
   - User must exist in system
   - Excluded from search: self, already shared

3. **Access Control**
   - Viewers cannot edit
   - Only editors+ can make changes
   - Owners have full control

---

## 🎛️ Configuration

### **Environment Variables** (add to `.env`)

```bash
# Email Configuration (Optional - sharing works without this, just no emails)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@yourcompany.com
SMTP_TLS=true
```

### **Frontend Configuration**

ShareModal settings can be customized in `/components/ui/ShareModal.tsx`:
- Permission levels
- Success messages
- Error handling
- Search debounce time (300ms)

---

## 🚧 Future Enhancements (Phase 2)

- 🔗 Shareable links (for external users)
- ⏰ Expiration dates on shares
- 📊 Share analytics (who viewed what)
- 💬 Real-time comments/feedback
- 🔔 Email digests of dashboard updates
- 🌍 Public dashboards
- 📅 Scheduled report delivery

---

## ✅ Testing the Feature

### **Manual Testing Steps**

1. **Create a dashboard**
   - Go to Dashboards → Create Dashboard
   - Select some charts, save

2. **Share it**
   - Click Share button
   - Search for another test user's email
   - Select Viewer permission
   - Click Share

3. **Check email** (if SMTP configured)
   - Check recipient inbox
   - Click "View Dashboard" link

4. **View as recipient**
   - Log in as the other user
   - Go to Shared with Me
   - Should see the dashboard
   - Try to edit (should be blocked if Viewer)

5. **Modify sharing**
   - Return to dashboard
   - Click Share again
   - Change permission to Editor
   - Remove access

---

## 🐛 Troubleshooting

### **Cannot find user when sharing**
- Check user email is correct
- User must exist in system
- Exclude self from search

### **Email not sending**
- SMTP settings not configured in `.env`
- Check email service credentials
- Check SMTP port (usually 587 or 465)
- Sharing works without email, just won't notify

### **"Shared with Me" page empty**
- No dashboards have been shared with you yet
- Check with dashboard owners to share with you
- Verify you're logged in with correct account

---

## 📚 Related Pages

- Dashboard Viewer: `/dashboards/[id]`
- Dashboard List: `/dashboards`
- Shared with Me: `/shared`
- Dashboard Editor: `/dashboards/[id]/edit`

---

**Need help?** Check the API documentation at `http://localhost:8000/docs` when backend is running.
