# Aeduca Server Refactoring Guide

## Overview
This guide documents the complete refactoring of the Aeduca server from a hybrid MongoDB/PostgreSQL architecture to a pure PostgreSQL implementation with clean code architecture.

## Major Changes

### 1. Database Migration
- **Removed**: MongoDB dependency for posts, comments, messages, and rooms
- **Added**: PostgreSQL tables for `post` and `comment` with proper relationships
- **Removed**: Message feature (to be implemented in future version)
- **Migration File**: `migrations/001_posts_comments.sql`

### 2. File Management System Fix
- **Problem**: Files were being stored in database but not created on filesystem
- **Solution**: Complete rewrite of `FileCore` with proper directory creation
- **New File**: `src/core/FileCoreNew.ts`
- **Features**:
  - Automatic user directory creation
  - Proper path validation to prevent directory traversal
  - Async/await architecture
  - Better error handling
  - Storage usage calculation

### 3. Clean Architecture Implementation

#### Models (Objection.js)
- `src/model/PostModel.ts` - Posts with full relationship support
- `src/model/CommentModel.ts` - Comments with nested replies

#### Services (Business Logic)
- `src/services/PostServiceNew.ts` - Complete post management
- `src/services/CommentServiceNew.ts` - Comment and reply management

#### Handlers (Controllers)
- `src/handler/PostHandlerNew.ts` - RESTful post endpoints
- `src/handler/CommentHandlerNew.ts` - RESTful comment endpoints
- `src/handler/FileHandlerNew.ts` - Improved file management

#### Routes
- `src/routes/post-new.ts` - Clean post routing
- `src/routes/comment-new.ts` - Clean comment routing
- `src/routes/file-new.ts` - Clean file routing

### 4. Removed Components
- MongoDB connection (`MongoConection.ts`)
- Message model, service, handler, and routes
- Room model, service, handler, and routes
- All MongoDB-related decorators and utilities

## Implementation Steps

### Step 1: Backup Current System
```bash
# Backup database
pg_dump -U your_user -d aeduca > backup_$(date +%Y%m%d).sql

# Backup files
tar -czf drive_backup_$(date +%Y%m%d).tar.gz ../drive
```

### Step 2: Apply Database Migration
```bash
# Run the migration
psql -U your_user -d aeduca < migrations/001_posts_comments.sql
```

### Step 3: Update Dependencies
```bash
# Remove old package.json and use new one
mv package.json package-old.json
mv package-new.json package.json

# Install dependencies
npm install

# Remove MongoDB from node_modules
```

### Step 4: Replace Files

Replace the following files with their new versions:
- `index.ts` → `index-new.ts`
- `src/routes/index.ts` → `src/routes/index-new.ts`
- `src/routes/post.ts` → `src/routes/post-new.ts`
- `src/routes/comment.ts` → `src/routes/comment-new.ts`
- `src/routes/file.ts` → `src/routes/file-new.ts`
- `src/handler/PostHandler.ts` → `src/handler/PostHandlerNew.ts`
- `src/handler/CommentHandler.ts` → `src/handler/CommentHandlerNew.ts`
- `src/handler/FileHandler.ts` → `src/handler/FileHandlerNew.ts`
- `src/core/FileCore.ts` → `src/core/FileCoreNew.ts`

### Step 5: Remove Obsolete Files
```bash
# Remove MongoDB-related files
rm src/con/MongoConection.ts
rm src/model/Message.ts
rm src/model/Room.ts
rm src/model/Post.ts
rm src/model/Comment.ts
rm src/handler/MessageHandler.ts
rm src/handler/RoomHandler.ts
rm src/services/MessageService.ts
rm src/services/RoomService.ts
rm src/routes/message.ts
rm src/routes/room.ts
```
# NO, I DECIDED TO RENAME ALL files witn NEW to the original name for consistency. please

### Step 6: Environment Variables
Update `.env` file:
```env
# Ensure STORAGE path exists
STORAGE=../drive
```

### Step 7: Create Drive Directory
```bash
# Ensure drive directory exists
mkdir -p ../drive
chmod 755 ../drive
```

## API Endpoints - No Breaking Changes

All existing endpoints remain the same to ensure frontend compatibility:

### Posts
- `GET /api/v1/post/feed` - Get user feed
- `POST /api/v1/post` - Create post
- `PUT /api/v1/post/:id` - Update post
- `DELETE /api/v1/post/:id` - Delete post
- `POST /api/v1/post/:id/like` - Toggle like
- `POST /api/v1/post/:id/save` - Toggle save

### Comments
- `GET /api/v1/comment/post/:postId` - Get post comments
- `POST /api/v1/comment` - Create comment
- `POST /api/v1/comment/:id/reply` - Reply to comment
- `PUT /api/v1/comment/:id` - Update comment
- `DELETE /api/v1/comment/:id` - Delete comment

### Files
- `POST /api/v1/file/upload` - Upload file (FIXED)
- `POST /api/v1/file/directory` - Create directory (FIXED)
- `GET /api/v1/file/:code` - Get file info
- `PUT /api/v1/file/update` - Rename/move file
- `DELETE /api/v1/file/:code` - Delete file
- `GET /api/v1/file/download/:code` - Download file

## Testing

### Test File Upload (FIXED)
```bash
# Create directory
curl -X POST http://localhost:3000/api/v1/file/directory \
  -H "Authorization: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dni": "70123456",
    "name": "test_folder",
    "parent_path": null
  }'

# Upload file
curl -X POST http://localhost:3000/api/v1/file/upload \
  -H "Authorization: YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F 'data={"dni":"70123456","name":"test.pdf","parent_path":null}'
```

### Test Posts
```bash
# Create post
curl -X POST http://localhost:3000/api/v1/post \
  -H "Authorization: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post",
    "share_with": ["all"],
    "commentable": true
  }'
```

## Performance Improvements

1. **Database Queries**: Optimized with proper indexes
2. **File Operations**: Async/await instead of callbacks
3. **Memory Usage**: Removed MongoDB connection overhead
4. **Error Handling**: Consistent error responses
5. **Code Organization**: Clean separation of concerns

## Monitoring

Monitor these metrics after deployment:
- API response times
- Database query performance
- File upload/download success rates
- Storage usage per user
- Error rates

## Rollback Plan

If issues arise:
1. Restore database: `psql -U user -d aeduca < backup_YYYYMMDD.sql`
2. Restore files: `tar -xzf drive_backup_YYYYMMDD.tar.gz`
3. Revert code: `git checkout main`

## Future Enhancements

1. **Message System**: Implement real-time messaging with PostgreSQL
2. **File Thumbnails**: Generate thumbnails for images
3. **File Versioning**: Track file versions
4. **Bulk Operations**: Bulk file upload/download
5. **Storage Quotas**: Implement per-user storage limits
6. **CDN Integration**: Serve files through CDN
7. **Search Enhancement**: Full-text search for posts and files

## Support

For issues or questions about this refactoring:
1. Check error logs in `logs/` directory
2. Verify database migrations completed
3. Ensure file permissions are correct
4. Check that all environment variables are set

---

**Version**: 4.0.0
**Date**: 2025-01-17
**Author**: Aeduca Development Team
