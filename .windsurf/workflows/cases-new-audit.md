# /cases/new AUDIT REPORT - AI AGENT OPTIMIZED

**File:** `src/app/(app)/cases/new/page.tsx`  
**Lines:** 436  
**Last Analyzed:** 2026-04-18

---

## CRITICAL (Fix Immediately)

### C001 - Render-time State Mutation
**Location:** `page.tsx:88-91`  
**Code:**
```tsx
if (!formData.status_id && defaultStatus) {
  setFormData(prev => ({ ...prev, status_id: defaultStatus }))
}
```
**Problem:** State update during render - causes double render  
**Fix:** Move to useEffect
```tsx
useEffect(() => {
  if (!formData.status_id && defaultStatus) {
    setFormData(prev => ({ ...prev, status_id: defaultStatus }))
  }
}, [defaultStatus, formData.status_id])
```

### C002 - Inline Component Definition
**Location:** `page.tsx:156-178` (RadioGroup)  
**Problem:** Function recreated every render  
**Fix:** Extract to `src/components/radio-group.tsx`
```tsx
// radio-group.tsx
interface RadioGroupProps<T> {
  items: T[]
  value: string
  onChange: (value: string) => void
  labelExtractor?: (item: T) => string
  valueExtractor?: (item: T) => string
}
```

---

## HIGH (Fix Soon)

### H001 - Missing Unsaved Changes Guard
**Location:** `page.tsx:197`  
**Current:**
```tsx
<Button variant="ghost" onClick={() => router.push('/cases')}>İptal</Button>
```
**Problem:** No confirmation for dirty form  
**Fix:** Add beforeunload handler + confirmation dialog
```tsx
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) { e.preventDefault(); e.returnValue = '' }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [isDirty])
```

### H002 - Input Height Inconsistency
**Location:** `page.tsx:369`, `page.tsx:103`, `lawyer-select.tsx:68`  
**Pattern:**  
- `LawyerSelect`: `h-11`  
- `ClientSelect`: `h-11`  
- Page Selects: default (h-9)  
**Fix:** Add `className="h-11"` to all SelectTrigger in page

### H003 - Opposing Party Validation Mismatch
**Location:** `page.tsx:239` vs `page.tsx:102-105`  
**UI:** Shows `<span className="text-destructive">*</span>`  
**Validation:** Only checks `lawyer_id`, `client_id`, `case_type_id`  
**Fix:** Add to validation
```tsx
if (!formData.lawyer_id || !formData.client_id || !formData.case_type_id || !formData.opposing_party) {
```

---

## MEDIUM (Fix When Convenient)

### M001 - Native Date Picker UX
**Location:** `page.tsx:285-292`  
**Current:**
```tsx
<Input type="date" className="pl-10" ... />
<Calendar className="... absolute ..." />
```
**Problem:** Calendar icon is decorative, not functional  
**Fix:** Use shadcn/ui Popover + Calendar
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline"><CalendarIcon /> {date ? format(date) : 'Pick date'}</Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

### M002 - Magic Number
**Location:** `page.tsx:267`  
**Code:** `statuses.slice(0, 4)`  
**Fix:** `const MAX_VISIBLE_STATUSES = 4`

### M003 - Label Font Weight Inconsistency
**Location:** `page.tsx:228` vs `lawyer-select.tsx:53`  
- Some: `<Label>` (default)  
- Some: `<Label className="text-sm font-medium">`  
**Fix:** Standardize to `font-medium` or remove all

---

## LOW (Nice to Have)

### L001 - Layout Width Jump
**Location:** `cases/page.tsx:61` vs `cases/new/page.tsx:181`  
- List: `max-w-7xl mx-auto`  
- New: `w-full`  
**Fix:** Add `max-w-7xl mx-auto` to new page wrapper

### L002 - Currency Fallback Hardcoded
**Location:** `page.tsx:313-318`  
**Code:**
```tsx
{currencyItems.length > 0 ? (...) : (
  <><SelectItem value="TRY">TRY</SelectItem>...</>
)}
```
**Problem:** Hardcoded fallback values  
**Fix:** Define `DEFAULT_CURRENCIES` constant

---

## COMPONENT INVENTORY

| Component | Source | Reusable | Props |
|-----------|--------|----------|-------|
| LawyerSelect | `components/lawyer-select.tsx` | ✅ | value, onChange, label?, required? |
| ClientSelect | `components/client-select.tsx` | ✅ | value, onChange, label?, required? |
| FormFieldSelectWithId | `components/form-field-select.tsx` | ✅ | label, value, onValueChange, items, placeholder? |
| RadioGroup | inline (page.tsx:156) | ❌ | items, value, onChange, ... |

---

## DEPENDENCIES USED

```tsx
import { Button, Input, Label, Textarea, Select } from '@/components/ui/*'
import { ClientSelect, LawyerSelect, FormFieldSelectWithId } from '@/components/*'
import { useMultipleLookups } from '@/hooks/useLookups'
import { createClient } from '@/lib/supabase/client'
```

---

## VISUAL NOTES (from Screenshot)

- 3-column grid layout: `lg:grid-cols-12` (3/6/3 split)
- Quick status bar: horizontal segmented control
- Form sections: Taraflar | Dava Bilgileri | Mahkeme Bilgileri
- Sticky header with back button + save actions
- Full-height layout (no scroll on container, scroll on body)

---

## QUICK FIX SCRIPT

```bash
# 1. Create RadioGroup component
touch src/components/radio-group.tsx

# 2. Fix heights (page.tsx)
# Find: <SelectTrigger>
# Replace: <SelectTrigger className="h-11">

# 3. Add opposing_party validation
# Find: if (!formData.lawyer_id || !formData.client_id || !formData.case_type_id)
# Replace: if (!formData.lawyer_id || !formData.client_id || !formData.case_type_id || !formData.opposing_party)
```

---

## END OF AUDIT
