/**
 * other.ts
 *
 * Contains the function implementations of all
 * functions that are uncategorized.
 */

import { getData, setData } from './dataStore';

/**
 * clearV1
 *
 * Grabs the data in the dataStore, then
 * sets the data to be an empty user and
 * channel array (default state)
 *
 * @param null
 * @returns { {} }
 */
function clearV1(): Record<string, never> {
  let data = getData();

  data = {
    users: [],
    channels: [],
    dms: []
  };

  setData(data);

  return {};
}

export { clearV1 };
