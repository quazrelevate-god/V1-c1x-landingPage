/**
 * Country dial codes for the demo request form's phone field.
 *
 * The form stores the ISO 3166-1 alpha-2 code (not the dial code) because dial
 * codes are not unique — GB, GG, IM and JE all share +44, and US/CA share +1.
 * The server resolves the dial code from this table at submit time, so a
 * tampered client can never invent one.
 */

type CountryTuple = readonly [name: string, iso2: string, dial: string];

// [name, ISO 3166-1 alpha-2, dial code without the leading +]
const RAW: readonly CountryTuple[] = [
  ["Afghanistan", "AF", "93"],
  ["Albania", "AL", "355"],
  ["Algeria", "DZ", "213"],
  ["Andorra", "AD", "376"],
  ["Angola", "AO", "244"],
  ["Anguilla", "AI", "1264"],
  ["Antigua and Barbuda", "AG", "1268"],
  ["Argentina", "AR", "54"],
  ["Armenia", "AM", "374"],
  ["Aruba", "AW", "297"],
  ["Australia", "AU", "61"],
  ["Austria", "AT", "43"],
  ["Azerbaijan", "AZ", "994"],
  ["Bahamas", "BS", "1242"],
  ["Bahrain", "BH", "973"],
  ["Bangladesh", "BD", "880"],
  ["Barbados", "BB", "1246"],
  ["Belarus", "BY", "375"],
  ["Belgium", "BE", "32"],
  ["Belize", "BZ", "501"],
  ["Benin", "BJ", "229"],
  ["Bermuda", "BM", "1441"],
  ["Bhutan", "BT", "975"],
  ["Bolivia", "BO", "591"],
  ["Bosnia and Herzegovina", "BA", "387"],
  ["Botswana", "BW", "267"],
  ["Brazil", "BR", "55"],
  ["Brunei", "BN", "673"],
  ["Bulgaria", "BG", "359"],
  ["Burkina Faso", "BF", "226"],
  ["Burundi", "BI", "257"],
  ["Cambodia", "KH", "855"],
  ["Cameroon", "CM", "237"],
  ["Canada", "CA", "1"],
  ["Cape Verde", "CV", "238"],
  ["Cayman Islands", "KY", "1345"],
  ["Central African Republic", "CF", "236"],
  ["Chad", "TD", "235"],
  ["Chile", "CL", "56"],
  ["China", "CN", "86"],
  ["Colombia", "CO", "57"],
  ["Comoros", "KM", "269"],
  ["Congo", "CG", "242"],
  ["Congo (DRC)", "CD", "243"],
  ["Cook Islands", "CK", "682"],
  ["Costa Rica", "CR", "506"],
  ["Côte d'Ivoire", "CI", "225"],
  ["Croatia", "HR", "385"],
  ["Cuba", "CU", "53"],
  ["Curaçao", "CW", "599"],
  ["Cyprus", "CY", "357"],
  ["Czechia", "CZ", "420"],
  ["Denmark", "DK", "45"],
  ["Djibouti", "DJ", "253"],
  ["Dominica", "DM", "1767"],
  ["Dominican Republic", "DO", "1809"],
  ["Ecuador", "EC", "593"],
  ["Egypt", "EG", "20"],
  ["El Salvador", "SV", "503"],
  ["Equatorial Guinea", "GQ", "240"],
  ["Eritrea", "ER", "291"],
  ["Estonia", "EE", "372"],
  ["Eswatini", "SZ", "268"],
  ["Ethiopia", "ET", "251"],
  ["Fiji", "FJ", "679"],
  ["Finland", "FI", "358"],
  ["France", "FR", "33"],
  ["French Polynesia", "PF", "689"],
  ["Gabon", "GA", "241"],
  ["Gambia", "GM", "220"],
  ["Georgia", "GE", "995"],
  ["Germany", "DE", "49"],
  ["Ghana", "GH", "233"],
  ["Gibraltar", "GI", "350"],
  ["Greece", "GR", "30"],
  ["Greenland", "GL", "299"],
  ["Grenada", "GD", "1473"],
  ["Guam", "GU", "1671"],
  ["Guatemala", "GT", "502"],
  ["Guernsey", "GG", "44"],
  ["Guinea", "GN", "224"],
  ["Guinea-Bissau", "GW", "245"],
  ["Guyana", "GY", "592"],
  ["Haiti", "HT", "509"],
  ["Honduras", "HN", "504"],
  ["Hong Kong", "HK", "852"],
  ["Hungary", "HU", "36"],
  ["Iceland", "IS", "354"],
  ["India", "IN", "91"],
  ["Indonesia", "ID", "62"],
  ["Iran", "IR", "98"],
  ["Iraq", "IQ", "964"],
  ["Ireland", "IE", "353"],
  ["Isle of Man", "IM", "44"],
  ["Israel", "IL", "972"],
  ["Italy", "IT", "39"],
  ["Jamaica", "JM", "1876"],
  ["Japan", "JP", "81"],
  ["Jersey", "JE", "44"],
  ["Jordan", "JO", "962"],
  ["Kazakhstan", "KZ", "7"],
  ["Kenya", "KE", "254"],
  ["Kiribati", "KI", "686"],
  ["Kuwait", "KW", "965"],
  ["Kyrgyzstan", "KG", "996"],
  ["Laos", "LA", "856"],
  ["Latvia", "LV", "371"],
  ["Lebanon", "LB", "961"],
  ["Lesotho", "LS", "266"],
  ["Liberia", "LR", "231"],
  ["Libya", "LY", "218"],
  ["Liechtenstein", "LI", "423"],
  ["Lithuania", "LT", "370"],
  ["Luxembourg", "LU", "352"],
  ["Macao", "MO", "853"],
  ["Madagascar", "MG", "261"],
  ["Malawi", "MW", "265"],
  ["Malaysia", "MY", "60"],
  ["Maldives", "MV", "960"],
  ["Mali", "ML", "223"],
  ["Malta", "MT", "356"],
  ["Marshall Islands", "MH", "692"],
  ["Mauritania", "MR", "222"],
  ["Mauritius", "MU", "230"],
  ["Mexico", "MX", "52"],
  ["Micronesia", "FM", "691"],
  ["Moldova", "MD", "373"],
  ["Monaco", "MC", "377"],
  ["Mongolia", "MN", "976"],
  ["Montenegro", "ME", "382"],
  ["Montserrat", "MS", "1664"],
  ["Morocco", "MA", "212"],
  ["Mozambique", "MZ", "258"],
  ["Myanmar", "MM", "95"],
  ["Namibia", "NA", "264"],
  ["Nauru", "NR", "674"],
  ["Nepal", "NP", "977"],
  ["Netherlands", "NL", "31"],
  ["New Caledonia", "NC", "687"],
  ["New Zealand", "NZ", "64"],
  ["Nicaragua", "NI", "505"],
  ["Niger", "NE", "227"],
  ["Nigeria", "NG", "234"],
  ["Niue", "NU", "683"],
  ["North Korea", "KP", "850"],
  ["North Macedonia", "MK", "389"],
  ["Norway", "NO", "47"],
  ["Oman", "OM", "968"],
  ["Pakistan", "PK", "92"],
  ["Palau", "PW", "680"],
  ["Palestine", "PS", "970"],
  ["Panama", "PA", "507"],
  ["Papua New Guinea", "PG", "675"],
  ["Paraguay", "PY", "595"],
  ["Peru", "PE", "51"],
  ["Philippines", "PH", "63"],
  ["Poland", "PL", "48"],
  ["Portugal", "PT", "351"],
  ["Puerto Rico", "PR", "1787"],
  ["Qatar", "QA", "974"],
  ["Romania", "RO", "40"],
  ["Russia", "RU", "7"],
  ["Rwanda", "RW", "250"],
  ["Saint Kitts and Nevis", "KN", "1869"],
  ["Saint Lucia", "LC", "1758"],
  ["Saint Vincent and the Grenadines", "VC", "1784"],
  ["Samoa", "WS", "685"],
  ["San Marino", "SM", "378"],
  ["São Tomé and Príncipe", "ST", "239"],
  ["Saudi Arabia", "SA", "966"],
  ["Senegal", "SN", "221"],
  ["Serbia", "RS", "381"],
  ["Seychelles", "SC", "248"],
  ["Sierra Leone", "SL", "232"],
  ["Singapore", "SG", "65"],
  ["Slovakia", "SK", "421"],
  ["Slovenia", "SI", "386"],
  ["Solomon Islands", "SB", "677"],
  ["Somalia", "SO", "252"],
  ["South Africa", "ZA", "27"],
  ["South Korea", "KR", "82"],
  ["South Sudan", "SS", "211"],
  ["Spain", "ES", "34"],
  ["Sri Lanka", "LK", "94"],
  ["Sudan", "SD", "249"],
  ["Suriname", "SR", "597"],
  ["Sweden", "SE", "46"],
  ["Switzerland", "CH", "41"],
  ["Syria", "SY", "963"],
  ["Taiwan", "TW", "886"],
  ["Tajikistan", "TJ", "992"],
  ["Tanzania", "TZ", "255"],
  ["Thailand", "TH", "66"],
  ["Timor-Leste", "TL", "670"],
  ["Togo", "TG", "228"],
  ["Tonga", "TO", "676"],
  ["Trinidad and Tobago", "TT", "1868"],
  ["Tunisia", "TN", "216"],
  ["Türkiye", "TR", "90"],
  ["Turkmenistan", "TM", "993"],
  ["Turks and Caicos Islands", "TC", "1649"],
  ["Tuvalu", "TV", "688"],
  ["Uganda", "UG", "256"],
  ["Ukraine", "UA", "380"],
  ["United Arab Emirates", "AE", "971"],
  ["United Kingdom", "GB", "44"],
  ["United States", "US", "1"],
  ["Uruguay", "UY", "598"],
  ["Uzbekistan", "UZ", "998"],
  ["Vanuatu", "VU", "678"],
  ["Vatican City", "VA", "39"],
  ["Venezuela", "VE", "58"],
  ["Vietnam", "VN", "84"],
  ["Yemen", "YE", "967"],
  ["Zambia", "ZM", "260"],
  ["Zimbabwe", "ZW", "263"],
];

