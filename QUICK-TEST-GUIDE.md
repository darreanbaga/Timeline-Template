# Quick Test Guide - Verify All Fixes

**Time Required:** 10 minutes
**Goal:** Verify all critical fixes work correctly

---

## 🔥 Critical Security Tests (Must Do)

### Test 1: XSS Protection (30 seconds)
1. Open the HTML file
2. Click "Add Initiative"
3. Enter name: `<script>alert('xss')</script>`
4. Save and verify name displays as plain text (no alert popup)
5. ✅ **PASS** if text shows literally, **FAIL** if alert appears

### Test 2: Date Validation (20 seconds)
1. Click "Add Initiative"
2. Set start date: 2025-06-01
3. Set end date: 2025-03-01 (BEFORE start date)
4. Click "Save Initiative"
5. ✅ **PASS** if alert says "End date must be after start date"

### Test 3: Milestone Limit (30 seconds)
1. Click "Add Initiative"
2. Click "Add Milestone" 20 times
3. Try to click it a 21st time
4. ✅ **PASS** if alert says "Maximum 20 milestones per initiative"

---

## 🛡️ Data Protection Tests (Must Do)

### Test 4: Swim Lane Protection (20 seconds)
1. Click "Manage Swim Lanes"
2. Delete swim lanes until only 1 remains
3. Try to delete the last one
4. ✅ **PASS** if alert says "Cannot delete the last swim lane"

### Test 5: Import Validation (40 seconds)
1. Create a text file called `test.txt` with content: `not valid json`
2. Click "Import JSON"
3. Select the .txt file
4. ✅ **PASS** if alert says "Please select a JSON file"
5. Try again with a .json file containing `{}`
6. ✅ **PASS** if alert says "Invalid file format"

---

## 🎨 Visual Quality Tests (Quick Check)

### Test 6: Minimum Width (30 seconds)
1. Set timeline to "2 Years"
2. Add initiative spanning just 1 day
3. ✅ **PASS** if bar is still visible (not a thin line)

### Test 7: Text Truncation in PNG (40 seconds)
1. Add initiative with very long name (100+ characters)
2. Click "Export PNG"
3. Open the PNG file
4. ✅ **PASS** if long name shows "..." truncation

### Test 8: Filename Sanitization (30 seconds)
1. Change title to: `Test/Title<>Invalid`
2. Click "Export PNG"
3. ✅ **PASS** if file downloads successfully (filename sanitized)

---

## 🚀 UX Improvements Tests (Nice to Check)

### Test 9: ESC Key (10 seconds)
1. Click "Add Initiative"
2. Press ESC key
3. ✅ **PASS** if modal closes

### Test 10: Click Outside Modal (10 seconds)
1. Click "Add Initiative"
2. Click on the dark area outside the modal
3. ✅ **PASS** if modal closes

---

## 📊 Quick Results Checklist

Check off each test as you complete it:

- [ ] Test 1: XSS Protection
- [ ] Test 2: Date Validation
- [ ] Test 3: Milestone Limit
- [ ] Test 4: Swim Lane Protection
- [ ] Test 5: Import Validation
- [ ] Test 6: Minimum Width
- [ ] Test 7: Text Truncation
- [ ] Test 8: Filename Sanitization
- [ ] Test 9: ESC Key
- [ ] Test 10: Click Outside Modal

**Target:** 10/10 tests passing

---

## 🐛 If You Find Issues

If any test fails:

1. Check browser console for errors (F12)
2. Note which test failed
3. Check if you're using Chrome/Edge (recommended)
4. Try refreshing the page and testing again
5. If still fails, issue may need investigation

---

## ✅ Success Criteria

**All critical tests (1-5) MUST pass** - These protect against security issues and data loss.

**Visual tests (6-8) should pass** - These ensure quality exports.

**UX tests (9-10) are nice-to-have** - These improve user experience.

---

## 📝 Full Testing

For comprehensive testing, see:
- `TEST-PLAN-NORMAL.md` - 88 normal user scenarios
- `TEST-PLAN-ADVERSARIAL.md` - 91 edge case scenarios
- `TEST-RESULTS.md` - Detailed findings and fixes
- `TESTING-SUMMARY.md` - Complete overview

---

**Estimated Time:** 5-10 minutes for all critical tests
**Difficulty:** Easy - just click and observe
**Browser:** Chrome or Edge recommended
