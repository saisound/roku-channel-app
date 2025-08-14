import * as React from "react";
import MySelect from "../Select";

const options = {
  type: [
    { value: "any type", label: "Any type" },
    { value: "channel", label: "App" },
    { value: "livefeed", label: "Live feed" },
    { value: "movie", label: "Movie" },
    { value: "person", label: "Person" },
    { value: "provider", label: "Provider" },
    { value: "series", label: "Series" },
    { value: "shortformvideo", label: "Short form video" },
    { value: "sportsevent", label: "Sports event" },
    { value: "tvspecial", label: "TV special" },
    { value: "zone", label: "Zone" },
  ],
  imageType: [
    { value: "any image type", label: "Any image type" },
    { value: "Background", label: "Background" },
    { value: "Banner", label: "Banner" },
    { value: "epg", label: "EPG images" },
    { value: "KeyArt", label: "Key art" },
    { value: "None", label: "None (app)" },
    { value: "Person", label: "Person" },
    { value: "Poster", label: "Poster" },
    { value: "bob", label: "Provider back of box ⬜" },
    { value: "bobBlack", label: "Provider back of box ⬛" },
    { value: "cta", label: "Provider call to action" },
    { value: "providerPromo", label: "Provider promo" },
    { value: "providerPremiumSub", label: "Provider premium sub" },
    { value: "screenshot", label: "Screenshot (app)" },
  ],
  aspectRatio: [
    { value: "any aspect ratio", label: "Any aspect ratio" },
    { value: "16:9", label: "16:9" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "2:3", label: "2:3" },
    { value: "1:1", label: "1:1" },
    { value: "57:27", label: "57:27 - Zone"},
  ],
  trc: [
    { value: false, label: "Global" },
    { value: true, label: "TRC" },
  ],
  locale: [
    { value: "en_US", label: "en_US" },
    { value: "en_GB", label: "en_GB" },
    { value: "en_AU", label: "en_AU" },
    { value: "es_MX", label: "es_MX" },
    { value: "de_DE", label: "de_DE" },
    { value: "fr_CA", label: "fr_CA" },
    { value: "pt_BR", label: "pt_BR" },
  ],
};

const defaultLabels = {
  type: "Type",
  imageType: "Image Type",
  aspectRatio: "Aspect",
  trc: "Global",
  locale: "en_US",
};

const FilterDropdowns = ({ filters, setFilters }) => {
  return (
    <div style={{ marginTop: "4px" }}>
      {Object.keys(options).map((filter) => (
        <MySelect
          key={filter}
          value={filters[filter]}
          defaultValue={options[filter][0]["value"]}
          onChange={(event) => {
            setFilters({ ...filters, [filter]: event.target.value });
          }}
          options={options[filter]}
          labelWhenDefault={defaultLabels[filter]}
        />
      ))}
    </div>
  );
};

export default FilterDropdowns;
