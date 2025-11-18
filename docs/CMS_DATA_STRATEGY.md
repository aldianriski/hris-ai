# CMS & Data Management Strategy

**Version:** 1.0
**Last Updated:** November 18, 2025
**Owner:** Technical Team

---

## 📋 Overview

This document outlines the Content Management System (CMS) architecture and data management strategy for Talixa HRIS, covering both marketing website content and application data.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TALIXA HRIS ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Marketing Site  │         │  Application     │         │
│  │  (talixa.com)    │         │  (app.talixa.com)│         │
│  │                  │         │                  │         │
│  │  Next.js + CMS   │         │  Next.js + DB    │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                    │
│           ├────────────────────────────┤                    │
│           │                            │                    │
│  ┌────────▼────────┐         ┌────────▼─────────┐         │
│  │  Sanity CMS     │         │  Supabase DB     │         │
│  │  (Content)      │         │  (User Data)     │         │
│  └─────────────────┘         └──────────────────┘         │
│                                                              │
│  ┌───────────────────────────────────────────────┐         │
│  │  Supabase Storage (Media & Documents)         │         │
│  └───────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Marketing Content Management (Sanity CMS)

### Why Sanity?

**Advantages:**
- ✅ Headless architecture (API-first)
- ✅ Real-time collaboration
- ✅ Powerful query language (GROQ)
- ✅ Built-in image optimization
- ✅ Multi-language support
- ✅ Version history
- ✅ Custom preview URLs
- ✅ Free tier: Generous for startups

**Alternative Considered:**
- Contentful (more expensive)
- Strapi (self-hosted, more maintenance)
- WordPress (traditional, but works)

### Content Schema

**1. Blog Posts**
```javascript
// schemas/blogPost.js
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().max(80)
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}]
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}]
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().max(200)
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent' // Rich text editor
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo'
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          {title: 'Indonesian', value: 'id'},
          {title: 'English', value: 'en'}
        ]
      },
      initialValue: 'id'
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    }
  }
}
```

**2. Case Studies**
```javascript
// schemas/caseStudy.js
export default {
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    {
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'companyName'
      }
    },
    {
      name: 'logo',
      title: 'Company Logo',
      type: 'image'
    },
    {
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        list: [
          'Technology',
          'Retail',
          'Manufacturing',
          'Services',
          'Healthcare',
          'Education'
        ]
      }
    },
    {
      name: 'employeeCount',
      title: 'Employee Count',
      type: 'number'
    },
    {
      name: 'challenge',
      title: 'Challenge',
      type: 'blockContent'
    },
    {
      name: 'solution',
      title: 'Solution',
      type: 'blockContent'
    },
    {
      name: 'results',
      title: 'Results',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'metric', type: 'string', title: 'Metric'},
          {name: 'value', type: 'string', title: 'Value'},
          {name: 'description', type: 'text', title: 'Description'}
        ]
      }]
    },
    {
      name: 'testimonial',
      title: 'Testimonial',
      type: 'object',
      fields: [
        {name: 'quote', type: 'text'},
        {name: 'author', type: 'string'},
        {name: 'role', type: 'string'},
        {name: 'avatar', type: 'image'}
      ]
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image'
    }
  ]
}
```

**3. Landing Pages**
```javascript
// schemas/landingPage.js
export default {
  name: 'landingPage',
  title: 'Landing Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Page Title',
      type: 'string'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title'
      }
    },
    {
      name: 'sections',
      title: 'Page Sections',
      type: 'array',
      of: [
        {type: 'heroSection'},
        {type: 'featuresSection'},
        {type: 'pricingSection'},
        {type: 'testimonialsSection'},
        {type: 'ctaSection'}
      ]
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo'
    }
  ]
}
```

### Content Workflow

```
Content Creation Flow:

1. Draft → 2. Review → 3. Approve → 4. Schedule → 5. Publish

┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Writer  │──▶│ Editor   │──▶│  SEO     │──▶│ Schedule │──▶│ Publish  │
│  Creates │   │ Reviews  │   │  Reviews │   │ (Sanity) │   │ (Auto)   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

**Roles & Permissions:**
- **Administrator:** Full access
- **Editor:** Create, edit, publish
- **Writer:** Create, edit (no publish)
- **Reviewer:** View, comment

---

## 💾 Application Data Management (Supabase)

### Database Structure

**Core Tables:**

```sql
-- Already implemented:
✓ employers (companies)
✓ employees
✓ attendance_records
✓ leave_requests
✓ leave_balances
✓ payroll_periods
✓ payroll_items
✓ performance_reviews
✓ documents
✓ integrations

