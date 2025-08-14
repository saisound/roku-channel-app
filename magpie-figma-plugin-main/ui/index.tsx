import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import debounce from "lodash.debounce";
import "@roku-web-ui/rds-fonts";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";

import StreamingData from "./utils/NormalizedContentService";
import getPreferredImage from "./utils/getPreferredImage";
import SearchInput from "./components/SearchInput";
import FilterDropdowns from "./components/FilterDropdowns";
import ImageTile from "./components/ImageTile";
import ConnectionError from "./components/ConnectionError";
import EmptyState from "./components/EmptyState";
import DetailView from "./components/DetailView";
import DataConsole from "./components/DataConsole";
import SettingsView from "./components/SettingsView";
import VPNCheckingState from "./components/VPNCheckingState";

import { validInsertWidths } from "./constants";
import getPresetByWidth from "./utils/getPresetByWidth";
import getImageAsArray from "./utils/getImageAsArray";
import rokuMaterialTheme from "./rokuMaterialTheme.js";
import Search from "./utils/Search";
import "./index.css";

const defaultFilters = {
  type: "any type",
  imageType: "any image type",
  aspectRatio: "any aspect ratio",
  trc: false,
  locale: "en_US",
};
const Gear = ({ onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      stroke="#6200ee"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm5-2h-.6a1 1 0 0 1-1-.7 1 1 0 0 1 .3-1.1l.4-.4a1 1 0 0 0 0-1.4l-1.4-1.5a1 1 0 0 0-1.5 0l-.4.4a1 1 0 0 1-1.1.2 1 1 0 0 1-.7-1V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.6a1 1 0 0 1-.7 1 1 1 0 0 1-1.1-.3L7.8 5a1 1 0 0 0-1.4 0L4.9 6.3a1 1 0 0 0 0 1.5l.4.4a1 1 0 0 1 .2 1.1 1 1 0 0 1-.9.7H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.6a1 1 0 0 1 1 .7 1 1 0 0 1-.3 1l-.4.5a1 1 0 0 0 0 1.4L6.3 19a1 1 0 0 0 1.5 0l.4-.4a1 1 0 0 1 1.1-.2 1 1 0 0 1 .7 1v.6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.6a1 1 0 0 1 .6-1 1 1 0 0 1 1.2.3l.4.4a1 1 0 0 0 1.4 0l1.4-1.4a1 1 0 0 0 0-1.4l-.4-.5a1 1 0 0 1-.2-1.1 1 1 0 0 1 1-.7h.6a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z"
    />
  </svg>
);

const Magpie = () => {
  const searchInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [resultsDetails, setResultsDetails] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [expandedResultIdx, setExpandedResultIdx] = useState(-1);
  const [viewDetailIdx, setViewDetailIdx] = useState(-1);
  const [connectionError, setConnectionError] = useState<string | boolean>(false);
  const [isCheckingVPN, setIsCheckingVPN] = useState(true);

  const [consoleData, setConsoleData] = useState([]);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [insertWidth, setInsertWidth] = useState("2x");
  const [fillMode, setFillMode] = useState("smart"); // "smart", "all", "parent"

  useHotkeys("ctrl + `", () => {
    setConsoleOpen((consoleOpen) => !consoleOpen);
  });

  useEffect(() => {
    // Check VPN connection first by attempting an initial search
    setIsCheckingVPN(true);
    performSearchDebounced.current("", filters);
  }, []);
  useEffect(() => {
    onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === "savedInsertWidth") {
        if (validInsertWidths.includes(msg.savedInsertWidth)) {
          setInsertWidth(msg.savedInsertWidth);
        }
      }
      if (msg?.type === "savedFillMode") {
        // Always expect "smart" on plugin restart
        setFillMode("smart");
      }
      if (msg?.type === "newIdsFromSelection") {
        setConsoleData((consoleData) => [msg.ids.join("\n"), ...consoleData]);
      }
      if (msg?.type === "nodes for insertion") {
        const { id, imageURL, maxWidth, nodeIds } = msg;
        let urlSuffix;
        if (insertWidth === "1920" || insertWidth === "1280") {
          urlSuffix = "/presets/" + getPresetByWidth(Number(insertWidth));
        }
        if (insertWidth === "1x") {
          urlSuffix = "/presets/" + getPresetByWidth(Math.min(1920, maxWidth));
        }
        if (insertWidth === "2x") {
          urlSuffix = "/presets/" + getPresetByWidth(Math.min(1920, maxWidth * 2));
        }
        getImageAsArray({
          url: imageURL,
          urlSuffix,
          callback: ({ imgAsArray }) => {
            parent.postMessage(
              {
                pluginMessage: { type: "insert image to nodes by id", imgAsArray, id, nodeIds },
              },
              "*",
            );
          },
        });
      }
      if (msg?.type === "insert without selection") {
        const { id, imageURL } = msg;
        let urlSuffix;
        if (insertWidth === "1280") {
          urlSuffix = "/presets/" + getPresetByWidth(1280);
        } else {
          urlSuffix = "/presets/" + getPresetByWidth(1920);
        }
        getImageAsArray({
          url: imageURL,
          urlSuffix,
          callback: ({ imgAsArray, width, height }) => {
            parent.postMessage(
              {
                pluginMessage: { type: "insert image without selection", imgAsArray, id, width, height },
              },
              "*",
            );
          },
        });
      }
      if (msg?.type === "nodes for random insertion") {
        const { nodeIds, availableImages, maxWidth } = msg;
        
        // Shuffle and assign different images to different nodes
        const shuffledImages = [...availableImages].sort(() => Math.random() - 0.5);
        const imageAssignments = nodeIds.map((nodeId, index) => ({
          nodeId,
          imageData: shuffledImages[index % shuffledImages.length]
        }));
        
        // Process each image assignment
        const imagePromises = imageAssignments.map(({ nodeId, imageData }) => {
          return new Promise((resolve) => {
            let urlSuffix;
            if (insertWidth === "1920" || insertWidth === "1280") {
              urlSuffix = "/presets/" + getPresetByWidth(Number(insertWidth));
            }
            if (insertWidth === "1x") {
              urlSuffix = "/presets/" + getPresetByWidth(Math.min(1920, maxWidth));
            }
            if (insertWidth === "2x") {
              urlSuffix = "/presets/" + getPresetByWidth(Math.min(1920, maxWidth * 2));
            }
            
            getImageAsArray({
              url: imageData.imageURL,
              urlSuffix,
              callback: ({ imgAsArray }) => {
                resolve({
                  nodeId,
                  imgAsArray,
                  id: imageData.id
                });
              },
            });
          });
        });
        
        // Wait for all images to be processed, then send to plugin
        Promise.all(imagePromises).then((processedImages) => {
          parent.postMessage(
            {
              pluginMessage: {
                type: "insert random images to nodes",
                imageAssignments: processedImages
              },
            },
            "*",
          );
        });
      }
    };
  }, [insertWidth]);

  const getDetailsByIds = async (ids, locale) => {
    try {
      const data = await StreamingData.getNormalizedInfos(ids, null, locale);
      if (data && Array.isArray(data)) {
        setResultsDetails(data);
        setConnectionError(false);
      } else if (data && typeof data === 'object' && 'error' in data) {
        setConnectionError((data as any).error || true);
      } else {
        setConnectionError(true);
      }
    } catch (error) {
      setConnectionError((error as Error)?.message || true);
    }
  };

  const retryConnection = () => {
    setIsCheckingVPN(true);
    setConnectionError(false);
    performSearchDebounced.current("", filters);
  };

  // passing in filters since this function won't have access to the current state once debounced
  const performSearch = (searchString: string, currentFilters) => {
    setExpandedResultIdx(-1);
    const typeFilter =
      currentFilters.type === defaultFilters.type
        ? {}
        : {
            rules: [
              {
                ruleOp: "EQ",
                field: "programType",
                value: currentFilters.type,
              },
            ],
          };
    Search.filterSearch(handleSearchResults, searchString, typeFilter, 1, currentFilters.trc, currentFilters.locale);
  };
  const performSearchDebounced = useRef(debounce(performSearch, 500));
  const handleSearchResults = (data: any, locale: string) => {
    setIsCheckingVPN(false);
    if (!data || data.error) {
      setConnectionError(data?.error || true);
    } else if (data.hasOwnProperty("items") && data.items?.length > 0) {
      const ids = data.items.map((item: any) => item.id);
      getDetailsByIds(ids, locale);
    } else {
      // Handle case where search succeeds but returns no results
      setResultsDetails([]);
      setConnectionError(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    performSearchDebounced.current(event.target.value, filters);
  };

  const handleFiltersChange = (newFilters) => {
    setExpandedResultIdx(-1);
    if (filters.type !== newFilters.type || filters.trc !== newFilters.trc || filters.locale !== newFilters.locale) {
      performSearchDebounced.current(searchValue, newFilters);
    }
    setFilters(newFilters);
  };

  const handleRandomImageInsertion = () => {
    // Collect all available images from current search results
    const allAvailableImages = [];
    
    matchingImages.forEach((images, index) => {
      if (images.length > 0) {
        const { id, title, meta: { mediaType } } = resultsDetails[index];
        // Use the same getPreferredImage logic as the tiles
        const preferredImageURL = getPreferredImage(mediaType, images, filters.imageType, filters.aspectRatio, title);
        if (preferredImageURL) {
          allAvailableImages.push({
            id,
            imageURL: preferredImageURL,
            mediaType
          });
        }
      }
    });
    
    if (allAvailableImages.length > 0) {
      parent.postMessage({
        pluginMessage: {
          type: 'get selection for random insertion',
          availableImages: allAvailableImages,
          fillMode: fillMode
        }
      }, '*');
    }
  };

  const matchingImages = resultsDetails.map((item) => {
    return item.images.filter((image) => {
      return (
        (filters.imageType === defaultFilters.imageType ||
          image.type === filters.imageType ||
          (filters.imageType === "epg" && image.type.indexOf("epg") > -1)) &&
        (filters.aspectRatio === defaultFilters.aspectRatio || image.aspectRatio === filters.aspectRatio)
      );
    });
  });

  // Debug logging for filtered results
  React.useEffect(() => {
    if (resultsDetails.length > 0) {
      const totalImages = matchingImages.reduce((total, images) => total + images.length, 0);
    }
  }, [resultsDetails, matchingImages, filters]);

  // Create sorted indices: items with matching images first, then items without
  const sortedIndices = React.useMemo(() => {
    const indices = Array.from({ length: resultsDetails.length }, (_, index) => index)
      .sort((a, b) => {
        const aHasImages = matchingImages[a].length > 0;
        const bHasImages = matchingImages[b].length > 0;
        
        // Items with images come first (true > false in descending sort)
        if (aHasImages !== bHasImages) {
          return bHasImages ? 1 : -1;
        }
        
        // If both have same status (both have images or both don't), maintain original order
        return a - b;
      });
    
    return indices;
  }, [resultsDetails.length, matchingImages]);

  const tilesToRender = sortedIndices.map((originalIndex, sortedPosition) => {
    const images = matchingImages[originalIndex];
    const {
      title,
      id,
      meta: { mediaType },
    } = resultsDetails[originalIndex];

    return (
      <ImageTile
        key={originalIndex}
        id={id}
        title={title}
        imageURL={getPreferredImage(mediaType, images, filters.imageType, filters.aspectRatio, title)}
        numMatches={images.length}
        expanded={originalIndex === expandedResultIdx}
        handleShowMore={() => {
          setExpandedResultIdx(expandedResultIdx === originalIndex ? -1 : originalIndex);
        }}
        handleViewDetails={() => {
          setViewDetailIdx(originalIndex);
        }}
        hideViewMore={false}
        type={null}
        fillMode={fillMode}
      />
    );
  });

  // insert the view-more panel
  if (expandedResultIdx >= 0) {
    const moreImages = matchingImages[expandedResultIdx];
    // Find the position of the expanded item in the sorted list
    const sortedPosition = sortedIndices.findIndex(index => index === expandedResultIdx);
    const insertionIndex = sortedPosition % 2 === 0 ? sortedPosition + 2 : sortedPosition + 1;
    tilesToRender.splice(
      insertionIndex,
      0,
      <div key={"view-more"} className="view-more-images-panel">
        {moreImages.map((image, index) => (
          <ImageTile
            key={index}
            id={resultsDetails[expandedResultIdx].id}
            imageURL={image.path}
            type={image.type}
            title={resultsDetails[expandedResultIdx].title}
            numMatches={1}
            expanded={false}
            handleShowMore={() => {}}
            handleViewDetails={() => {}}
            hideViewMore={true}
            fillMode={fillMode}
          />
        ))}
      </div>,
    );
  }

  return (
    <>
      <AnimatePresence>
        {consoleOpen ? (
          <motion.div
            className="data-console"
            initial={{ opacity: 0, x: 150 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0, 0, 0.3, 1] } }}
            exit={{ opacity: 0, x: 150, transition: { duration: 0.2, ease: [0.85, 0, 1, 1] } }}
          >
            <DataConsole
              data={consoleData}
              onBackClick={() => {
                setConsoleOpen(false);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen ? (
          <motion.div
            className="detail-view"
            initial={{ opacity: 0, x: 150 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0, 0, 0.3, 1] } }}
            exit={{ opacity: 0, x: 150, transition: { duration: 0.2, ease: [0.85, 0, 1, 1] } }}
          >
            <SettingsView
              insertWidth={insertWidth}
              setInsertWidth={setInsertWidth}
              fillMode={fillMode}
              setFillMode={setFillMode}
              onBackClick={() => {
                setSettingsOpen(false);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {viewDetailIdx >= 0 ? (
          <motion.div
            key={viewDetailIdx}
            className="detail-view"
            initial={{ opacity: 0, x: 150 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.35, ease: [0, 0, 0.3, 1] } }}
            exit={{ opacity: 0, x: 150, transition: { duration: 0.2, ease: [0.85, 0, 1, 1] } }}
          >
            <DetailView
              data={resultsDetails[viewDetailIdx]}
              onBackClick={() => {
                setViewDetailIdx(-1);
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="search">
        <div className="row">
          <SearchInput
            value={searchValue}
            searchInputRef={searchInputRef}
            onChange={handleSearchChange}
            clearSearch={() => {
              setSearchValue("");
              performSearchDebounced.current("", filters);
              searchInputRef.current.focus();
            }}
          />
          <Gear onClick={() => setSettingsOpen(true)} />
        </div>
        <FilterDropdowns filters={filters} setFilters={handleFiltersChange} />
        <div className="random-button-container">
          <button
            className="random-button"
            onClick={() => {
              handleRandomImageInsertion();
            }}
            disabled={matchingImages.length === 0 || matchingImages.every(images => images.length === 0)}
          >
            Insert Random Images
          </button>
        </div>
      </div>

      {isCheckingVPN ? (
        <div className="error-state-container">
          <VPNCheckingState />
        </div>
      ) : connectionError ? (
        <div className="error-state-container">
          <ConnectionError error={connectionError} onRetry={retryConnection} />
        </div>
      ) : tilesToRender.length === 0 ? (
        <div className="error-state-container">
          <EmptyState
            searchValue={searchValue}
            hasFilters={JSON.stringify(filters) !== JSON.stringify(defaultFilters)}
          />
        </div>
      ) : (
        <div className="columns two">{tilesToRender}</div>
      )}
    </>
  );
};

const theme = createTheme(rokuMaterialTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Magpie />
    </ThemeProvider>
  </React.StrictMode>,
);
