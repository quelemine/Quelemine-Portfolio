# Admin Panel Setup Guide

## Initial Setup

1. **Create Environment File**
   - Copy `.env.example` to `.env.local` (if it exists)
   - Or create a new `.env.local` file in the root directory

2. **Set Admin Password**
   ```env
   ADMIN_PASSWORD=your_secure_admin_password_here
   ```

3. **Initialize Admin Settings**
   - The admin panel uses `data/adminSettings.json` for storage
   - This file is automatically created if it doesn't exist
   - This file is in `.gitignore` to prevent pushing sensitive data

## Security Notes

- **Never commit** `.env.local` or any `.env` file with real credentials
- **Never commit** `data/adminSettings.json` (contains password and sensitive data)
- Use strong passwords for the admin panel
- The admin panel is currently protected by a single password

## File Structure

```
queleminetech/
├── .env.local              # Your environment variables (not committed)
├── .env.example            # Example environment file (not committed)
├── data/
│   ├── adminSettings.json  # Admin settings storage (not committed)
│   └── adminSettings.example.json  # Example settings (committed)
├── public/
│   └── uploads/            # User uploaded files (not committed)
└── app/
    └── admin/
        └── page.tsx        # Admin panel UI
```

## First Time Use

1. Set your `ADMIN_PASSWORD` in `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to `/admin`
4. Enter your admin password
5. The admin panel will initialize with default settings

## Features

- **Profile Management**: Update personal info, upload profile image
- **CV Management**: Upload and manage your CV/resume
- **Password Management**: Change admin password
- **Projects**: Add, edit, delete projects with "finished" status
- **Education**: Manage education entries with "completed" vs "in progress" status
- **Colors**: Customize website color scheme
- **Content**: Edit all website text content

## Backup and Restore

To backup your admin settings:
```bash
cp data/adminSettings.json data/adminSettings.backup.json
```

To restore:
```bash
cp data/adminSettings.backup.json data/adminSettings.json
```

## Deployment

For production deployment:
1. Set environment variables in your hosting platform
2. Ensure `data/adminSettings.json` is deployed securely
3. Consider using a database for production instead of JSON files
4. Implement additional security measures (rate limiting, CSRF protection, etc.)