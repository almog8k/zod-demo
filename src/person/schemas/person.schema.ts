/* eslint-disable @typescript-eslint/no-magic-numbers */
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { Gender } from '../../common/constants';

extendZodWithOpenApi(z);

/* #region Address */
const addressSchema = z
  .object({
    street: z.string(),
    number: z.string(),
    city: z.string(),
    zip: z.string().length(7, { message: 'zip code length must be 7' }).optional(),
    country: z.string(),
    region: z.string().optional(),
  })
  .openapi({ description: 'Address schema', ref: 'Address' });
/* #endregion */

/* #region  IsraeliPhoneNumber*/
const israeliPhoneNumberSchema = z
  .string({ message: 'must be valid string' })
  .regex(/^05\d{8}$/, { message: 'phone number must be an israeli phone number' });
/* #endregion */

/* #region CreatePerson */
export const createPersonSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: israeliPhoneNumberSchema,
    genderNative: z.nativeEnum(Gender),
    age: z.number().int().positive(),
    address: addressSchema,
  })
  .openapi({ description: 'Create person schema', ref: 'CreatePerson' });

export type CreatePerson = z.infer<typeof createPersonSchema>;

/* #endregion */

/* #region Person */
export const personSchema = createPersonSchema
  .extend({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .openapi({ description: 'Person schema', ref: 'Person' });

export type Person = z.infer<typeof personSchema>;
/* #endregion */

export const updatePersonSchema = createPersonSchema.partial().openapi({ description: 'Update person schema', ref: 'UpdatePerson' });

export type UpdatePerson = z.infer<typeof updatePersonSchema>;
