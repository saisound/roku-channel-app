const MAX_WIDTH = 1920;

figma.showUI(__html__, { width: 476, height: 680 });

figma.root.setRelaunchData({ relaunch: "" });

const isFillableNode = (node) =>
  node.type === "FRAME" ||
  node.type === "ELLIPSE" ||
  node.type === "POLYGON" ||
  node.type === "RECTANGLE" ||
  node.type === "STAR" ||
  node.type === "VECTOR";

const hasImageFill = (node) => {
  if (!('fills' in node) || !node.fills) return false;
  return Array.isArray(node.fills) && node.fills.some(fill => fill.type === 'IMAGE');
};

const isFillableNodeWithFills = (node): node is FrameNode | EllipseNode | PolygonNode | RectangleNode | StarNode | VectorNode => {
  return isFillableNode(node) && 'fills' in node;
};

const getFillableNodesFromSelection = (fillMode = "smart") => {
  let selection = figma.currentPage.selection;

  if (fillMode === "smart") {
    return getFillableNodesWithImagePriority(selection);
  } else if (fillMode === "all") {
    return getFillableNodes(selection);
  } else if (fillMode === "parent") {
    return getFillableParentNodes(selection);
  } else if (fillMode === "children") {
    return getFillableChildrenNodes(selection);
  }

  // Default to smart behavior
  return getFillableNodesWithImagePriority(selection);
};

const getFillableParentNodes = (nodes: readonly SceneNode[]) => {
  const fillableNodes = [];
  nodes.forEach((node) => {
    // In parent-only mode, if the node itself is fillable, add it regardless of children
    if (isFillableNode(node)) {
      fillableNodes.push(node);
    }
    // Don't recurse into children for parent-only mode
    // This ensures frames get filled directly instead of their children
  });
  return fillableNodes;
};

const getFillableChildrenNodes = (nodes: readonly SceneNode[]) => {
  const fillableNodes = [];
  nodes.forEach((node) => {
    // In children-only mode, ignore the parent and only get children
    if ('children' in node && node.children?.length) {
      const fillableChildren = getFillableNodes(node.children);
      fillableNodes.push(...fillableChildren);
    }
    // Don't add the parent node itself, only its children
  });
  return fillableNodes;
};

const getFillableNodesWithImagePriority = (nodes: readonly SceneNode[]) => {
  // Collect all fillable nodes from the selection first
  const allFillableNodes = [];
  
  const collectAllFillableNodes = (nodes: readonly SceneNode[]) => {
    nodes.forEach((node) => {
      if (isFillableNode(node)) {
        allFillableNodes.push(node);
      }
      if ('children' in node && node.children?.length) {
        collectAllFillableNodes(node.children);
      }
    });
  };
  
  collectAllFillableNodes(nodes);
  
  // Now analyze holistically: if any nodes have images, prioritize replacing those
  const nodesWithImages = allFillableNodes.filter(node => hasImageFill(node));
  const nodesWithoutImages = allFillableNodes.filter(node => !hasImageFill(node));
  
  // Smart fill mode logic - look at all nodes together:
  // If there are existing images, replace those first
  if (nodesWithImages.length > 0) {
    return nodesWithImages;
  }
  
  // If no existing images, apply the hierarchical logic per selection root
  const result = [];

  const getDirectFillableChildren = (node) => {
    if (!('children' in node) || !node.children?.length) {
      return [];
    }
    return node.children.filter(child => isFillableNode(child));
  };

  const processNodes = (nodes: readonly SceneNode[]) => {
    nodes.forEach((node) => {
      if ('children' in node && node.children?.length) {
        const isParentFillable = isFillableNode(node);
        
        if (isParentFillable) {
          const parentHasImage = hasImageFill(node);

          // Get direct fillable children only
          const directFillableChildren = getDirectFillableChildren(node);
          const directChildrenWithImages = directFillableChildren.filter(child => hasImageFill(child));
          const directChildrenWithoutImages = directFillableChildren.filter(child => !hasImageFill(child));
          
          // Hierarchical logic for nodes without existing images:
          // Parent (not filled) + Children (not filled) -> update children (or recurse if no direct children)
          if (!parentHasImage && directChildrenWithImages.length === 0) {
            if (directChildrenWithoutImages.length > 0) {
              result.push(...directChildrenWithoutImages);
            } else {
              // No direct fillable children, recurse to find deeper fillable nodes
              const deeperFillableNodes = getFillableNodes(node.children);
              if (deeperFillableNodes.length > 0) {
                result.push(...deeperFillableNodes);
              } else {
                // No fillable descendants at all, fill the parent
                result.push(node);
              }
            }
          }
        } else {
          // Parent is not fillable, process children recursively
          processNodes(node.children);
        }
      } else if (isFillableNode(node)) {
        // Node has no children, process it directly
        result.push(node);
      }
    });
  };

  processNodes(nodes);
  return result;
};

