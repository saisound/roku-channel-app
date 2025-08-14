import ObjectHash from "object-hash";
import ContentService from "./ContentService.js";
// import normalizeStreamingPayload from "../utils/normalizeStreamingPayload.js";
import normalizeStreamingPayload from "../../node_modules/@roku-uxe-kit/rk-streaming-data-api/dist/lib/utils/normalizeStreamingPayload.js";
import Cache from "./Cache.js";

export default {
  async getNormalizedInfo(id, options) {
    const paramsHash = ObjectHash({ id, options });
    const cacheKey = `getNormalizedInfo-${paramsHash}`;
    if (await Cache.exists(cacheKey)) {
      const normalizedPayload = await Cache.getItem(cacheKey);
      return normalizedPayload;
    } else {
      const payload = await ContentService.getInfoV2(id, options);
      const normalizedPayload = normalizeStreamingPayload(payload);
      await Cache.setItem(cacheKey, normalizedPayload);
      return normalizedPayload;
    }
  },

  // CHANGED this entire function to preserve the order of the ids array when results are returned
  async getNormalizedInfos(ids, sourceType, locale) {
    const idsToFetch = [];

    const unresolvedResult = ids.map(async (id) => {
      const paramsHash = ObjectHash({ id, sourceType, locale });
      const cacheKey = `getNormalizedInfo-${paramsHash}`;
      const isCached = await Cache.exists(cacheKey);
      if (isCached) {
        return await Cache.getItem(cacheKey);
      } else {
        idsToFetch.push(id);
        return { idToFetch: id }
      }
    })

    const result = await Promise.all(unresolvedResult);

    if (idsToFetch.length > 0) {
      try {
        const payload = await ContentService.getInfosV2(idsToFetch, sourceType, locale);
        if (payload && typeof payload === 'object' && !payload.error) {
          const fetchedIds = Object.keys(payload);
          for (const id of fetchedIds) {
            const paramsHash = ObjectHash({ id, sourceType });
            const cacheKey = `getNormalizedInfos-${paramsHash}`;
            const normalizedPayload = normalizeStreamingPayload(payload[id]);
            await Cache.setItem(cacheKey, normalizedPayload);
            const resultIndex = result.findIndex(item => item.idToFetch === id);
            result[resultIndex] = normalizedPayload
          }
        } else {
          // Return error if ContentService failed
          return { error: payload?.error || 'Failed to fetch content' };
        }
      } catch (error) {
        // Return error for any exceptions
        return { error: error.message || 'Network error occurred' };
      }
    }

    return result.filter(item => !item.hasOwnProperty('idToFetch')); // remove any items that didn't return info from ContentService
  },
};
