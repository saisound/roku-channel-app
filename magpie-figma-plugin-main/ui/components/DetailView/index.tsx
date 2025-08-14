import * as React from "react";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import StreamingAPI from "../../utils/NormalizedContentService";

import getPreferredImage from "../../utils/getPreferredImage.js";
import groupBy from "../../utils/groupBy.js";
import ImageTile from "../ImageTile";
import "./index.css";

const BackCaret = () => (
  <svg width="10" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2 2 8l7 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DetailView = ({ data, onBackClick }) => {
  const [season, setSeason] = React.useState(
    data.episodes?.length > 0 ? data.episodes[data.episodes.length - 1].seasonNumber : null,
  );
  const [detailData, setDetailData] = React.useState(null);

  React.useEffect(() => {
    loadDetailData(data.id);
    document.body.style.overflow = "hidden"; // prevent double scroll bars
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  const loadDetailData = async (id) => {
    setDetailData(await StreamingAPI.getNormalizedInfo(id));
  };

  const metaInfos = [data.meta?.mediaType, data.releaseYear, data.parentalRatings?.[0]?.code, data.runtime];

  const episodes = detailData ? detailData.episodes : data.episodes;
  const credits = detailData ? detailData.credits : data.credits;
  const episodesBySeason = groupBy(episodes, "seasonNumber");

  return (
    <>
      <div className="detail-view-header">
        <button onClick={onBackClick}>
          <BackCaret />
        </button>
        <h1>{data.title}</h1>
      </div>

      <div className="detail-view-meta">
        {metaInfos.map((info) => (info ? <Chip label={info} key={info} size="small" variant="outlined" /> : null))}
      </div>

      <p className="detail-view-description">{data.description}</p>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>Images ({data.images.length})</AccordionSummary>
        <AccordionDetails>
          <div className="view-more-images-panel">
            {data.images.map((image) => (
              <ImageTile id={data.id} key={image.path} imageURL={image.path} type={image.type} />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      {Object.keys(episodesBySeason).length > 0 ? (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Episodes ({data.episodes.length}) ({Object.keys(episodesBySeason).length} seasons)
          </AccordionSummary>
          <AccordionDetails>
            <FormControl sx={{ margin: "16px 0", minWidth: 100 }} size="small">
              <InputLabel id="season-select">Season</InputLabel>
              <Select
                labelId="season-select"
                value={season}
                label="Season"
                onChange={(e) => {
                  setSeason(e.target.value);
                }}
              >
                {Object.keys(episodesBySeason).map((seasonNumber) => (
                  <MenuItem value={seasonNumber} key={seasonNumber}>
                    {seasonNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {episodesBySeason[season].map((episode) => (
              <div className="episode-item" key={episode.id}>
                <ImageTile id={episode.id} hideViewMore imageURL={episode.backgroundImage?.path} />
                <div>
                  <h3>{episode.title}</h3>
                  <p className="episode-item-meta">
                    E{episode.episodeNumber} | {episode.releaseDate?.split("T")[0]}
                  </p>
                  <p className="episode-item-description">{episode.description}</p>
                </div>
              </div>
            ))}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {data.viewOptions.length > 0 ? (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>View options ({data.viewOptions.length})</AccordionSummary>
          <AccordionDetails>
            <div className="view-more-images-panel" style={{ gridTemplateColumns: `repeat(4, 1fr)` }}>
              {data.viewOptions.map((viewOption) => (
                <ImageTile
                  title={viewOption.name}
                  id={viewOption.id}
                  key={viewOption.id}
                  imageURL={getPreferredImage("channel", viewOption.images)}
                />
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      ) : null}

      <div className="episode-item-meta" style={{ margin: "12px", textAlign: "center", fontWeight: "400" }}>
        <p>content id: {data.id}</p>
      </div>
    </>
  );
};

export default DetailView;
