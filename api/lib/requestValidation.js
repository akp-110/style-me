/* eslint-env node */
/* global Buffer */

export const MAX_IMAGE_BASE64_CHARS = 4_000_000;
const MODES = new Set(['professional', 'balanced', 'hype', 'roast']);
const RATING_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const ANALYSIS_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export class InputError extends Error {
    constructor(message, code = 'invalid_request') {
        super(message);
        this.name = 'InputError';
        this.status = 400;
        this.code = code;
    }
}

function assertPlainObject(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new InputError(`${name} must be an object`);
    }
}

function rejectUnknownKeys(value, allowed, name) {
    for (const key of Object.keys(value)) {
        if (!allowed.has(key)) throw new InputError(`${name} contains an unsupported field`);
    }
}

function boundedString(value, name, maxLength, { required = false } = {}) {
    if (value === undefined || value === null) {
        if (required) throw new InputError(`${name} is required`);
        return '';
    }
    if (typeof value !== 'string') throw new InputError(`${name} must be a string`);
    const trimmed = value.trim();
    if (required && !trimmed) throw new InputError(`${name} is required`);
    if (trimmed.length > maxLength) throw new InputError(`${name} is too long`);
    return trimmed;
}

function boundedNumber(value, name, min, max) {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        throw new InputError(`${name} is invalid`);
    }
    return value;
}

function boundedStringArray(value, name, maxItems, maxItemLength) {
    if (value === undefined || value === null) return [];
    if (!Array.isArray(value) || value.length > maxItems) throw new InputError(`${name} is invalid`);
    return value.map((item, index) => boundedString(item, `${name}[${index}]`, maxItemLength, { required: true }));
}

function validateImage(image) {
    const value = boundedString(image, 'image', MAX_IMAGE_BASE64_CHARS, { required: true });
    if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
        throw new InputError('image must be valid base64');
    }
    const decoded = Buffer.from(value, 'base64');
    if (!decoded.length || decoded.toString('base64') !== value) {
        throw new InputError('image must be valid base64');
    }
    return value;
}

function validateProfile(value = {}) {
    assertPlainObject(value, 'context.profile');
    rejectUnknownKeys(value, new Set(['stylePreferences', 'favouriteColors', 'favouriteBrands']), 'context.profile');
    return {
        stylePreferences: boundedStringArray(value.stylePreferences, 'stylePreferences', 10, 80),
        favouriteColors: boundedStringArray(value.favouriteColors, 'favouriteColors', 10, 80),
        favouriteBrands: boundedStringArray(value.favouriteBrands, 'favouriteBrands', 10, 80)
    };
}

function validateWeather(value) {
    if (value === undefined || value === null) return null;
    assertPlainObject(value, 'context.weather');
    rejectUnknownKeys(value, new Set(['description', 'temperature', 'feelsLike', 'location', 'humidity', 'windSpeed']), 'context.weather');
    return {
        description: boundedString(value.description, 'weather.description', 120),
        temperature: boundedNumber(value.temperature, 'weather.temperature', -100, 100),
        feelsLike: boundedNumber(value.feelsLike, 'weather.feelsLike', -100, 100),
        location: boundedString(value.location, 'weather.location', 160),
        humidity: boundedNumber(value.humidity, 'weather.humidity', 0, 100),
        windSpeed: boundedNumber(value.windSpeed, 'weather.windSpeed', 0, 500)
    };
}

export function validateRatingRequest(body) {
    assertPlainObject(body, 'request body');
    rejectUnknownKeys(body, new Set(['image', 'mediaType', 'mode', 'context']), 'request body');

    const mediaType = boundedString(body.mediaType ?? 'image/jpeg', 'mediaType', 40, { required: true });
    const mode = boundedString(body.mode ?? 'balanced', 'mode', 40, { required: true });
    if (!RATING_MEDIA_TYPES.has(mediaType)) throw new InputError('Unsupported media type');
    if (!MODES.has(mode)) throw new InputError('Unsupported rating mode');

    const context = body.context ?? {};
    assertPlainObject(context, 'context');
    rejectUnknownKeys(context, new Set(['weather', 'profile', 'upcomingEvents']), 'context');
    const validatedContext = {
        weather: validateWeather(context.weather),
        profile: validateProfile(context.profile ?? {}),
        upcomingEvents: boundedStringArray(context.upcomingEvents, 'upcomingEvents', 3, 180)
    };
    if (JSON.stringify(validatedContext).length > 4_000) throw new InputError('context is too large');

    return { image: validateImage(body.image), mediaType, mode, context: validatedContext };
}

export function validateAnalysisRequest(body) {
    assertPlainObject(body, 'request body');
    rejectUnknownKeys(body, new Set(['image', 'mediaType', 'userPreferences']), 'request body');
    const mediaType = boundedString(body.mediaType ?? 'image/jpeg', 'mediaType', 40, { required: true });
    if (!ANALYSIS_MEDIA_TYPES.has(mediaType)) throw new InputError('Unsupported media type');

    const preferences = body.userPreferences ?? {};
    assertPlainObject(preferences, 'userPreferences');
    rejectUnknownKeys(preferences, new Set([
        'favoriteColors', 'favouriteColors', 'preferredStyles', 'stylePreferences',
        'favoriteBrands', 'favouriteBrands', 'countryCode'
    ]), 'userPreferences');

    return {
        image: validateImage(body.image),
        mediaType,
        userPreferences: {
            favoriteColors: boundedStringArray(preferences.favoriteColors ?? preferences.favouriteColors, 'favoriteColors', 10, 80),
            preferredStyles: boundedStringArray(preferences.preferredStyles ?? preferences.stylePreferences, 'preferredStyles', 10, 80),
            favoriteBrands: boundedStringArray(preferences.favoriteBrands ?? preferences.favouriteBrands, 'favoriteBrands', 10, 80),
            countryCode: boundedString(preferences.countryCode, 'countryCode', 2).toUpperCase()
        }
    };
}
