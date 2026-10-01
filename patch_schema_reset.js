const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

if (!schema.includes('passwordResetTokens')) {
  const tableCode = `
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
`;

  schema = schema + tableCode;
  fs.writeFileSync('src/db/schema.ts', schema);
  console.log('Added passwordResetTokens to schema');
} else {
  console.log('Already added');
}
