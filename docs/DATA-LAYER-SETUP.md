# Data Layer Setup

## 1. Run the migration in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Open **SQL Editor** → **New query**
3. Copy the contents of `supabase/migrations/001_data_layer.sql`
4. Click **Run**

## 2. CSV format

Your CSV should have a header row with columns (names are flexible):

| Column (any of these) | Maps to |
|----------------------|---------|
| address, property address, mailing address | address |
| city | city |
| state, st | state |
| zip, zip code, postal code | zip |
| owner name, owner | owner_name |
| phone, phone number, cell, mobile | phone |
| email, email address | email |

Example:

```csv
address,city,state,zip,owner name,phone,email
123 Main St,Austin,TX,78701,John Doe,5125551234,john@example.com
456 Oak Ave,Houston,TX,77001,Jane Smith,7135555678,jane@example.com
```

## 3. DNC registry

To add numbers to your internal DNC list, insert into `dnc_registry` (via API or Supabase dashboard):

```sql
INSERT INTO dnc_registry (user_id, phone) VALUES ('your-user-uuid', '5125551234');
```

External DNC APIs can be integrated later.
