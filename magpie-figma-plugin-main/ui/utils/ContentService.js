import ObjectHash from "object-hash";
import Requester from "./Requester.js";
import Cache from "./Cache.js";

export default {
  getInfo(cb, id, config) {
    this.getInfoV2(id, config).then((data) => {
      cb(data);
    });
  },
  async getInfoV2(
    id,
    {
      sourceType = "roku" /* 'gracenote' */,
      includeKeys = [],
      expandKeys = [],
    } = {},
  ) {
    const paramsHash = ObjectHash({ id, sourceType, includeKeys, expandKeys });
    const cacheKey = `getInfo-${paramsHash}`;
    const isItemExists = await Cache.exists(cacheKey);
    if (isItemExists) {
      const res = await Cache.getItem(cacheKey);
      return res;
    } else {
      const stringifyExpandKeys =
        expandKeys.length > 0 ? `,${expandKeys.join(",")}` : "";
      const stringifyIncludeKeys =
        includeKeys.length > 0 ? `,${includeKeys.join(",")}` : "";
      const getter = new Requester("GET");
      getter.setTarget(`content/v1/${sourceType}/${id}`);

      const res = await getter.promisifiedSend({
        include: `title,description,extra,releaseDate,parentalRatings,starRating,runTimeSeconds,images,genres,viewOptions,episodes.episodeNumber,episodes.title,episodes.description,episodes.seasonNumber,episodes.releaseDate,episodes.images,credits,seasons,seasonNumber,episodeNumber${stringifyIncludeKeys}`,
        expand: `episodes,credits`,
      });
      
      // Check if the response contains an error
      if (res && res.error) {
        return res; // Return the error response as-is
      }
      
      await Cache.setItem(cacheKey, res);
      return res;
    }
  },
  getInfos(cb, ids, sourceType) {
    this.getInfosV2(ids, sourceType).then((data) => {
      cb(data);
    });
  },
  async getInfosV2(ids, sourceType = "roku", locale = "en_US") {
    let source = sourceType === null ? "roku":sourceType
    const result = {};
    const idsToFetch = [];
    for (const id of ids) {
      const paramsHash = ObjectHash({ id, source });
      const cacheKey = `getInfos-${paramsHash}`;
      const isItemExists = await Cache.exists(cacheKey);
      if (isItemExists) {
        result[id] = await Cache.getItem(cacheKey);
      } else {
        idsToFetch.push(id);
      }
    }

    if (idsToFetch.length > 0) {
      const getter = new Requester("POST");
      getter.setLocale(locale);
      getter.setTarget(`content/v1/${source}`);
      const data = await getter.promisifiedSend(null, {
        ids,
        include:
          "title,description,extra,releaseDate,parentalRatings,starRating,runTimeSeconds,images,genres,viewOptions,episodes.episodeNumber,episodes.title,episodes.description,episodes.seasonNumber,credits,seasons,seasonNumber,episodeNumber",
        expand: "episodes[1:5],viewOptions.channelDetails",
      });
      
      // Check if the response contains an error
      if (data && data.error) {
        return { error: data.error };
      }
      
      const keys = Object.keys(data);
      for (const key of keys) {
        const paramsHash = ObjectHash({ id: key, source });
        const cacheKey = `getInfos-${paramsHash}`;
        await Cache.setItem(cacheKey, data[key]);
      }

      Object.assign(result, data);
    }

    return result;
  },
};
