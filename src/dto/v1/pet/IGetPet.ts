import type { IPet } from '#/database/interfaces/IPet';
import type { ITid } from '#/dto/common/ITid';

export interface IGetPetQuerystringDto extends ITid {}

export interface IGetPetParamsDto {
  /**
   * pet id
   */
  id: IPet['id'];
}