const getFillableNodes = (nodes: readonly SceneNode[]) => {
  const fillableNodes = [];
  nodes.forEach((node) => {
    if ('children' in node && node.children?.length) {
      const fillableChildren = getFillableNodes(node.children);
      fillableNodes.push(...fillableChildren);
      if (fillableChildren.length > 0) {
        return; // don't fill this node if it has fillable children (frame with child rect, etc)
      }
    }
    if (isFillableNode(node)) {
      fillableNodes.push(node);
    }
  });
  return fillableNodes;
};

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  const { imageURL, id, fillMode } = msg;
  if (msg.type === "get selection for insertion") {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const fillableNodes = getFillableNodesFromSelection(fillMode);
      if (fillableNodes.length > 0) {
        const nodeIds = fillableNodes.map((node) => node.id);
        const nodeWidths = fillableNodes.map((node) => node.width);
        const maxWidth = Math.max(...nodeWidths);
        figma.ui.postMessage({ type: "nodes for insertion", nodeIds, maxWidth, imageURL, id });
      } else {
        figma.notify(
          `No fillable nodes found in selection. Please select a frame, ellipse, polygon, rectangle, star, or vector.`,
        );
      }
    } else {
      figma.ui.postMessage({ type: "insert without selection", imageURL, id });
    }
  }

  if (msg.type === "get selection for random insertion") {
    const { availableImages, fillMode } = msg;
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const fillableNodes = getFillableNodesFromSelection(fillMode);
      if (fillableNodes.length > 0) {
        const nodeIds = fillableNodes.map((node) => node.id);
        const nodeWidths = fillableNodes.map((node) => node.width);
        const maxWidth = Math.max(...nodeWidths);
        figma.ui.postMessage({
          type: "nodes for random insertion",
          nodeIds,
          maxWidth,
          availableImages
        });
      } else {
        figma.notify(
          `No fillable nodes found in selection. Please select a frame, ellipse, polygon, rectangle, star, or vector.`,
        );
      }
    } else {
      figma.notify("Please select some objects to fill with random images.");
    }
  }

  if (msg.type === "insert image to nodes by id") {
    const { nodeIds, imgAsArray, id } = msg;
    const hash = figma.createImage(imgAsArray).hash;
    const nodePromises = nodeIds.map((nodeId) => figma.getNodeByIdAsync(nodeId));
    const nodes = await Promise.all(nodePromises);
    let successCount = 0;
    let replacedCount = 0;
    let addedCount = 0;

    nodes.forEach((node) => {
      if (node && isFillableNodeWithFills(node)) {
        const hadImage = hasImageFill(node);
        node.setPluginData("id", id);
        node.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }];
        successCount++;

        if (hadImage) {
          replacedCount++;
        } else {
          addedCount++;
        }
      }
    });

    if (successCount > 0) {
      if (replacedCount > 0 && addedCount > 0) {
        figma.notify(`Replaced ${replacedCount} image(s) and added ${addedCount} new image(s)!`);
      } else if (replacedCount > 0) {
        figma.notify(`Successfully replaced ${replacedCount} image(s)!`);
      } else {
        figma.notify(`Successfully added ${addedCount} new image(s)!`);
      }
    }
  }

  if (msg.type === "insert random images to nodes") {
    const { imageAssignments } = msg;
    let replacedCount = 0;
    let addedCount = 0;
    
    // Process each image assignment sequentially
    for (const assignment of imageAssignments) {
      const { nodeId, imgAsArray, id } = assignment;
      const hash = figma.createImage(imgAsArray).hash;
      const node = await figma.getNodeByIdAsync(nodeId);
      
      if (node && isFillableNodeWithFills(node)) {
        const hadImage = hasImageFill(node);
        node.setPluginData("id", id);
        node.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }];

        if (hadImage) {
          replacedCount++;
        } else {
          addedCount++;
        }
      }
    }
    
    const totalCount = replacedCount + addedCount;
    if (totalCount > 0) {
      if (replacedCount > 0 && addedCount > 0) {
        figma.notify(`Replaced ${replacedCount} image(s) and added ${addedCount} new image(s)!`);
      } else if (replacedCount > 0) {
        figma.notify(`Successfully replaced ${replacedCount} image(s)!`);
      } else {
        figma.notify(`Successfully added ${addedCount} new image(s)!`);
      }
    }
  }

  if (msg.type === "insert image without selection") {
    const { imgAsArray, id, width, height } = msg;
    const hash = figma.createImage(imgAsArray).hash;
    const rect = figma.createRectangle();
    const viewport = figma.viewport.center;
    const scaleRatio = Math.min(1, MAX_WIDTH / width);
    const scaledWidth = width * scaleRatio;
    const scaledHeight = height * scaleRatio;
    rect.x = viewport.x - scaledWidth / 2;
    rect.y = viewport.y - scaledHeight / 2;
    rect.resize(scaledWidth, scaledHeight);
    rect.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: hash }];
    rect.setPluginData("id", id);
    figma.currentPage.appendChild(rect);
  }

  if (msg.type === "save insert width") {
    figma.clientStorage.setAsync("insertWidth", msg.insertWidth);
  }

  // Remove the save fill mode functionality - we want it to reset to "smart" on every plugin restart
};

figma.on("selectionchange", () => {
  const ids = [];
  const fillableNodes = getFillableNodesFromSelection("smart"); // Use smart mode for selection change
  fillableNodes.forEach((node) => {
    const id = node.getPluginData("id");
    if (id) {
      ids.push(id);
    }
  });
  if (ids.length > 0) {
    figma.ui.postMessage({ type: "newIdsFromSelection", ids });
  }
});

const checkForSavedInsertWidth = async () => {
  const savedInsertWidth = await figma.clientStorage.getAsync("insertWidth");
  figma.ui.postMessage({ type: "savedInsertWidth", savedInsertWidth });
};

const checkForSavedFillMode = async () => {
  // Always default to "smart" on plugin restart, don't persist this setting
  figma.ui.postMessage({ type: "savedFillMode", savedFillMode: "smart" });
};

checkForSavedInsertWidth();
checkForSavedFillMode();