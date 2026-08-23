/**
 *   G48291S = Google Sheets HTTP/fetch failed (!response.ok or network)
 *   G57304S = Google Sheets response could not be read/parsed as JSON
 *   A19374F = Access is FALSE in the sheet (restaurant disabled / removed)
 *   A28461U = Access is UNDERCONST in the sheet (site under construction)
 *   N61802F = Restaurant ID not found in sheet info
 *   E70415M = Empty menu (no menu rows for this restaurant)
 *   N82503R = No restaurant ID in URL (?r= missing) / ID required
 *   U39160E = Unexpected / unknown error
 */

export const ERROR_CODES = {
  GOOGLE_SHEETS_FETCH: 'G48291S',
  GOOGLE_SHEETS_PARSE: 'G57304S',
  ACCESS_FALSE: 'A19374F',
  ACCESS_UNDERCONST: 'A28461U',
  NOT_FOUND: 'N61802F',
  EMPTY_MENU: 'E70415M',
  NO_RESTAURANT: 'N82503R',
  UNKNOWN: 'U39160E',
};

export const ERROR_COPY = {
  [ERROR_CODES.GOOGLE_SHEETS_FETCH]: {
    title: 'Connection issue',
    message: 'There seems to be an internet connection issue.',
    hint: 'Close this tab and retry, or try again later.',
  },
  [ERROR_CODES.GOOGLE_SHEETS_PARSE]: {
    title: 'Connection issue',
    message: 'There seems to be an internet connection issue.',
    hint: 'Close this tab and retry, or try again later.',
  },
  [ERROR_CODES.ACCESS_FALSE]: {
    title: 'Restaurant Not Found',
    message: 'This restaurant is unavailable or has been removed.',
    hint: '',
  },
  [ERROR_CODES.ACCESS_UNDERCONST]: {
    title: 'Under Construction',
    message:
      "We're improving things for a better experience.\nThanks for your patience. Will be available soon.",
    hint: '',
  },
  [ERROR_CODES.NOT_FOUND]: {
    title: 'Restaurant Not Found',
    message: 'Please check the correct restaurant ID/URL.',
    hint: '',
  },
  [ERROR_CODES.EMPTY_MENU]: {
    title: 'Something went wrong',
    message:
      "We couldn't load this restaurant as no menu is available for this restaurant yet.",
    hint: '',
  },
  [ERROR_CODES.NO_RESTAURANT]: {
    title: 'Restaurant Not Found',
    message: 'Please check the correct restaurant ID/URL.',
    hint: '',
  },
  [ERROR_CODES.UNKNOWN]: {
    title: 'Something went wrong',
    message: "We couldn't load this restaurant right now.",
    hint: 'Please try again later.',
  },
};

const FALLBACK_COPY = ERROR_COPY[ERROR_CODES.UNKNOWN];

export function getErrorCopy(code) {
  return ERROR_COPY[code] || FALLBACK_COPY;
}

export function createMenuError(code) {
  const resolved = code || ERROR_CODES.UNKNOWN;
  const copy = getErrorCopy(resolved);
  const err = new Error(copy.message);
  err.code = resolved;
  err.title = copy.title;
  err.hint = copy.hint;
  err.name = 'MenuError';
  return err;
}

/** Status / access gates that use the common AccessStatusScreen. */
export const ACCESS_STATUS_CODES = new Set([
  ERROR_CODES.ACCESS_FALSE,
  ERROR_CODES.ACCESS_UNDERCONST,
  ERROR_CODES.NOT_FOUND,
  ERROR_CODES.NO_RESTAURANT,
]);