-- New for website:
+ cms_blog_posts (if not using Sanity)
+ cms_case_studies
+ leads
+ demo_requests
+ web_analytics
```

### Data Migration Strategy

**Scenario: Customer wants to import existing HR data**

**Step 1: Data Template**
```csv
# employee_import_template.csv
employee_number,first_name,last_name,email,phone,date_of_birth,gender,department,position,join_date,employment_type,salary
EMP001,John,Doe,john@example.com,+628123456789,1990-01-01,male,Engineering,Software Engineer,2023-01-01,permanent,15000000
```

**Step 2: Validation**
- Check for duplicate employee numbers
- Validate email formats
- Verify date formats
- Check required fields

**Step 3: Import Process**
```typescript
// src/lib/import/employee.ts
export async function importEmployees(
  csvData: string,
  companyId: string
): Promise<ImportResult> {
  const records = parseCSV(csvData);
  const validationResults = validateRecords(records);

  if (validationResults.errors.length > 0) {
    return {
      success: false,
      errors: validationResults.errors
    };
  }

  // Batch insert with transaction
  const { data, error } = await supabase
    .from('employees')
    .insert(records.map(r => ({
      employer_id: companyId,
      employee_number: r.employee_number,
      first_name: r.first_name,
      last_name: r.last_name,
      // ... map all fields
    })));

  return {
    success: !error,
    imported: data?.length || 0,
    errors: error ? [error.message] : []
  };
}
```

### Data Export Strategy

**Scenario: Customer wants to export HR data**

**Export Formats:**
1. CSV (most common)
2. Excel (with formatting)
3. PDF (for reports)
4. JSON (for API integrations)

**Example:**
```typescript
// src/lib/export/employee.ts
export async function exportEmployees(
  companyId: string,
  format: 'csv' | 'xlsx' | 'pdf'
): Promise<Blob> {
  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('employer_id', companyId);

  if (format === 'csv') {
    return generateCSV(employees);
  } else if (format === 'xlsx') {
    return generateExcel(employees);
  } else {
    return generatePDF(employees);
  }
}
```

### Data Retention Policy

**Active Data:**
- Keep in primary database
- Fast access
- Full search capabilities

**Archived Data (>2 years):**
- Move to cold storage
- Slower access
- Compliance requirement

**Deleted Data:**
- Soft delete (mark as deleted)
- Keep for 30 days
- Hard delete after 30 days

```sql
-- Soft delete example
UPDATE employees
SET
  deleted_at = NOW(),
  status = 'deleted'
WHERE id = $1;

-- Hard delete (after 30 days)
DELETE FROM employees
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

---

## 🔄 Data Synchronization

### Real-Time Sync (Supabase Realtime)

**Already Implemented:**
- Attendance updates
- Leave approvals
- Employee changes
- Dashboard metrics

**Impact:**
- Reduced polling
- Lower database load
- Better UX (instant updates)
- No additional cost

### Offline-First Strategy (PWA)

