import { PrimaryKey } from '#/database/columns/PrimaryKey';
import { CE_ENTITY_NAME } from '#/database/const-enum/CE_ENTITY_NAME';
import type { IPetTagMTM } from '#/database/interfaces/IPetTagMTM';
import { EntitySchema } from 'typeorm';

/**
 * pet and tag many-to-many relation
 */
export const PetTagMTMEntity = new EntitySchema<IPetTagMTM>({
  name: CE_ENTITY_NAME.PET_TAG_MTM,
  tableName: CE_ENTITY_NAME.PET_TAG_MTM_TABLE,
  columns: {
    petId: {
      ...PrimaryKey.id,
      name: 'pet_id',
      generated: undefined,
    },
    tagId: {
      ...PrimaryKey.id,
      name: 'tag_id',
      generated: undefined,
    },
  },
});