export type Country = {
  name: string;
  /** ISO 3166-1 alpha-2, uppercase. The value stored on the form. */
  iso2: string;
  /** Dial code including the leading "+", e.g. "+91". */
  dial: string;
  /** Regional-indicator flag, derived from iso2. */
  flag: string;
};

/**
 * Turns "IN" into 🇮🇳 by mapping each letter to its regional indicator symbol.
 * Platforms without flag glyphs (notably Windows) fall back to showing the two
 * letters, which is why the dial code is always rendered alongside it.
 */
function flagFor(iso2: string): string {
  return String.fromCodePoint(
    ...[...iso2].map((c) => 0x1f1e6 + (c.charCodeAt(0) - "A".charCodeAt(0))),
  );
}

export const COUNTRIES: readonly Country[] = RAW.map(([name, iso2, dial]) => ({
  name,
  iso2,
  dial: `+${dial}`,
  flag: flagFor(iso2),
})).sort((a, b) => a.name.localeCompare(b.name));

const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]));

/** The corridor the product is built around, surfaced above the full list. */
export const PRIORITY_ISO2 = ["IN", "AE", "SA", "OM", "QA", "KW", "BH"] as const;

/** Default selection — the India–Gulf corridor starts in India. */
export const DEFAULT_ISO2 = "IN";

export function countryByIso2(iso2: string): Country | undefined {
  return BY_ISO2.get(iso2);
}

export function isKnownIso2(iso2: string): boolean {
  return BY_ISO2.has(iso2);
}

/**
 * Cleans up a pasted number so it doesn't end up double-prefixed.
 *
 * Only a value the user explicitly typed with a leading "+" is treated as
 * international, because a national number can legitimately begin with the same
 * digits as its own dial code — an Indian mobile may start "91…", and stripping
 * that would silently mangle it. A leading "+" is unambiguous, so it's the only
 * case where the dial code is removed.
 */
export function normalizeNationalNumber(raw: string, dial: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("+")) return trimmed;

  const withoutPlus = trimmed.slice(1).trimStart();
  const digits = dial.slice(1);
  return withoutPlus.startsWith(digits)
    ? withoutPlus.slice(digits.length).trimStart()
    : withoutPlus;
}