**Service Worker Cache:**
```javascript
// Cache employee list for offline access
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/v1/employees')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('employees-v1').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

**Offline Queue:**
```typescript
// Queue actions when offline
const offlineQueue = {
  async add(action: Action) {
    const queue = await getQueue();
    queue.push(action);
    await saveQueue(queue);
  },

  async sync() {
    const queue = await getQueue();
    for (const action of queue) {
      try {
        await executeAction(action);
        await removeFromQueue(action.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
};
```

---

## 📊 Analytics & Tracking

### Website Analytics (Google Analytics 4)

**Events to Track:**
1. **Page Views:**
   - Homepage
   - Features pages
   - Pricing page
   - Blog posts

2. **User Actions:**
   - CTA clicks ("Start Trial")
   - Demo requests
   - Form submissions
   - Video plays

3. **Conversions:**
   - Trial signups
   - Demo bookings
   - Newsletter subscriptions

**Implementation:**
```typescript
// src/lib/analytics/gtag.ts
export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

### Application Analytics (Mixpanel/Amplitude)

**Events to Track:**
1. **User Actions:**
   - Login/Logout
   - Feature usage
   - Settings changes
   - Report generation

2. **Business Metrics:**
   - Active users (DAU/MAU)
   - Feature adoption
   - Time to complete tasks
   - Error rates

3. **Product Analytics:**
   - Most used features
   - User journeys
   - Drop-off points
   - A/B test results

---

## 🔒 Data Security & Compliance

### Data Classification

**Level 1 - Public:**
- Marketing content
- Blog posts
- Public documentation
- **Storage:** Sanity CMS
- **Access:** Anyone

**Level 2 - Internal:**
- Company settings
- Department structure
- Job positions
- **Storage:** Supabase (RLS)
- **Access:** Company employees

**Level 3 - Confidential:**
- Employee personal data
- Salary information
- Performance reviews
- **Storage:** Supabase (Encrypted)
- **Access:** HR + Manager

**Level 4 - Restricted:**
- Bank account details
- Tax information
- Medical records
- **Storage:** Supabase (Encrypted + Audit)
- **Access:** HR Admin only

### Compliance Requirements

**Indonesian Laws:**
- UU ITE (Electronic Information and Transactions)
- UU Perlindungan Data Pribadi (PDP) - Personal Data Protection
- UU Ketenagakerjaan (Labor Law)

**International Standards:**
- GDPR (for EU customers)
- SOC 2 Type II
- ISO 27001

**Implementation:**

```sql
-- Audit log for sensitive data access
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- view, create, update, delete
  resource_type TEXT NOT NULL, -- employee, payroll, etc.
  resource_id UUID NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for automatic logging
CREATE TRIGGER audit_employee_changes
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

### Data Encryption

**At Rest:**
- Database: Supabase encryption (AES-256)
- Files: Encrypted before upload
- Backups: Encrypted snapshots

**In Transit:**
- HTTPS/TLS 1.3
- API calls encrypted
- WebSocket connections encrypted

**Application-Level Encryption:**
```typescript
// Encrypt sensitive fields before storing
import { encrypt, decrypt } from '@/lib/crypto';

async function createEmployee(data: EmployeeData) {
  const encrypted = {
    ...data,
    tax_id: encrypt(data.tax_id),
    bank_account: encrypt(data.bank_account),
    national_id: encrypt(data.national_id),
  };

  return await supabase
    .from('employees')
    .insert(encrypted);
}
```

---

## 💰 Cost Impact Analysis

### CMS Costs (Sanity)

**Free Tier:**
- 3 users
- 10,000 documents
- 5GB assets
- **Cost:** $0/month

**Growth Tier (Recommended):**
- Unlimited users
- Unlimited documents
- 50GB assets
- **Cost:** $99/month

### Database Costs (Supabase)

**Current Usage (100 companies, 5000 employees):**
- Database size: ~2GB
- Storage: ~10GB
- Bandwidth: ~50GB/month
- **Cost:** $25/month (Pro plan)

**Projected (1000 companies, 50,000 employees):**
- Database size: ~20GB
- Storage: ~100GB
- Bandwidth: ~500GB/month
- **Cost:** $125/month (Team plan)

### Total Infrastructure Costs

**Year 1 (Startup):**
- Supabase: $25/month
- Sanity: $99/month
- Vercel: $20/month (Pro)
- Upstash Redis: $10/month
- Sentry: $26/month
- **Total:** ~$180/month

**Year 2 (Growth):**
- Supabase: $125/month
- Sanity: $99/month
- Vercel: $150/month (Team)
- Upstash Redis: $80/month
- Sentry: $89/month
- **Total:** ~$543/month

---

## 🚀 Migration Plan

### Phase 1: Setup (Week 1)
- [ ] Create Sanity project
- [ ] Define content schemas
- [ ] Set up local development
- [ ] Configure preview URLs
- [ ] Set up CI/CD for CMS

### Phase 2: Migration (Week 2)
- [ ] Create blog post templates
- [ ] Migrate existing content (if any)
- [ ] Set up image optimization
- [ ] Configure multi-language
- [ ] Test preview functionality

### Phase 3: Integration (Week 3)
- [ ] Build Next.js pages with Sanity
- [ ] Set up ISR (Incremental Static Regeneration)
- [ ] Configure webhooks for auto-rebuild
- [ ] Test real-time updates
- [ ] Performance optimization

### Phase 4: Launch (Week 4)
- [ ] Content team training
- [ ] Publish initial content
- [ ] Monitor performance
- [ ] Gather feedback
- [ ] Iterate

---

## 📈 Success Metrics

**Content Metrics:**
- Content creation time: < 30 min per post
- Time to publish: < 5 min
- Content team satisfaction: > 4.5/5

**Performance Metrics:**
- Page load time: < 2s
- Time to Interactive: < 3s
- CMS query time: < 200ms
- API response time: < 100ms

**Business Metrics:**
- Content publish rate: 2-3 posts/week
- Organic traffic growth: +20% MoM
- Lead generation: 100+ leads/month

---

## 🔧 Maintenance & Operations

**Daily:**
- Monitor CMS uptime
- Check error logs
- Review analytics

**Weekly:**
- Backup content
- Review performance metrics
- Update content calendar
- Clear cache if needed

**Monthly:**
- Review storage usage
- Analyze content performance
- Update SEO strategy
- Plan content for next month

**Quarterly:**
- CMS security updates
- Review and optimize costs
- Evaluate new features
- Team training sessions

---

## 📞 Support & Resources

**Sanity:**
- Documentation: https://www.sanity.io/docs
- Community: https://slack.sanity.io
- Support: support@sanity.io

**Supabase:**
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Support: support@supabase.io

**Internal:**
- CMS Admin: cms.talixa.com
- Database Studio: db.talixa.com
- API Docs: docs.talixa.com/api

---

**Document Status:** APPROVED
**Next Review:** January 2026
**Prepared by:** Technical Team
