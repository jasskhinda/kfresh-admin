# KFresh Backup & Restore Guide

## 🔒 What We CAN Restore from Supabase

### ✅ **Fully Backed Up (in your backup files)**
1. **Products** - All 373 products with:
   - Names, descriptions, prices
   - Images URLs
   - Stock quantities
   - SKUs, brands, origins
   - All specifications

2. **Categories** - All 30 categories:
   - Names, slugs
   - Active/inactive status
   - Descriptions

3. **Product Variants** - All 7 variants:
   - Size options (Chopped, Sliced, etc.)
   - Variant-specific pricing
   - Stock per variant

4. **Product Images** - Image URLs are saved in product data

### ⚠️ **NOT in Current Backup (but can be backed up)**
1. **User Accounts** - Customer accounts, admin users
2. **Orders** - Customer order history
3. **Reviews/Ratings** - Product reviews
4. **User Profiles** - Customer information
5. **Payment Methods** - Saved payment info

### 🚫 **Cannot Be Restored from Supabase**
1. **Code/Website** - Stored in GitHub, not Supabase
2. **Environment Variables** - Stored in `.env.local` and Vercel
3. **Domain Settings** - Vercel deployment configuration
4. **Third-party Integrations** - Stripe keys, API keys

---

## 📦 Supabase's Built-in Backups

### **What Supabase Backs Up Automatically:**

**Free Plan:** No automatic backups (you're on this)
**Pro Plan ($25/month):**
- Daily backups for 7 days
- Point-in-time recovery for 7 days

**Your Current Situation:**
- You're likely on the FREE plan
- ❌ No automatic Supabase backups
- ✅ But you now have manual backups with our script!

---

## 🛡️ Complete Disaster Recovery Plan

### **Scenario 1: Someone Deletes/Messes Up Products**
**Solution:** ✅ FULLY RECOVERABLE
```bash
node backup-products.js          # Create backup BEFORE changes
# ... person makes changes ...
node restore-products.js backups/product-backup-2025-10-20.json CONFIRM
```
**Recovery Time:** ~5 minutes
**Data Loss:** None (if you backed up first)

---

### **Scenario 2: Supabase Database Goes Down**
**Solution:** ⚠️ PARTIALLY RECOVERABLE
- Your product data is in the backup files
- Can restore to a NEW Supabase project
- Need to recreate database tables first

**Steps:**
1. Create new Supabase project
2. Run database migration scripts (create tables)
3. Restore from backup
4. Update environment variables

**Recovery Time:** ~30-60 minutes
**Data Loss:** Any changes since last backup

---

### **Scenario 3: Entire Vercel Site Goes Down**
**Solution:** ✅ FULLY RECOVERABLE
- Code is in GitHub
- Can redeploy to Vercel in minutes
- Database is separate (Supabase)

**Steps:**
1. Redeploy from GitHub to Vercel
2. Add environment variables
3. Site is back online

**Recovery Time:** ~10-15 minutes
**Data Loss:** None

---

### **Scenario 4: Both GitHub AND Supabase Lost**
**Solution:** ⚠️ REQUIRES LOCAL BACKUP
- Need your local code on your computer
- Need the backup files we just created
- Can rebuild from scratch

**Recovery Time:** ~2-3 hours
**Data Loss:** Depends on backup frequency

---

## 🎯 Recommended Backup Strategy

### **Daily (Automated):**
```bash
# Run this BEFORE your person starts adding products
node backup-products.js
```

### **Weekly (Manual):**
1. Download all backups to external drive/cloud
2. Verify backup files are readable
3. Test restore process (dry run)

### **Before Major Changes:**
1. Run backup script
2. Make changes
3. If something goes wrong → restore

### **Cloud Storage:**
Upload backup files to:
- Google Drive
- Dropbox
- iCloud
- External hard drive

---

## 📝 How to Use the Backup System

### **Create a Backup:**
```bash
cd "/Volumes/C/KF App/kfresh-admin"
node backup-products.js
```
**Output:**
- `backups/product-backup-YYYY-MM-DD.json` - Full data
- `backups/product-backup-YYYY-MM-DD-summary.txt` - Readable list

---

### **Restore from Backup (Dry Run):**
```bash
node restore-products.js backups/product-backup-2025-10-20.json
```
**Shows what WOULD be restored without actually doing it**

---

### **Restore from Backup (Actually Restore):**
```bash
# DANGER: This WILL replace your data!
node restore-products.js backups/product-backup-2025-10-20.json CONFIRM
```

---

## 🚨 Emergency Contacts & Info

### **Supabase Project Info:**
- **Project ID:** `tmufbgaxhtqgkvcngyxg`
- **URL:** `https://tmufbgaxhtqgkvcngyxg.supabase.co`
- **Dashboard:** https://supabase.com/dashboard

### **Vercel Deployment:**
- **Admin:** https://kfresh-admin.vercel.app
- **Store:** https://kfresh-store.vercel.app

### **GitHub Repos:**
- **Admin:** https://github.com/jasskhinda/kfreshadmin
- **Store:** https://github.com/jasskhinda/kfreshstore

---

## ✅ Pre-Hiring Checklist

Before your hired person starts:

- [x] ✅ Complete backup created (product-backup-2025-10-20.json)
- [ ] Download backup to safe location (cloud/external drive)
- [ ] Test restore process (dry run)
- [ ] Document who has access to what
- [ ] Consider upgrading Supabase to Pro ($25/month for auto backups)

---

## 💡 Recommended: Upgrade to Supabase Pro

**Cost:** $25/month

**Benefits:**
- ✅ Automatic daily backups for 7 days
- ✅ Point-in-time recovery
- ✅ Better performance
- ✅ More storage
- ✅ Priority support

**Decision:** Up to you, but with 373 products and hiring help, it might be worth it for peace of mind!

---

## 🎓 Best Practices

1. **Backup BEFORE any major changes**
2. **Keep multiple backup copies** (don't delete old ones)
3. **Store backups in 2+ locations** (computer + cloud)
4. **Test restore occasionally** (dry run mode)
5. **Document all admin credentials** (somewhere safe)
6. **Train your hired person** on the backup system

---

## 📞 Quick Command Reference

```bash
# Create backup
node backup-products.js

# List backups
ls -lh backups/

# Preview restore (safe - doesn't change anything)
node restore-products.js backups/product-backup-2025-10-20.json

# Actual restore (DANGER!)
node restore-products.js backups/product-backup-2025-10-20.json CONFIRM
```

---

**Last Updated:** October 20, 2025
**Backup Location:** `/Volumes/C/KF App/kfresh-admin/backups/`
**Current Backup:** 373 products, 30 categories, 7 variants