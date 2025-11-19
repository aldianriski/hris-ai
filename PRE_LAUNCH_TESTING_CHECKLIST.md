# Pre-Launch Testing Checklist
**Quick Reference Guide**

**Status:** 🟢 Ready to Execute
**Total Tests:** 35 critical tests
**Estimated Time:** 4-6 hours

---

## ✅ Setup Phase (30 minutes)

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] PostgreSQL 15+ running
- [ ] Redis running (or Upstash configured)
- [ ] `.env.local` file created with all variables
- [ ] MFA_ENCRYPTION_KEY generated (64-char hex)
- [ ] Supabase project configured
- [ ] Storage buckets created (documents, payslips, avatars, temp)
- [ ] `npm install` completed without errors
- [ ] Database migrations applied
- [ ] Test data seeded

### Dependency Check
- [ ] React version is 18.2.0 (NOT 19.x)
- [ ] Next.js 15.0.3 installed
- [ ] @heroui or @nextui-org resolved
- [ ] No peer dependency warnings
- [ ] `npm run build` succeeds

---

## 🧪 Phase 1: Component Testing (1 hour)

### Test 7 API-Integrated Components

#### Admin Panel Components
- [ ] **TenantListTable** → Loads tenant list, filters work, no mock data
- [ ] **TenantSupportTab** → Shows real tickets, stats accurate, loading states work
- [ ] **TenantDetailView** → Tenant details load, no mock object used

#### HR Components
- [ ] **EmployeePerformanceHistory** → Real reviews load, average rating calculates, completed reviews only
- [ ] **EmployeePayrollHistory** → Payslips display, currency formatted (Rp), dates correct
- [ ] **EmployeeAttendanceSummary** → Current month data loads, stats accurate, recent 5 records show
- [ ] **EmployeeDocumentsList** → Documents list loads, types correct, verification badge shows

---

## 🎯 Phase 2: Critical User Journeys (2 hours)

### Journey Tests
- [ ] **Journey 1:** Onboard new employee → Employee created, documents uploaded, appears in list
- [ ] **Journey 2:** Process monthly payroll → Period created, salaries calculated, payslips generated
- [ ] **Journey 3:** Leave request & approval → Request submitted, manager approves, status updates
- [ ] **Journey 4:** Performance review → Review created, ratings saved, shows in history component
- [ ] **Journey 5:** Attendance tracking → Clock in/out works, hours calculated, summary updates
- [ ] **Journey 6:** Document upload → File to Supabase Storage (NOT base64), shows in component
- [ ] **Journey 7:** Support tickets → Admin views tickets, stats update, status changes work

---

## 🔒 Phase 3: Security Verification (30 minutes)

### Security Fixes Validation
- [ ] **MFA Encryption** → Secrets encrypted in database, AES-256-GCM working, cannot decrypt without key
- [ ] **OAuth Security** → State validation works, tampered state rejected, valid flow completes
- [ ] **File Upload** → Files in Supabase Storage, no base64 in database, file types validated
- [ ] **Environment Validation** → Missing vars caught, invalid formats rejected, no localhost fallbacks

---

## ⚡ Phase 4: Performance Check (30 minutes)

### Page Load Times
- [ ] Dashboard loads < 3 seconds
- [ ] Employee list < 3 seconds
- [ ] Payroll page < 3 seconds
- [ ] All components load < 2 seconds

### API Response Times
- [ ] GET /api/v1/employees < 500ms
- [ ] GET /api/v1/payroll/payslips < 500ms
- [ ] GET /api/v1/attendance/summary < 500ms
- [ ] GET /api/v1/performance/reviews < 500ms
- [ ] GET /api/platform/tenants < 500ms

---

## 🏗️ Phase 5: Production Build (30 minutes)

### Build Verification
- [ ] `rm -rf .next` to clean build
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No dependency warnings
- [ ] Bundle size reasonable
- [ ] All routes generated

### Local Production Test
- [ ] `npm run start` works
- [ ] Login succeeds
- [ ] Dashboard loads
- [ ] All 7 components work
- [ ] No console errors
- [ ] Forms submit successfully
- [ ] File uploads work

### Environment Variables
- [ ] MFA_ENCRYPTION_KEY set (64-char hex) ✅ CRITICAL
- [ ] NEXT_PUBLIC_APP_URL set (production URL) ✅ CRITICAL
- [ ] DATABASE_URL set (production DB) ✅ CRITICAL
- [ ] SUPABASE_SERVICE_ROLE_KEY set ✅ CRITICAL
- [ ] OPENAI_API_KEY set ⚠️ IMPORTANT
- [ ] UPSTASH_REDIS_REST_URL set ⚠️ IMPORTANT
- [ ] UPSTASH_REDIS_REST_TOKEN set ⚠️ IMPORTANT
- [ ] All optional vars configured as needed

---

## 📋 Final Checks

### Code Quality
- [ ] No console.log in production code
- [ ] No TODO comments in critical paths
- [ ] No mock data visible anywhere
- [ ] All API calls using real endpoints
- [ ] Error boundaries in place
- [ ] Loading states on all data fetches

### Documentation
- [ ] CRITICAL_FIXES_PROGRESS.md updated ✅
- [ ] TESTING_ENVIRONMENT_SETUP.md reviewed ✅
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Environment variables documented

### Database
- [ ] Migrations applied
- [ ] Indexes created
- [ ] RLS policies configured
- [ ] Backup strategy in place
- [ ] Test data NOT in production

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (GA)
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] Alerts configured

---

## 🚀 Launch Readiness

### Go / No-Go Checklist

**MUST HAVE (Blockers)**
- [ ] All 7 components work without errors
- [ ] All security fixes verified
- [ ] Production build succeeds
- [ ] Environment variables configured
- [ ] No mock data visible
- [ ] Critical journeys complete
- [ ] No console errors

**Decision:**
- [ ] ✅ GO - Ready for production launch
- [ ] ⚠️ CONDITIONAL GO - Minor issues, can launch with monitoring
- [ ] ❌ NO-GO - Critical issues found, need fixes

---

## 🐛 Issues Found

**Critical Issues (Blockers):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**High Priority (Should fix before launch):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**Medium Priority (Can fix post-launch):**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

**Low Priority (Sprint 2):**
1. Timeline API implementation (documented)
2. Recognition Wall API implementation (documented)
3. @ts-ignore technical debt fixes

---

## 📝 Test Execution Notes

**Tester:** ___________________
**Date:** ___________________
**Environment:** Development / Staging / Production
**Build:** ___________________

**Overall Status:** Pass / Fail / Conditional Pass

**Recommendation:**
___________________________________________
___________________________________________
___________________________________________

**Next Steps:**
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

## 📞 Escalation Contacts

**Critical Blockers:**
- Development Team Lead
- Product Manager

**Security Issues:**
- Security Team
- Infrastructure Team

**Performance Issues:**
- DevOps Team
- Database Administrator

---

**Document Version:** 1.0
**Last Updated:** November 19, 2025
**Full Guide:** See `TESTING_ENVIRONMENT_SETUP.md`
