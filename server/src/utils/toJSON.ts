import type { Schema } from 'mongoose';

/** Standardizes API JSON output: `_id`→`id`, strips `__v` and any explicitly-hidden fields. */
export function applyToJSON(schema: Schema, hide: string[] = []): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      for (const field of hide) delete ret[field];
      return ret;
    },
  });
}
