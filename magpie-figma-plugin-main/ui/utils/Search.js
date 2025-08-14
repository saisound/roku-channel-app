// * * * * * * * * * * * * * * * 
// * MODIFIED FROM https://gitlab.eng.roku.com/UX/uxe-kit/-/blob/main/packages/rk-streaming-data-api/src/module/Search.js
// * WILL TRACK CHANGES WITH COMMENTS: // CHANGED to accomplish X
// * * * * * * * * * * * * * * * 

import Requester from "./Requester.js";

// CHANGED: commented below bc unused
// basic search
// const getter = new Requester("GET");
// getter.setTarget("search/v3/");
// getter.setDefaultQuery({
//   items: 25,
// });

// filter search
const poster = new Requester("POST");
poster.setDefaultQuery({
  items: 30,
});

// curl --location --request POST 'portal.sr.roku.com/hs-search/v1/search?contentExpand=viewOptions.channelDetails&contentInclude=title,description,extra,viewOptions,releaseDate,parentalRatings,starRating,runTimeSeconds,images,genres,seasons,birthdate,roles' \
// --header 'x-roku-reserved-client-version: version=3.0,platform=rokuplayer,app=globalsearch,libversion=99.6.00176' \
// --header 'x-roku-reserved-device-id: DK5004759458' \
// --header 'x-roku-reserved-channel-store-cod: US' \
// --header 'x-roku-reserved-profile-id: f0a21a8c-a9ee-4b02-a130-87a88b38ba36' \
// --header 'x-roku-reserved-model-name: 7506X' \
// --header 'x-roku-reserved-serial-number: YJ002M655568' \
// --header 'Content-Type: application/json' \
// --header 'x-roku-reserved-culture-code: en' \
// --data-raw '{
//     "filters": {
//         "rootGroup": {
//             "groupOp": "OR",
//             "groups": [
//                 {
//                     "groupOp": "AND",
//                     "groups": [
//                         {
//                             "groupOp": "OR",
//                             "rules": [
//                                 {
//                                     "ruleOp": "LIKE",
//                                     "field": "title",
//                                     "value": "ab"
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//             ]
//         }
//     }
// }'

export default {
  // CHANGED: commented below bc unused
  //   hsSearch(cb, query, filter, items, page) {
  //     poster.setTarget("hs-search/v1/search");
  //     const filterMap = {
  //       rootGroup: {
  //         groupOp: "AND",
  //         groups: [
  //           filter || {},
  //           {
  //             groupOp: "OR",
  //             rules: [
  //               {
  //                 ruleOp: "LIKE",
  //                 field: "title",
  //                 value: query,
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //       size: items || 10,
  //     };
  //     poster.send(
  //       (res) => {
  //         cb({
  //           page: page || 1,
  //           items: res.view,
  //         });
  //       },
  //       {
  //         items: items || 10,
  //         page: page || 1,
  //         contentExpand: "viewOptions.channelDetails",
  //         contentInclude:
  //           "title,description,extra,viewOptions,releaseDate,parentalRatings,starRating,runTimeSeconds,images,genres,seasons,birthdate,roles",
  //       },
  //       { filters: filterMap },
  //     );
  //   },
  //   search(cb, query, page = 1) {
  //     getter.setTarget("search/v3/");
  //     getter.send(
  //       (res) => {
  //         cb({
  //           found: res.response.result["@numFound"],
  //           page: res.response.result["@page"],
  //           start: res.response.result["@start"],
  //           items: res.response.result.doc,
  //         });
  //       },
  //       { query, page },
  //     );
  //   },

  filterSearch(cb, query, filter, page = 1, trc = false, locale = "en_US") {
    const filterMap = {
      rootGroup: filter,
      sort: {
        field: "POPULARITY",
      },
      // size: 10, CHANGED commented out to get default of 25
    };
    // poster.setTarget("search/v3/"); 
    poster.setTarget("search/v4/"); // CHANGED to update endpoint
    poster.setLocale(locale); 
    poster.send(
      (res) => {
        // cb({
        //   found: res.response.result["@numFound"],
        //   page: res.response.result["@page"],
        //   start: res.response.result["@start"],
        //   items: res.response.result.doc,
        // }); 
        cb(res.result, locale)  // CHANGED to accomodate v4 endpoint
      },
      // { query, page }, 
      // trc ? { query, page, feedGroup: "newmanprod" } : { query, page }, // CHANGED to specify feedgroup if trc is specified
      { query, page, feedGroup: trc ? "newmanprod" : "" }, // CHANGED to specify feedgroup if trc is specified
      filterMap,
    );
  },
};

